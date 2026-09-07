import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAllCampaigns() {
    return this.prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateAiContent(dto: any) {
    this.logger.log(`Mocking AI generation for ${dto.campaignType} to ${dto.destination || 'Anywhere'}`);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      subject: `Exclusive ${dto.travelType || 'Travel'} Deal to ${dto.destination || 'Nepal'}!`,
      preheader: `Don't miss out on these limited time offers...`,
      heading: `Your Next Adventure Awaits`,
      body: `<p>We've crafted the perfect <strong>${dto.budgetTier || 'affordable'}</strong> getaway just for you. Whether you're looking for an unforgettable journey or a relaxing escape, this trip has everything you need.</p>
<p>Enjoy our special <em>${dto.campaignType}</em> pricing and experience the best of what we have to offer.</p>`,
      cta_text: `Book Your Trip Now`,
      cta_url: `https://example.com/offers`,
      tagline: `Travel with confidence. Travel with us.`
    };
  }

  private buildCustomerWhereInput(filterDto: any): Prisma.CustomerWhereInput {
    const where: Prisma.CustomerWhereInput = {};
    if (filterDto.city) {
      where.city = { contains: filterDto.city, mode: 'insensitive' };
    }
    if (filterDto.tag) {
      where.tags = { has: filterDto.tag };
    }
    if (filterDto.budgetTier) {
      where.budgetTier = filterDto.budgetTier;
    }
    if (filterDto.minScore !== undefined) {
      where.leadScore = { gte: Number(filterDto.minScore) };
    }
    return where;
  }

  async previewRecipients(filterDto: any) {
    const where = this.buildCustomerWhereInput(filterDto || {});
    const count = await this.prisma.customer.count({ where });
    return { count };
  }

  async createCampaign(dto: any) {
    const targetFilter = dto.targetFilter || {};
    const where = this.buildCustomerWhereInput(targetFilter);
    const recipientCount = await this.prisma.customer.count({ where });

    return this.prisma.campaign.create({
      data: {
        name: dto.name,
        subject: dto.subject,
        preheader: dto.preheader,
        htmlContent: dto.htmlContent,
        targetFilter: dto.targetFilter as any,
        status: 'DRAFT',
        recipientCount,
      },
    });
  }

  async sendCampaign(id: string) {
    const campaign = await this.prisma.campaign.findUniqueOrThrow({ where: { id } });
    
    await this.prisma.campaign.update({
      where: { id },
      data: { status: 'SENDING' },
    });

    const where = this.buildCustomerWhereInput(
      typeof campaign.targetFilter === 'object' && campaign.targetFilter !== null 
        ? campaign.targetFilter 
        : {}
    );
    const recipients = await this.prisma.customer.findMany({ where, select: { id: true, email: true } });

    this.logger.log(`Dispatching campaign ${id} to ${recipients.length} recipients...`);
    
    // Fire and forget the mocked sending loop
    setTimeout(async () => {
      const sentCount = Math.floor(recipients.length * 0.95);
      const failedCount = recipients.length - sentCount;
      
      await this.prisma.campaign.update({
        where: { id },
        data: {
          status: 'SENT',
          sentCount,
          failedCount,
          sentAt: new Date(),
        },
      });
      this.logger.log(`Campaign ${id} finished. Sent: ${sentCount}, Failed: ${failedCount}`);
    }, 2000);

    return { 
      message: 'Campaign dispatched successfully',
      total: recipients.length,
      sent: Math.floor(recipients.length * 0.95),
      failed: recipients.length - Math.floor(recipients.length * 0.95)
    };
  }

  async sendTestEmail(id: string, email: string) {
    this.logger.log(`Mocking test email for campaign ${id} to ${email}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true };
  }

  async deleteCampaign(id: string) {
    return this.prisma.campaign.delete({ where: { id } });
  }
}
