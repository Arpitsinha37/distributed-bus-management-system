import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { StaffRole } from '../common/enums/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  getAllCampaigns() {
    return this.campaignsService.getAllCampaigns();
  }

  @Post('ai/generate')
  generateAiContent(@Body() dto: any) {
    return this.campaignsService.generateAiContent(dto);
  }

  @Post('preview/recipients')
  previewRecipients(@Body() filterDto: any) {
    return this.campaignsService.previewRecipients(filterDto);
  }

  @Post()
  createCampaign(@Body() dto: any) {
    return this.campaignsService.createCampaign(dto);
  }

  @Post(':id/send')
  sendCampaign(@Param('id') id: string) {
    return this.campaignsService.sendCampaign(id);
  }

  @Post(':id/test')
  sendTestEmail(@Param('id') id: string, @Body('email') email: string) {
    return this.campaignsService.sendTestEmail(id, email);
  }

  @Delete(':id')
  deleteCampaign(@Param('id') id: string) {
    return this.campaignsService.deleteCampaign(id);
  }
}
