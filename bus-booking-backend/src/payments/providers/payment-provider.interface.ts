// Every gateway (Stripe, eSewa, Khalti, ...) implements this so the rest of
// the app never talks to a specific gateway's SDK directly. Adding a new
// gateway means adding one class here, not touching booking logic.
export interface InitiatePaymentResult {
  redirectUrl?: string;   // where to send the customer, if the gateway needs a redirect
  clientSecret?: string;  // for gateways that confirm client-side (e.g. Stripe)
  gatewayTxnId: string;
}

export interface WebhookVerificationResult {
  gatewayTxnId: string;
  bookingId: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface PaymentProvider {
  name: string;
  initiate(bookingId: string, amount: number, currency: string): Promise<InitiatePaymentResult>;
  verifyWebhook(rawBody: Buffer | string, signatureHeader: string): WebhookVerificationResult;
}
