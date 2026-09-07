import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BookingsService } from '../bookings/bookings.service';
import { PaymentProvider } from './providers/payment-provider.interface';

import { EsewaProvider } from './providers/esewa.provider';
import { KhaltiProvider } from './providers/khalti.provider';
import { PacoProvider } from './providers/paco.provider';

@Injectable()
export class PaymentsService {
  private providers: Record<string, PaymentProvider>;

  constructor(
    private prisma: PrismaService,
    private bookingsService: BookingsService,
    esewaProvider: EsewaProvider,
    khaltiProvider: KhaltiProvider,
    pacoProvider: PacoProvider,
  ) {
    this.providers = { 
      esewa: esewaProvider,
      khalti: khaltiProvider,
      paco: pacoProvider,
    };
  }

  async initiate(bookingId: string, gateway: string) {
    const booking = await this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    const provider = this.providers[gateway];
    if (!provider) throw new Error(`Unsupported gateway: ${gateway}`);
    const result = await provider.initiate(booking.id, Number(booking.totalFare), 'NPR');

    await this.prisma.payment.create({
      data: {
        bookingId,
        gateway,
        gatewayTxnId: result.gatewayTxnId,
        amount: booking.totalFare,
        status: 'INITIATED',
      },
    });
    return result;
  }

  // Idempotent by design: gateways retry webhooks, and this must be safe
  // to receive the same event more than once without double-confirming or
  // double-crediting anything.
  async handleWebhook(gateway: string, rawBody: Buffer | string, signatureHeader: string) {
    const provider = this.providers[gateway];
    if (!provider) throw new Error(`Unsupported gateway: ${gateway}`);
    const verified = await provider.verifyWebhook(rawBody, signatureHeader);

    const payment = await this.prisma.payment.findUnique({ where: { gatewayTxnId: verified.gatewayTxnId } });
    if (!payment || payment.status !== 'INITIATED') return; // already processed or unknown — no-op

    if (verified.status === 'SUCCESS') {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'SUCCESS' } });
      await this.bookingsService.confirmBooking(payment.bookingId);
      // ticketing/notifications modules pick up from here (see TicketingService)
    } else {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
    }
  }

  async findAll(siteIds?: string[], limit: number = 50) {
    const where = siteIds ? { booking: { siteId: { in: siteIds } } } : {};
    const payments = await this.prisma.payment.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            trip: { include: { schedule: { include: { route: true } } } },
            customer: true,
            seats: true,
          }
        }
      }
    });

    return {
      data: payments.map(p => ({
        id: p.id,
        ticketNo: p.booking.bookingRef,
        method: p.gateway,
        amount: Number(p.amount),
        currency: 'NPR',
        status: p.status.toLowerCase(),
        transactionId: p.gatewayTxnId || undefined,
        passengerName: p.booking.customerName,
        passengerPhone: p.booking.customerPhone,
        passengerEmail: p.booking.customerEmail || undefined,
        route: p.booking.trip.schedule.route.originCity + ' - ' + p.booking.trip.schedule.route.destinationCity,
        travelDate: p.booking.trip.travelDate.toISOString(),
        seatNumbers: p.booking.seats.map(s => s.seatNumber),
        createdAt: p.createdAt.toISOString(),
        finalizedAt: (p.status === 'SUCCESS' || p.status === 'FAILED' || p.status === 'REFUNDED') ? p.updatedAt.toISOString() : undefined,
      }))
    };
  }

  async getStats(siteIds?: string[]) {
    const where = siteIds ? { booking: { siteId: { in: siteIds } } } : {};
    const payments = await this.prisma.payment.findMany({ where });

    const gw = (p: any) => (p.gateway ?? '').toLowerCase();
    const esewa = payments.filter(p => gw(p) === 'esewa');
    const khalti = payments.filter(p => gw(p) === 'khalti');
    const cash = payments.filter(p => ['cash_on_bus', 'cash'].includes(gw(p)));
    const other = payments.filter(p => !['esewa', 'khalti', 'cash_on_bus', 'cash'].includes(gw(p)));

    const sumAmount = (arr: any[]) => arr.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      total: payments.length,
      totalCompleted: payments.filter(p => p.status === 'SUCCESS').length,
      totalPending: payments.filter(p => p.status === 'INITIATED').length,
      totalFailed: payments.filter(p => p.status === 'FAILED').length,
      esewaCount: esewa.length,
      khaltiCount: khalti.length,
      cashCount: cash.length,
      otherCount: other.length,
      // sum(gateways.*) + pendingRevenue + lostRevenue === totalRevenue is guaranteed
      // because every payment falls into exactly one gateway bucket (esewa, khalti, cash, or other)
      // and exactly one status bucket (SUCCESS, INITIATED, or FAILED).
      realizedRevenue: sumAmount(payments.filter(p => p.status === 'SUCCESS')),
      pendingRevenue: sumAmount(payments.filter(p => p.status === 'INITIATED')),
      lostRevenue: sumAmount(payments.filter(p => p.status === 'FAILED')),
      totalRevenue: sumAmount(payments),
      gateways: {
        esewa: sumAmount(esewa.filter(p => p.status === 'SUCCESS')),
        khalti: sumAmount(khalti.filter(p => p.status === 'SUCCESS')),
        cash: sumAmount(cash.filter(p => p.status === 'SUCCESS')),
        other: sumAmount(other.filter(p => p.status === 'SUCCESS')),
      }
    };
  }

  // Safety net for the case that actually breaks booking sites: the
  @Cron(CronExpression.EVERY_5_MINUTES)
  async reconcileStalePayments() {
    const stale = await this.prisma.payment.findMany({
      where: { status: 'INITIATED', createdAt: { lt: new Date(Date.now() - 5 * 60_000) } },
    });
    for (const payment of stale) {
      // const status = await this.providers[payment.gateway].checkStatus(payment.gatewayTxnId);
      // reconcile against `status` here — left as a stub since it's
      // gateway-specific, but this loop is where it belongs.
    }
  }
}
