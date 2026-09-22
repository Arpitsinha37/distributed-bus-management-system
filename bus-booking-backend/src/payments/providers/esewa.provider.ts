import { PaymentProvider, InitiatePaymentResult, WebhookVerificationResult } from './payment-provider.interface';
import * as crypto from 'crypto';

export class EsewaProvider implements PaymentProvider {
  name = 'esewa';

  private readonly merchantCode = process.env.ESEWA_MERCHANT_CODE || 'NP-ES-NRTRAVEL';
  private readonly secretKey = process.env.ESEWA_SECRET_KEY || 'KxYSVzMcCgFZMQEEAQQfUSspSDY2Wi8hPzc4MzYp';
  
  // Use production URL if merchant code is not EPAYTEST
  private get baseUrl(): string {
    return this.merchantCode === 'EPAYTEST'
      ? 'https://rc-epay.esewa.com.np'
      : 'https://epay.esewa.com.np';
  }

  async initiate(bookingId: string, amount: number, currency: string, frontendUrl: string): Promise<InitiatePaymentResult> {
    const transactionUuid = `NRT-${bookingId}-${Date.now().toString().slice(-4)}`;
    
    const signatureString = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${this.merchantCode}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(signatureString)
      .digest('base64');

    const formData = {
      amount: String(amount),
      tax_amount: '0',
      total_amount: String(amount),
      transaction_uuid: transactionUuid,
      product_code: this.merchantCode,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: `${frontendUrl}/payment/callback/esewa`,
      failure_url: `${frontendUrl}/payment/callback/esewa`,
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
    
    // If the frontend forwarded the query params as JSON, extract the 'data' field
    try {
      const parsedBody = JSON.parse(dataPayload);
      if (parsedBody.data) {
        dataPayload = parsedBody.data;
      }
    } catch (e) {
      // Not JSON, proceed with raw string
    }

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

      // Verify signature dynamically based on signed_field_names
      const signedFields = data.signed_field_names.split(',');
      const signatureString = signedFields.map((field: string) => `${field}=${data[field] || ''}`).join(',');
      
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(signatureString)
        .digest('base64');

      if (expectedSignature !== data.signature) {
        throw new Error('eSewa signature verification failed');
      }

      // Server-to-server verification
      const amountStr = String(data.total_amount).replace(/,/g, '');
      const statusUrl = `${this.baseUrl}/api/epay/transaction/status/?product_code=${this.merchantCode}&total_amount=${amountStr}&transaction_uuid=${data.transaction_uuid}`;
      const statusRes = await fetch(statusUrl);
      if (!statusRes.ok) {
        throw new Error(`eSewa server-to-server verification failed with status: ${statusRes.status}`);
      }
      const statusData = await statusRes.json();
      
      if (statusData.status !== 'COMPLETE') {
        return {
          gatewayTxnId: data.transaction_uuid,
          bookingId: data.transaction_uuid.split('-')[1],
          status: 'FAILED',
        };
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
