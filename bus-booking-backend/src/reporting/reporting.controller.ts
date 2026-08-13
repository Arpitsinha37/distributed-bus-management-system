import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { StaffRole } from '../common/enums/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
@Controller('reporting')
export class ReportingController {
  constructor(private reportingService: ReportingService) {}

  @Get('revenue')
  revenueBySite(
    @Query('siteId') siteId: string | undefined,
    @Query('dateFrom') dateFrom: string | undefined,
    @Query('dateTo') dateTo: string | undefined,
    @Req() req: Request,
  ) {
    const user = req.user as { role: string; siteIds: string[] };
    return this.reportingService.revenueBySite({
      siteId,
      dateFrom,
      dateTo,
      allowedSiteIds: user.role === StaffRole.SUPER_ADMIN ? undefined : user.siteIds,
    });
  }

  @Get('overview')
  getOverview(@Query('siteId') siteId: string | undefined, @Req() req: Request) {
    const user = req.user as { role: string; siteIds: string[] };
    return this.reportingService.getOverview({
      siteId,
      allowedSiteIds: user.role === StaffRole.SUPER_ADMIN ? undefined : user.siteIds,
    });
  }
}

