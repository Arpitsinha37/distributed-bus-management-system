import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CampaignService } from './campaign.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Campaigns')
@Controller('nrt/campaigns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CampaignController {
    constructor(private readonly svc: CampaignService) { }

    // ── AI Content Generation ──
    @Post('ai/generate')
    @ApiOperation({ summary: 'Generate AI email content using Gemini' })
    generateContent(@Body() body: {
        campaignType: string;
        destination?: string;
        travelType?: string;
        budgetTier?: string;
        season?: string;
        customPrompt?: string;
        tone?: string;
    }) {
        return this.svc.generateEmailContent(body);
    }

    // ── Campaign CRUD ──
    @Get()
    @ApiOperation({ summary: 'List all campaigns' })
    list() {
        return this.svc.listCampaigns();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get campaign details' })
    get(@Param('id') id: string) {
        return this.svc.getCampaign(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new campaign' })
    create(@Body() body: {
        name: string;
        subject: string;
        preheader?: string;
        htmlContent: string;
        targetFilter?: any;
    }) {
        return this.svc.createCampaign(body);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update campaign' })
    update(@Param('id') id: string, @Body() body: any) {
        return this.svc.updateCampaign(id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete campaign' })
    remove(@Param('id') id: string) {
        return this.svc.deleteCampaign(id);
    }

    // ── Send Campaign ──
    @Post(':id/send')
    @ApiOperation({ summary: 'Send campaign to matching subscribers' })
    send(@Param('id') id: string) {
        return this.svc.sendCampaign(id);
    }

    // ── Send Test Email ──
    @Post(':id/test')
    @ApiOperation({ summary: 'Send test email to a specific address' })
    sendTest(@Param('id') id: string, @Body('email') email: string) {
        return this.svc.sendTestEmail(id, email);
    }

    // ── Preview Recipients ──
    @Post('preview/recipients')
    @ApiOperation({ summary: 'Preview how many subscribers match a filter' })
    previewRecipients(@Body() body: any) {
        return this.svc.previewRecipients(body);
    }
}
