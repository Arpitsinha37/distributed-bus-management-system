import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BookingsService } from '../bookings/bookings.service';
import { StripeProvider } from './providers/stripe.provider';
import { PaymentProvider } from './providers/payment-provider.interface';

import { EsewaProvider } from './providers/esewa.provider';
import { KhaltiProvider } from './providers/khalti.provider';

@Injectable()
export class PaymentsService {
  private providers: Record<string, PaymentProvider>;

  constructor(
    private prisma: PrismaService,
    private bookingsService: BookingsService,
    stripeProvider: StripeProvider,
    esewaProvider: EsewaProvider,
    khaltiProvider: KhaltiProvider,
  ) {
    this.providers = { 
      stripe: stripeProvider,
      esewa: esewaProvider,
      khalti: khaltiProvider,
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

  // Safety net for the case that actually breaks booking sites: the
  // gateway charged the customer but the webhook never arrived (network
  // blip, server restart, misconfigured URL). Poll anything stuck in
  // INITIATED for more than a few minutes and re-check with the gateway.
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
