import { PaymentProvider, InitiatePaymentResult, WebhookVerificationResult } from './payment-provider.interface';
import * as crypto from 'crypto';

export class EsewaProvider implements PaymentProvider {
  name = 'esewa';

  private readonly merchantCode = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
  private readonly secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
  
  // Use production URL if merchant code is not EPAYTEST
  private get baseUrl(): string {
    return this.merchantCode === 'EPAYTEST'
      ? 'https://rc-epay.esewa.com.np'
      : 'https://epay.esewa.com.np';
  }

  async initiate(bookingId: string, amount: number, currency: string): Promise<InitiatePaymentResult> {
    const transactionUuid = `NRT-${bookingId}-${Date.now().toString().slice(-4)}`;
    
    const signatureString = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${this.merchantCode}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(signatureString)
      .digest('base64');

    // The frontend should construct a form with these fields and submit it to the redirectUrl.
    // To fit the `InitiatePaymentResult` and allow frontend flexibility, we can pass these as query params
    // to a custom redirect endpoint or pass the data in the redirectUrl.
    // Since eSewa requires POST with form data, we will return a special URL format that our frontend
    // will intercept and turn into a form post, or we encode it into the URL.
    
    // For simplicity, we return the base form URL. The frontend eSewa wrapper will need to POST to this.
    // We encode the necessary form data into a base64 string in the clientSecret for the frontend to use.
    const formData = {
      amount: String(amount),
      tax_amount: '0',
      total_amount: String(amount),
      transaction_uuid: transactionUuid,
      product_code: this.merchantCode,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: `http://localhost:3000/payment/callback/esewa`,
      failure_url: `http://localhost:3000/payment/callback/esewa`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature,
    };

    return {
      gatewayTxnId: transactionUuid,
      redirectUrl: `${this.baseUrl}/api/epay/main/v2/form`,
      clientSecret: Buffer.from(JSON.stringify(formData)).toString('base64'),
    };
  }

  async verifyWebhook(rawBody: Buffer | string, signatureHeader: string): Promise<WebhookVerificationResult> {
    let dataPayload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8');
    
    // eSewa usually sends base64 encoded data in a `data` query param
    // If it's passed as rawBody here, we assume the controller extracted the 'data' string.
    try {
      const decodedStr = Buffer.from(dataPayload, 'base64').toString('utf-8');
      const data = JSON.parse(decodedStr);

      if (data.status !== 'COMPLETE') {
        return {
          gatewayTxnId: data.transaction_uuid,
          bookingId: data.transaction_uuid.split('-')[1], // Extract bookingId
          status: 'FAILED',
        };
      }

      // Verify signature
      const signatureString = `transaction_code=${data.transaction_code},status=${data.status},total_amount=${data.total_amount},transaction_uuid=${data.transaction_uuid},product_code=${data.product_code},signed_field_names=${data.signed_field_names}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(signatureString)
        .digest('base64');

      if (expectedSignature !== data.signature) {
        throw new Error('eSewa signature verification failed');
      }

      return {
        gatewayTxnId: data.transaction_uuid,
        bookingId: data.transaction_uuid.split('-')[1],
        status: 'SUCCESS',
      };
    } catch (err) {
      throw new Error(`eSewa webhook verification error: ${(err as Error).message}`);
    }
  }
}
