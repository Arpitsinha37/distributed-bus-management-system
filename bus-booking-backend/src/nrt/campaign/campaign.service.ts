// @ts-nocheck
import { Injectable, Logger, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class CampaignService {
    private readonly logger = new Logger(CampaignService.name);
    private genAI: GoogleGenerativeAI;

    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
    ) {
        const apiKey = process.env.GEMINI_API_KEY;
        this.genAI = new GoogleGenerativeAI(apiKey || 'dummy');
    }

    // ─────────────────────────────────────────────────
    // AI CONTENT GENERATION (Gemini)
    // ─────────────────────────────────────────────────

    async generateEmailContent(params: {
        campaignType: string;   // promotional, seasonal, re-engagement, welcome, newsletter
        destination?: string;   // Pokhara, Chitwan, etc.
        travelType?: string;    // Adventure, Cultural, etc.
        budgetTier?: string;    // budget, mid, premium, luxury
        season?: string;        // spring, monsoon, autumn, winter
        customPrompt?: string;  // additional instructions
        tone?: string;          // excited, professional, warm, urgent
    }) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are the email marketing expert for **New Road Travels & Tours (P.) Ltd.** — Nepal's #1 trusted travel company based in Kathmandu.

Generate a compelling marketing email with the following requirements:

**Campaign Type:** ${params.campaignType || 'promotional'}
${params.destination ? `**Focus Destination:** ${params.destination}` : ''}
${params.travelType ? `**Travel Type:** ${params.travelType}` : ''}
${params.budgetTier ? `**Target Budget:** ${params.budgetTier}` : ''}
${params.season ? `**Season:** ${params.season}` : ''}
${params.customPrompt ? `**Special Instructions:** ${params.customPrompt}` : ''}
**Tone:** ${params.tone || 'warm and exciting'}

IMPORTANT RULES:
- Write for a Nepal travel audience (both domestic and international travelers)
- Include real Nepal destinations, activities, and experiences
- Use persuasive copywriting techniques
- Include a clear call-to-action (Visit newroadtravels.com or Call +977-9856068470)
- Keep it concise but impactful (ideal email length)
- Use prices in NPR (Nepali Rupees) if mentioning packages
- DO NOT use placeholder text — make everything real and usable

Return the response in this EXACT JSON format:
{
  "subject": "The email subject line (compelling, 50-80 chars)",
  "preheader": "Email preheader text (40-90 chars)",
  "heading": "Main email heading",
  "body": "The main email body content in HTML (use <p>, <strong>, <ul>, <li> tags for formatting)",
  "cta_text": "Call-to-action button text",
  "cta_url": "https://new-road-travels.vercel.app",
  "tagline": "A short tagline or PS line"
}

Return ONLY the JSON, no markdown code blocks.`;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Parse JSON (handle possible markdown wrapping)
            let cleaned = text.trim();
            if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
            }

            const content = JSON.parse(cleaned);
            return content;
        } catch (error: any) {
            this.logger.error('AI content generation failed:', error?.message);
            throw new HttpException(`AI generation failed: ${error?.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ─────────────────────────────────────────────────
    // CAMPAIGN CRUD
    // ─────────────────────────────────────────────────

    async createCampaign(data: {
        name: string;
        subject: string;
        preheader?: string;
        htmlContent: string;
        targetFilter?: any; // { city, tag, budgetTier, minScore, maxScore }
    }) {
        return this.prisma.campaign.create({
            data: {
                name: data.name,
                subject: data.subject,
                preheader: data.preheader || '',
                htmlContent: data.htmlContent,
                targetFilter: data.targetFilter || {},
                status: 'draft',
            },
        });
    }

    async listCampaigns() {
        return this.prisma.campaign.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async getCampaign(id: string) {
        const campaign = await this.prisma.campaign.findUnique({ where: { id } });
        if (!campaign) throw new NotFoundException('Campaign not found');
        return campaign;
    }

    async updateCampaign(id: string, data: any) {
        return this.prisma.campaign.update({ where: { id }, data });
    }

    async deleteCampaign(id: string) {
        return this.prisma.campaign.delete({ where: { id } });
    }

    // ─────────────────────────────────────────────────
    // SEND CAMPAIGN EMAILS
    // ─────────────────────────────────────────────────

    async sendCampaign(campaignId: string) {
        const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
        if (!campaign) throw new NotFoundException('Campaign not found');

        // Build subscriber filter from campaign target
        const filter: any = campaign.targetFilter || {};
        const where: any = { status: 'active' };

        if (filter.city) where.city = { equals: filter.city, mode: 'insensitive' };
        if (filter.budgetTier) where.budgetTier = filter.budgetTier;
        if (filter.minScore !== undefined) where.leadScore = { ...where.leadScore, gte: filter.minScore };
        if (filter.maxScore !== undefined) where.leadScore = { ...where.leadScore, lte: filter.maxScore };
        if (filter.tag) {
            where.tags = { some: { value: { equals: filter.tag, mode: 'insensitive' } } };
        }

        const subscribers = await this.prisma.emailSubscriber.findMany({ where, select: { id: true, email: true, name: true } });

        if (subscribers.length === 0) {
            return { sent: 0, failed: 0, message: 'No matching subscribers found for this campaign filter.' };
        }

        // Update campaign status
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'sending', sentAt: new Date(), recipientCount: subscribers.length },
        });

        let sent = 0;
        let failed = 0;
        const errors: string[] = [];

        // Send emails in batches of 5 (Zoho rate limits)
        const batchSize = 5;
        for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize);
            const results = await Promise.allSettled(
                batch.map(sub => this.sendSingleEmail(sub, campaign)),
            );

            for (let j = 0; j < results.length; j++) {
                if (results[j].status === 'fulfilled') {
                    sent++;
                    // Log event
                    await this.prisma.subscriberEvent.create({
                        data: {
                            subscriberId: batch[j].id,
                            eventType: 'email_sent',
                            eventData: { campaignId, subject: campaign.subject },
                            campaignId,
                        },
                    });
                } else {
                    failed++;
                    errors.push(`${batch[j].email}: ${(results[j] as any).reason?.message || 'Unknown error'}`);
                }
            }

            // Wait 2 seconds between batches (Zoho throttle)
            if (i + batchSize < subscribers.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Update campaign
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: {
                status: failed === subscribers.length ? 'failed' : 'sent',
                sentCount: sent,
                failedCount: failed,
            },
        });

        return { sent, failed, total: subscribers.length, errors: errors.slice(0, 10) };
    }

    private async sendSingleEmail(
        subscriber: { id: string; email: string; name?: string | null },
        campaign: any,
    ) {
        const personalizedName = subscriber.name || 'Traveler';
        const personalizedHtml = this.buildEmailTemplate({
            name: personalizedName,
            subject: campaign.subject,
            preheader: campaign.preheader,
            htmlContent: campaign.htmlContent,
        });

        // Use the existing EmailService transporter
        return (this.emailService as any).transporter.sendMail({
            from: '"New Road Travels" <contact@newroadtravels.com>',
            to: [subscriber.email],
            subject: campaign.subject,
            html: personalizedHtml,
        });
    }

    private buildEmailTemplate(params: {
        name: string; subject: string; preheader?: string; htmlContent: string;
    }): string {
        return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${params.subject}</title>
${params.preheader ? `<span style="display:none;max-height:0;overflow:hidden;">${params.preheader}</span>` : ''}
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
    <img src="https://newroadtravels.com/nrt-logo.png" alt="New Road Travels" width="60" height="60" style="display:block;margin:0 auto 12px;border-radius:12px;" />
    <h1 style="color:#ffffff;font-size:20px;margin:0;">New Road Travels & Tours</h1>
    <p style="color:rgba(255,255,255,0.8);font-size:12px;margin:4px 0 0;">Nepal's #1 Trusted Travel Company</p>
</td></tr>

<!-- Greeting -->
<tr><td style="padding:28px 28px 8px;">
    <p style="color:#374151;font-size:15px;margin:0;">Hi <strong>${params.name}</strong>,</p>
</td></tr>

<!-- Content -->
<tr><td style="padding:16px 28px;">
    <div style="color:#374151;font-size:14px;line-height:1.8;">
        ${params.htmlContent}
    </div>
</td></tr>

<!-- Footer -->
<tr><td style="background-color:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="color:#6b7280;font-size:12px;margin:0 0 8px;">New Road Travels & Tours (P.) Ltd.</p>
    <p style="color:#9ca3af;font-size:11px;margin:0;">Kathmandu, Nepal • +977-9856068470 • newroadtravels.com</p>
    <p style="color:#d1d5db;font-size:10px;margin:12px 0 0;">You're receiving this because you subscribed at newroadtravels.com</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
    }

    // ─────────────────────────────────────────────────
    // SEND TEST EMAIL
    // ─────────────────────────────────────────────────

    async sendTestEmail(campaignId: string, testEmail: string) {
        const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
        if (!campaign) throw new NotFoundException('Campaign not found');

        const html = this.buildEmailTemplate({
            name: 'Test User',
            subject: campaign.subject,
            preheader: campaign.preheader || '',
            htmlContent: campaign.htmlContent,
        });

        return (this.emailService as any).transporter.sendMail({
            from: '"New Road Travels" <contact@newroadtravels.com>',
            to: [testEmail],
            subject: `[TEST] ${campaign.subject}`,
            html,
        });
    }

    // ─────────────────────────────────────────────────
    // CAMPAIGN PREVIEW / RECIPIENT COUNT
    // ─────────────────────────────────────────────────

    async previewRecipients(filter: any) {
        const where: any = { status: 'active' };
        if (filter.city) where.city = { equals: filter.city, mode: 'insensitive' };
        if (filter.budgetTier) where.budgetTier = filter.budgetTier;
        if (filter.minScore !== undefined) where.leadScore = { ...where.leadScore, gte: Number(filter.minScore) };
        if (filter.maxScore !== undefined) where.leadScore = { ...where.leadScore, lte: Number(filter.maxScore) };
        if (filter.tag) where.tags = { some: { value: { equals: filter.tag, mode: 'insensitive' } } };

        const [count, sample] = await Promise.all([
            this.prisma.emailSubscriber.count({ where }),
            this.prisma.emailSubscriber.findMany({ where, take: 5, select: { email: true, name: true, city: true } }),
        ]);

        return { count, sample };
    }
}
