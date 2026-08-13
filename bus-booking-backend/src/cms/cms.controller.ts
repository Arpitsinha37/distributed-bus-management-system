import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CmsService } from './cms.service';
import { SiteId } from '../common/decorators/site-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { StaffRole } from '../common/enums/roles.enum';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // --- Public Getters (Storefront) ---
  @Get('sliders') getSliders(@SiteId() siteId: string) { return this.cmsService.getSliders(siteId); }
  @Get('blogs') getBlogs(@SiteId() siteId: string) { return this.cmsService.getBlogs(siteId); }
  @Get('testimonials') getTestimonials(@SiteId() siteId: string) { return this.cmsService.getTestimonials(siteId); }
  @Get('team') getTeam(@SiteId() siteId: string) { return this.cmsService.getTeamMembers(siteId); }
  @Get('faqs') getFaqs(@SiteId() siteId: string) { return this.cmsService.getFaqs(siteId); }
  @Get('gallery') getGallery(@SiteId() siteId: string) { return this.cmsService.getGallery(siteId); }
  @Get('settings') getSettings(@SiteId() siteId: string) { return this.cmsService.getSiteSettings(siteId); }

  // --- Admin Endpoints ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Post('sliders') createSlider(@Body() dto: any) { return this.cmsService.createSlider(dto); }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Patch('sliders/:id') updateSlider(@Param('id') id: string, @Body() dto: any) { return this.cmsService.updateSlider(id, dto); }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Delete('sliders/:id') deleteSlider(@Param('id') id: string) { return this.cmsService.deleteSlider(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Post('blogs') createBlog(@Body() dto: any) { return this.cmsService.createBlog(dto); }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Patch('blogs/:id') updateBlog(@Param('id') id: string, @Body() dto: any) { return this.cmsService.updateBlog(id, dto); }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Delete('blogs/:id') deleteBlog(@Param('id') id: string) { return this.cmsService.deleteBlog(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Post('testimonials') createTestimonial(@Body() dto: any) { return this.cmsService.createTestimonial(dto); }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Patch('testimonials/:id') updateTestimonial(@Param('id') id: string, @Body() dto: any) { return this.cmsService.updateTestimonial(id, dto); }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Delete('testimonials/:id') deleteTestimonial(@Param('id') id: string) { return this.cmsService.deleteTestimonial(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Post('team') createTeam(@Body() dto: any) { return this.cmsService.createTeamMember(dto); }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Patch('team/:id') updateTeam(@Param('id') id: string, @Body() dto: any) { return this.cmsService.updateTeamMember(id, dto); }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Delete('team/:id') deleteTeam(@Param('id') id: string) { return this.cmsService.deleteTeamMember(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Post('faqs') createFaq(@Body() dto: any) { return this.cmsService.createFaq(dto); }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Patch('faqs/:id') updateFaq(@Param('id') id: string, @Body() dto: any) { return this.cmsService.updateFaq(id, dto); }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Delete('faqs/:id') deleteFaq(@Param('id') id: string) { return this.cmsService.deleteFaq(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Post('gallery') createGallery(@Body() dto: any) { return this.cmsService.createGalleryImage(dto); }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Patch('gallery/:id') updateGallery(@Param('id') id: string, @Body() dto: any) { return this.cmsService.updateGalleryImage(id, dto); }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Delete('gallery/:id') deleteGallery(@Param('id') id: string) { return this.cmsService.deleteGalleryImage(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Post('settings') updateSettings(@SiteId() siteId: string, @Body() dto: any) { 
    return this.cmsService.upsertSiteSettings(siteId || null, dto); 
  }
}
