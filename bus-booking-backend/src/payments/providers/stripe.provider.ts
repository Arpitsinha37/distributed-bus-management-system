import { Injectable } from '@nestjs/common';
import { PaymentProvider, InitiatePaymentResult, WebhookVerificationResult } from './payment-provider.interface';

// Stub — wire up the real `stripe` SDK here. Kept separate from
// PaymentsService so swapping or adding gateways never touches booking
// logic.
@Injectable()
export class StripeProvider implements PaymentProvider {
  name = 'stripe';

  async initiate(bookingId: string, amount: number, currency: string): Promise<InitiatePaymentResult> {
    // const intent = await stripe.paymentIntents.create({ amount: amount * 100, currency, metadata: { bookingId } });
    // return { clientSecret: intent.client_secret, gatewayTxnId: intent.id };
    throw new Error('StripeProvider.initiate not implemented — plug in the Stripe SDK');
  }

  verifyWebhook(rawBody: Buffer | string, signatureHeader: string): WebhookVerificationResult {
    // const event = stripe.webhooks.constructEvent(rawBody, signatureHeader, process.env.STRIPE_WEBHOOK_SECRET);
    // return { gatewayTxnId: event.data.object.id, bookingId: event.data.object.metadata.bookingId, status: ... };
    throw new Error('StripeProvider.verifyWebhook not implemented — plug in the Stripe SDK');
  }
}
