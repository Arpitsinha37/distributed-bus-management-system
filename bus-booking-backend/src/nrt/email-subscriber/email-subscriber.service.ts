import { Injectable, ConflictException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AutomationService } from '../automation/automation.service';

@Injectable()
export class EmailSubscriberService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => AutomationService))
        private automationService: AutomationService
    ) { }

    // ── Enhanced listing with search, filter, sort, pagination ──
    async findAll(query: {
        page?: number; limit?: number;
        search?: string; city?: string; status?: string;
        source?: string; budgetTier?: string;
        minScore?: number; maxScore?: number;
        tag?: string; tagCategory?: string;
        sortBy?: string; sortOrder?: string;
    }) {
        const page = query.page || 1;
        const limit = query.limit || 25;
        const where: any = {};

        if (query.search) {
            where.OR = [
                { email: { contains: query.search, mode: 'insensitive' } },
                { name: { contains: query.search, mode: 'insensitive' } },
                { phone: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.city) where.city = { equals: query.city, mode: 'insensitive' };
        if (query.status) where.status = query.status;
        if (query.source) where.source = query.source;
        if (query.budgetTier) where.budgetTier = query.budgetTier;
        if (query.minScore !== undefined || query.maxScore !== undefined) {
            where.leadScore = {};
            if (query.minScore !== undefined) where.leadScore.gte = query.minScore;
            if (query.maxScore !== undefined) where.leadScore.lte = query.maxScore;
        }
        if (query.tag || query.tagCategory) {
            where.tags = { some: {} };
            if (query.tag) where.tags.some.value = { equals: query.tag, mode: 'insensitive' };
            if (query.tagCategory) where.tags.some.category = query.tagCategory;
        }

        const orderBy: any = {};
        const sortField = query.sortBy || 'subscribedAt';
        const sortDir = query.sortOrder || 'desc';
        orderBy[sortField] = sortDir;

        const [data, total] = await Promise.all([
            this.prisma.emailSubscriber.findMany({
                where,
                include: { tags: true, _count: { select: { events: true } } },
                skip: (page - 1) * limit,
                take: limit,
                orderBy,
            }),
            this.prisma.emailSubscriber.count({ where }),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    // ── Stats for dashboard cards ──
    async getStats() {
        const [total, active, hotLeads, warmLeads, coldLeads, dormant, cities, sources] = await Promise.all([
            this.prisma.emailSubscriber.count(),
            this.prisma.emailSubscriber.count({ where: { status: 'active' } }),
            this.prisma.emailSubscriber.count({ where: { leadScore: { gte: 70 } } }),
            this.prisma.emailSubscriber.count({ where: { leadScore: { gte: 40, lt: 70 } } }),
            this.prisma.emailSubscriber.count({ where: { leadScore: { gte: 10, lt: 40 } } }),
            this.prisma.emailSubscriber.count({ where: { leadScore: { lt: 10 } } }),
            this.prisma.emailSubscriber.groupBy({ by: ['city'], _count: true, orderBy: { _count: { city: 'desc' } }, where: { city: { not: null } }, take: 10 }),
            this.prisma.emailSubscriber.groupBy({ by: ['source'], _count: true, orderBy: { _count: { source: 'desc' } }, where: { source: { not: null } } }),
        ]);

        return { total, active, hotLeads, warmLeads, coldLeads, dormant, topCities: cities, topSources: sources };
    }

    // ── Single subscriber profile with tags + recent events ──
    async getProfile(id: string) {
        const subscriber = await this.prisma.emailSubscriber.findUnique({
            where: { id },
            include: {
                tags: { orderBy: { createdAt: 'desc' } },
                events: { orderBy: { createdAt: 'desc' }, take: 50 },
            },
        });
        if (!subscriber) throw new NotFoundException('Subscriber not found');
        return subscriber;
    }

    // ── Subscribe (public — from website) ──
    async subscribe(email: string, source?: string) {
        const exists = await this.prisma.emailSubscriber.findUnique({ where: { email } });
        if (exists) throw new ConflictException('Already subscribed');
        return this.prisma.emailSubscriber.create({
            data: { email, source: source || 'homepage' },
        });
    }

    // ── Update subscriber profile ──
    async update(id: string, data: { name?: string; phone?: string; city?: string; budgetTier?: string; status?: string; leadScore?: number }) {
        return this.prisma.emailSubscriber.update({ where: { id }, data });
    }

    // ── Delete ──
    async remove(id: string) {
        return this.prisma.emailSubscriber.delete({ where: { id } });
    }

    // ── Bulk delete ──
    async bulkDelete(ids: string[]) {
        return this.prisma.emailSubscriber.deleteMany({ where: { id: { in: ids } } });
    }

    // ── Bulk tag ──
    async bulkTag(ids: string[], tags: { category: string; value: string }[]) {
        const operations = [];
        for (const subscriberId of ids) {
            for (const tag of tags) {
                operations.push(
                    this.prisma.subscriberTag.upsert({
                        where: { subscriberId_category_value: { subscriberId, category: tag.category, value: tag.value } },
                        create: { subscriberId, category: tag.category, value: tag.value },
                        update: {},
                    }),
                );
            }
        }
        await Promise.all(operations);

        // Log tag events
        const eventOps = ids.map(subscriberId =>
            this.prisma.subscriberEvent.create({
                data: { subscriberId, eventType: 'tag_added', eventData: { tags } },
            }),
        );
        await Promise.all(eventOps);

        return { success: true, tagged: ids.length, tags: tags.length };
    }

    // ── Add tags to a single subscriber ──
    async addTags(subscriberId: string, tags: { category: string; value: string }[]) {
        const operations = tags.map(tag =>
            this.prisma.subscriberTag.upsert({
                where: { subscriberId_category_value: { subscriberId, category: tag.category, value: tag.value } },
                create: { subscriberId, category: tag.category, value: tag.value },
                update: {},
            }),
        );
        return Promise.all(operations);
    }

    // ── Remove a tag ──
    async removeTag(tagId: string) {
        return this.prisma.subscriberTag.delete({ where: { id: tagId } });
    }

    // ── Log event ──
    async logEvent(subscriberId: string, eventType: string, eventData: any = {}, campaignId?: string) {
        const event = await this.prisma.subscriberEvent.create({
            data: { subscriberId, eventType, eventData, campaignId },
        });

        // Auto-update lead score
        const scoreMap: Record<string, number> = {
            email_opened: 5,
            email_clicked: 10,
            page_visited: 8,
            inquiry_started: 20,
            booking_made: 30,
        };
        const scoreChange = scoreMap[eventType] || 0;
        if (scoreChange > 0) {
            await this.prisma.emailSubscriber.update({
                where: { id: subscriberId },
                data: { leadScore: { increment: scoreChange } },
            });
        }

        // Trigger Automation Engine (fire-and-forget so it doesn't block the request)
        this.automationService.handleEvent(subscriberId, eventType, eventData).catch(err => {
            console.error('Automation Engine Error:', err);
        });

        return event;
    }

    // ── Get all unique tags (for filter dropdowns) ──
    async getAllTags() {
        const tags = await this.prisma.subscriberTag.groupBy({
            by: ['category', 'value'],
            _count: true,
            orderBy: { _count: { value: 'desc' } },
        });
        return tags;
    }

    // ── Get all unique cities (for filter dropdown) ──
    async getUniqueCities() {
        const cities = await this.prisma.emailSubscriber.groupBy({
            by: ['city'],
            _count: true,
            where: { city: { not: null } },
            orderBy: { _count: { city: 'desc' } },
        });
        return cities.map(c => c.city).filter(Boolean);
    }
}
