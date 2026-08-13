import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { StaffRole } from '../common/enums/roles.enum';

@Controller('sites')
export class SitesController {
  constructor(private sitesService: SitesService) {}

  // Public: a storefront reads its own branding by slug on startup.
  @Get('by-slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.sitesService.findBySlug(slug);
  }

  // Everything below is admin-only.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateSiteDto) {
    return this.sitesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN)
  @Get()
  findAll() {
    return this.sitesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateSiteDto>) {
    return this.sitesService.update(id, dto);
  }
}
