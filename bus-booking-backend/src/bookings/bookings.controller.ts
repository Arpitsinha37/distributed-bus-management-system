import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { BookingsService } from './bookings.service';
import { HoldSeatsDto } from './dto/hold-seats.dto';
import { CreateCounterBookingDto } from './dto/create-counter-booking.dto';
import { ListBookingsDto } from './dto/list-bookings.dto';
import { SiteId } from '../common/decorators/site-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { StaffRole } from '../common/enums/roles.enum';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // ── Admin endpoints ──────────────────────────────────────────

  // Paginated, filterable list scoped by the caller's role.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER, StaffRole.COUNTER_AGENT)
  @Get()
  findAll(@Query() dto: ListBookingsDto, @Req() req: Request) {
    const user = req.user as { role: string; siteIds: string[] };
    return this.bookingsService.findAll({
      siteId: dto.siteId,
      status: dto.status,
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo,
      page: dto.page ? parseInt(dto.page, 10) : undefined,
      limit: dto.limit ? parseInt(dto.limit, 10) : undefined,
      // SUPER_ADMIN sees everything; scoped roles only see their assigned sites.
      allowedSiteIds: user.role === StaffRole.SUPER_ADMIN ? undefined : user.siteIds,
    });
  }

  // Admin-only manual cancellation (customer-initiated cancellation should
  // go through its own public endpoint with booking-ref + phone verification).
  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.bookingsService.cancelBooking(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER, StaffRole.COUNTER_AGENT)
  @Post('counter')
  counterBooking(@SiteId() siteId: string, @Body() dto: CreateCounterBookingDto) {
    // Determine the effective siteId to use:
    // Usually counter bookings happen in a specific site, so @SiteId() reads the header.
    // If not, we can default to global or a specific one.
    return this.bookingsService.createCounterBooking(siteId || 'global', dto);
  }

  // ── Public (storefront) endpoints ────────────────────────────

  // Called by the storefront when the customer confirms seats and moves
  // into the payment step.
  @Post('hold')
  hold(@SiteId() siteId: string, @Body() dto: HoldSeatsDto) {
    return this.bookingsService.holdSeats(siteId, dto);
  }

  // Track booking by PNR and Phone
  @Get('track')
  trackBooking(@Query('pnr') pnr: string, @Query('phone') phone: string) {
    return this.bookingsService.trackBooking(pnr, phone);
  }

  // Customer-initiated cancellation
  @Post('cancel')
  async publicCancel(@Body() dto: { pnr: string; phone: string }) {
    const booking = await this.bookingsService.trackBooking(dto.pnr, dto.phone);
    return this.bookingsService.cancelBooking(booking.id);
  }

  // Powers the confirmation/pending page after hold + payment.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  // MVP ONLY: Mock payment confirmation
  @Post(':id/mock-pay')
  async mockPay(@Param('id') id: string) {
    return this.bookingsService.confirmBooking(id);
  }

  // ── Fare Calculation ───────────────────────────────────────

  @Post('calculate-fare')
  calculateFare(@Body() dto: { scheduleId: string; seats: { number: string; type: string }[]; boardingPoint?: string; couponCode?: string }) {
    return this.bookingsService.calculateFare(dto);
  }
}

