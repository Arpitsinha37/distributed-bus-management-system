import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CampaignService } from '../campaign/campaign.service';
import { EmailSubscriberService } from '../email-subscriber/email-subscriber.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AutomationService {
    private readonly logger = new Logger(AutomationService.name);

    constructor(
        private prisma: PrismaService,
        private campaignService: CampaignService,
    ) { }

    // ─────────────────────────────────────────────────────────────
    // CRUD for Workflows
    // ─────────────────────────────────────────────────────────────

    async createWorkflow(data: {
        name: string;
        description?: string;
        triggerType: string;
        triggerConfig: any;
        conditions: any;
        actions: any;
        isActive?: boolean;
    }) {
        return this.prisma.automationWorkflow.create({
            data: {
                name: data.name,
                description: data.description,
                triggerType: data.triggerType,
                triggerConfig: data.triggerConfig || {},
                conditions: data.conditions || {},
                actions: data.actions || [],
                isActive: data.isActive || false,
            },
        });
    }

    async getWorkflows() {
        return this.prisma.automationWorkflow.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { enrollments: true } } },
        });
    }

    async getWorkflow(id: string) {
        const wf = await this.prisma.automationWorkflow.findUnique({
            where: { id },
            include: { enrollments: { take: 50, orderBy: { enrolledAt: 'desc' }, include: { subscriber: true } } },
        });
        if (!wf) throw new NotFoundException('Workflow not found');
        return wf;
    }

    async updateWorkflow(id: string, data: any) {
        return this.prisma.automationWorkflow.update({ where: { id }, data });
    }

    async toggleStatus(id: string, isActive: boolean) {
        return this.prisma.automationWorkflow.update({ where: { id }, data: { isActive } });
    }

    async deleteWorkflow(id: string) {
        return this.prisma.automationWorkflow.delete({ where: { id } });
    }

    // ─────────────────────────────────────────────────────────────
    // EVENT-DRIVEN TRIGGER
    // Called by EmailSubscriberService when an event is logged
    // ─────────────────────────────────────────────────────────────
    async handleEvent(subscriberId: string, eventType: string, eventData: any) {
        // Find active workflows listening to this event type
        const activeEventWorkflows = await this.prisma.automationWorkflow.findMany({
            where: { isActive: true, triggerType: 'event_based' },
        });

        // Filter those that match the specific event
        const matchingWorkflows = activeEventWorkflows.filter(wf => {
            const config = wf.triggerConfig as any;
            if (config.eventType !== eventType) return false;
            // e.g. { eventType: 'page_visited', dataKey: 'url', dataValue: '/tours/pokhara' }
            if (config.dataKey && config.dataValue) {
                if (eventData[config.dataKey] !== config.dataValue) return false;
            }
            return true;
        });

        for (const wf of matchingWorkflows) {
            await this.processWorkflowForSubscriber(wf, subscriberId);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // SCHEDULE-BASED TRIGGER (Cron Job)
    // ─────────────────────────────────────────────────────────────
    @Cron(CronExpression.EVERY_HOUR)
    async handleScheduledWorkflows() {
        this.logger.log('Running scheduled automations...');
        const activeScheduledWorkflows = await this.prisma.automationWorkflow.findMany({
            where: { isActive: true, triggerType: 'schedule_based' },
        });

        if (activeScheduledWorkflows.length === 0) return;

        // For simplicity, schedule-based workflows check all active subscribers
        // Optimization: In Phase 2, query based on condition directly
        const subscribers = await this.prisma.emailSubscriber.findMany({
            where: { status: 'active' },
            include: { tags: true },
        });

        for (const wf of activeScheduledWorkflows) {
            for (const sub of subscribers) {
                await this.processWorkflowForSubscriber(wf, sub.id, sub);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // CORE EXECUTION ENGINE
    // ─────────────────────────────────────────────────────────────
    private async processWorkflowForSubscriber(workflow: any, subscriberId: string, subscriberData?: any) {
        // 1. Check if already enrolled to prevent duplicate firing
        const existing = await this.prisma.automationEnrollment.findUnique({
            where: { workflowId_subscriberId: { workflowId: workflow.id, subscriberId } },
        });

        if (existing) {
            // Already entered this workflow
            return;
        }

        // 2. Fetch full subscriber profile if not provided
        const sub = subscriberData || await this.prisma.emailSubscriber.findUnique({
            where: { id: subscriberId },
            include: { tags: true },
        });

        if (!sub || sub.status !== 'active') return;

        // 3. Evaluate Conditions
        const conditions = workflow.conditions as any;
        const isMatch = this.evaluateConditionTree(conditions, sub);

        if (!isMatch) return;

        // 4. Enroll & Execute
        this.logger.log(`Enrolling subscriber ${sub.email} into workflow ${workflow.name}`);
        const enrollment = await this.prisma.automationEnrollment.create({
            data: { workflowId: workflow.id, subscriberId, status: 'enrolled', logs: [{ time: new Date(), msg: 'Enrolled' }] },
        });
        await this.prisma.automationWorkflow.update({ where: { id: workflow.id }, data: { enrollCount: { increment: 1 } } });

        const actions = workflow.actions as any[];
        const logs = enrollment.logs as any[];

        try {
            for (const action of actions) {
                logs.push({ time: new Date(), msg: `Executing ${action.type}` });

                // Execute action
                if (action.type === 'send_email') {
                    // Internal private method in CampaignService isn't accessible, we might need a public method or use EmailService
                    // For now, we assume campaignService has a public method or we do it here.
                    await this.campaignService.sendTestEmail(action.campaignId, sub.email);
                    logs.push({ time: new Date(), msg: `Sent campaign ${action.campaignId}` });
                }
                else if (action.type === 'add_tag') {
                    await this.prisma.subscriberTag.upsert({
                        where: { subscriberId_category_value: { subscriberId, category: action.category || 'auto', value: action.value } },
                        create: { subscriberId, category: action.category || 'auto', value: action.value },
                        update: {},
                    });
                    logs.push({ time: new Date(), msg: `Added tag ${action.value}` });
                }
                else if (action.type === 'increment_score') {
                    await this.prisma.emailSubscriber.update({
                        where: { id: subscriberId },
                        data: { leadScore: { increment: Number(action.amount) || 10 } },
                    });
                    logs.push({ time: new Date(), msg: `Incremented score by ${action.amount}` });
                }
            }

            // Mark as complete
            logs.push({ time: new Date(), msg: 'Completed successfully' });
            await this.prisma.automationEnrollment.update({
                where: { id: enrollment.id },
                data: { status: 'completed', logs, completedAt: new Date() },
            });
            await this.prisma.automationWorkflow.update({ where: { id: workflow.id }, data: { completeCount: { increment: 1 } } });

        } catch (error: any) {
            this.logger.error(`Workflow ${workflow.id} failed for sub ${subscriberId}: ${error.message}`);
            logs.push({ time: new Date(), msg: `FAILED: ${error.message}` });
            await this.prisma.automationEnrollment.update({
                where: { id: enrollment.id },
                data: { status: 'failed', logs },
            });
        }
    }

    // ─────────────────────────────────────────────────────────────
    // CONDITION EVALUATOR (AND / OR Tree Parser)
    // ─────────────────────────────────────────────────────────────
    private evaluateConditionTree(condition: any, subscriber: any): boolean {
        // If empty condition, always match
        if (!condition || Object.keys(condition).length === 0) return true;

        if (condition.op === 'AND') {
            if (!condition.rules || condition.rules.length === 0) return true;
            return condition.rules.every((rule: any) => this.evaluateRuleOrTree(rule, subscriber));
        }

        if (condition.op === 'OR') {
            if (!condition.rules || condition.rules.length === 0) return true;
            return condition.rules.some((rule: any) => this.evaluateRuleOrTree(rule, subscriber));
        }

        // Just a single rule
        return this.evaluateRule(condition, subscriber);
    }

    private evaluateRuleOrTree(node: any, subscriber: any): boolean {
        if (node.op === 'AND' || node.op === 'OR') {
            return this.evaluateConditionTree(node, subscriber);
        }
        return this.evaluateRule(node, subscriber);
    }

    private evaluateRule(rule: any, subscriber: any): boolean {
        const { field, operator, value } = rule;

        let subValue: any;

        // Custom field logic
        if (field === 'tag') {
            const hasTag = subscriber.tags?.some((t: any) => t.value.toLowerCase() === String(value).toLowerCase());
            if (operator === 'contains' || operator === 'equals') return hasTag;
            if (operator === 'not_contains') return !hasTag;
            return false;
        }

        // Standard fields
        if (field === 'city' || field === 'budgetTier' || field === 'source') {
            subValue = subscriber[field]?.toLowerCase();
            const val = String(value).toLowerCase();
            switch (operator) {
                case 'equals': return subValue === val;
                case 'not_equals': return subValue !== val;
                case 'contains': return subValue?.includes(val);
                default: return false;
            }
        }

        if (field === 'leadScore') {
            subValue = Number(subscriber[field]);
            const val = Number(value);
            switch (operator) {
                case 'gt': return subValue > val;
                case 'gte': return subValue >= val;
                case 'lt': return subValue < val;
                case 'lte': return subValue <= val;
                case 'equals': return subValue === val;
                default: return false;
            }
        }

        return false;
    }
}
