import { Body, Controller, Headers, Param, Post, RawBodyRequest, Req, Get, UseGuards, Query } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { StaffRole } from '../common/enums/roles.enum';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER, StaffRole.COUNTER_AGENT)
  @Get()
  findAll(@Query('limit') limit: string, @Req() req: Request) {
    const user = req.user as { role: string; siteIds: string[] };
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const allowedSiteIds = user.role === StaffRole.SUPER_ADMIN ? undefined : user.siteIds;
    return this.paymentsService.findAll(allowedSiteIds, parsedLimit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Get('stats')
  getStats(@Req() req: Request) {
    const user = req.user as { role: string; siteIds: string[] };
    const allowedSiteIds = user.role === StaffRole.SUPER_ADMIN ? undefined : user.siteIds;
    return this.paymentsService.getStats(allowedSiteIds);
  }

  @Post(':gateway/initiate')
  initiate(@Param('gateway') gateway: string, @Body('bookingId') bookingId: string) {
    return this.paymentsService.initiate(bookingId, gateway);
  }

  // Gateways call this directly — needs the raw body for signature
  // verification, so this route must be excluded from JSON body parsing
  // (enable `rawBody: true` in NestFactory.create options in main.ts).
  @Post(':gateway/webhook')
  webhook(
    @Param('gateway') gateway: string,
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(gateway, req.rawBody ?? '', signature);
  }
}
