import { PaymentProvider, InitiatePaymentResult, WebhookVerificationResult } from './payment-provider.interface';
import { Logger } from '@nestjs/common';
import {
  importPKCS8,
  importSPKI,
  CompactSign,
  CompactEncrypt,
  compactDecrypt,
  compactVerify,
} from 'jose';
import { v4 as uuidv4 } from 'uuid';

export class PacoProvider implements PaymentProvider {
  name = 'paco';
  private readonly logger = new Logger(PacoProvider.name);

  // ─── Crypto Keys (loaded lazy) ─────────────────────────
  private signingKey: CryptoKey | null = null;
  private encryptionKey: CryptoKey | null = null;
  private decryptionKey: CryptoKey | null = null;
  private verificationKey: CryptoKey | null = null;
  private keysLoaded = false;

  private readonly paymentEndpoint = process.env.PACO_ENDPOINT || 'https://core.demo-paco.2c2p.com/';
  private readonly apiKeys: Record<string, string> = {
    NPR: process.env.PACO_API_KEY_NPR || process.env.PACO_API_KEY || '65805a1636c74b8e8ac81a991da80be4',
    USD: process.env.PACO_API_KEY_USD || '65805a1636c74b8e8ac81a991da80be4',
  };
  private readonly merchantId = process.env.PACO_MERCHANT_ID || '9104137120';
  private readonly encryptionKeyId = process.env.PACO_ENCRYPTION_KEY_ID || '7664a2ed0dee4879bdfca0e8ce1ac313';

  private readonly TOKEN_TYPE = 'JWT';
  private readonly JWS_ALGORITHM = 'PS256';
  private readonly JWE_ALGORITHM = 'RSA-OAEP';
  private readonly JWE_ENCRYPTION = 'A128CBC-HS256';

  private readonly merchantSigningPrivateKeyB64 = process.env.PACO_MERCHANT_SIGNING_KEY || '';
  private readonly pacoEncryptionPublicKeyB64 = process.env.PACO_ENCRYPTION_PUBLIC_KEY || '';
  private readonly pacoSigningPublicKeyB64 = process.env.PACO_SIGNING_PUBLIC_KEY || '';
  private readonly merchantDecryptionPrivateKeyB64 = process.env.PACO_MERCHANT_DECRYPTION_KEY || '';

  private async loadKeys() {
    if (this.keysLoaded) return;
    if (!this.merchantSigningPrivateKeyB64 || !this.pacoEncryptionPublicKeyB64) {
      this.logger.warn('[PACO] Keys not fully provided. PACO payments may fail.');
      return;
    }

    try {
      this.signingKey = await importPKCS8(this.toPEM(this.merchantSigningPrivateKeyB64, 'private'), this.JWS_ALGORITHM);
      this.encryptionKey = await importSPKI(this.toPEM(this.pacoEncryptionPublicKeyB64, 'public'), this.JWE_ALGORITHM);
      this.decryptionKey = await importPKCS8(this.toPEM(this.merchantDecryptionPrivateKeyB64, 'private'), this.JWE_ALGORITHM);
      this.verificationKey = await importSPKI(this.toPEM(this.pacoSigningPublicKeyB64, 'public'), this.JWS_ALGORITHM);
      this.keysLoaded = true;
      this.logger.log('[PACO] All JOSE keys loaded successfully');
    } catch (e: any) {
      this.logger.error(`[PACO] Failed to load JOSE keys: ${e.message}`);
    }
  }

  private toPEM(b64Key: string, type: 'private' | 'public'): string {
    let cleaned = b64Key.replace(/^["']+|["']+$/g, '');
    if (cleaned.includes('-----BEGIN')) {
      return cleaned.split('\\r\\n').join('\n').split('\\n').join('\n').replace(/"/g, '').trim();
    }
    cleaned = cleaned.replace(/[^A-Za-z0-9+/=]/g, '');
    while (cleaned.length % 4 !== 0) cleaned += '=';
    const lines = cleaned.match(/.{1,64}/g) || [];
    const pemLabel = type === 'private' ? 'PRIVATE KEY' : 'PUBLIC KEY';
    return `-----BEGIN ${pemLabel}-----\n${lines.join('\n')}\n-----END ${pemLabel}-----`;
  }

  private async encryptPayload(payload: object): Promise<string> {
    if (!this.signingKey || !this.encryptionKey) throw new Error('PACO keys missing');
    const encoder = new TextEncoder();
    const jws = await new CompactSign(encoder.encode(JSON.stringify(payload)))
      .setProtectedHeader({ alg: this.JWS_ALGORITHM, typ: this.TOKEN_TYPE })
      .sign(this.signingKey);

    return new CompactEncrypt(encoder.encode(jws))
      .setProtectedHeader({ alg: this.JWE_ALGORITHM, enc: this.JWE_ENCRYPTION, kid: this.encryptionKeyId, typ: this.TOKEN_TYPE })
      .encrypt(this.encryptionKey);
  }

  private async decryptToken(token: string): Promise<any> {
    if (!this.decryptionKey || !this.verificationKey) throw new Error('PACO keys missing');
    const { plaintext: jwsBytes } = await compactDecrypt(token, this.decryptionKey);
    const jwsToken = new TextDecoder().decode(jwsBytes);
    const { payload } = await compactVerify(jwsToken, this.verificationKey);
    return JSON.parse(new TextDecoder().decode(payload));
  }

  private formatAmountText(amount: number): string {
    return Math.round(amount * 100).toString().padStart(12, '0');
  }

  async initiate(bookingId: string, amount: number, currency: string): Promise<InitiatePaymentResult> {
    await this.loadKeys();
    const orderNo = `NRT-${bookingId}-${Date.now().toString().slice(-4)}`;
    const apiKey = this.apiKeys[currency] || this.apiKeys['NPR'];

    const request = {
      apiRequest: { requestMessageID: uuidv4(), requestDateTime: new Date().toISOString().replace(/\.\d{3}Z$/, '.000Z'), language: 'en-US' },
      officeId: this.merchantId,
      orderNo: orderNo,
      productDescription: `Booking ${bookingId}`,
      paymentType: 'CC',
      paymentCategory: 'ECOM',
      storeCardDetails: { storeCardFlag: 'N', storedCardUniqueID: uuidv4() },
      installmentPaymentDetails: { ippFlag: 'N', installmentPeriod: 0, interestType: null },
      mcpFlag: 'N',
      request3dsFlag: 'Y',
      transactionAmount: { amountText: this.formatAmountText(amount), currencyCode: currency, decimalPlaces: 2, amount: amount },
      notificationURLs: {
        confirmationURL: `http://localhost:3000/payment/callback/paco`,
        failedURL: `http://localhost:3000/payment/callback/paco`,
        cancellationURL: `http://localhost:3000/payment/callback/paco`,
        backendURL: `http://localhost:3001/api/v1/payments/webhook/paco`,
      },
      deviceDetails: { browserIp: '1.0.0.1', browser: 'Chrome', browserUserAgent: 'Mozilla/5.0 NRT-Backend/1.0', mobileDeviceFlag: 'N' },
      purchaseItems: [
        {
          purchaseItemType: 'ticket', referenceNo: orderNo, purchaseItemDescription: `Ticket ${bookingId}`,
          purchaseItemPrice: { amountText: this.formatAmountText(amount), currencyCode: currency, decimalPlaces: 2, amount: amount },
          subMerchantID: 'string', passengerSeqNo: 1,
        },
      ],
      customFieldList: [{ fieldName: 'Source', fieldValue: 'Bus Booking Platform' }],
    };

    const payload = {
      request, iss: apiKey, aud: 'PacoAudience', CompanyApiKey: apiKey,
      iat: Math.floor(Date.now() / 1000), nbf: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const encryptedBody = await this.encryptPayload(payload);

    const response = await fetch(`${this.paymentEndpoint}api/1.0/Payment/prePaymentUi`, {
      method: 'POST',
      headers: { 'Accept': 'application/jose', 'CompanyApiKey': apiKey, 'Content-Type': 'application/jose; charset=utf-8' },
      body: encryptedBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes('.')) {
        try { const decrypted = await this.decryptToken(errorText); throw new Error(`PACO rejected: ${JSON.stringify(decrypted)}`); } 
        catch (e) { /* fallback */ }
      }
      throw new Error(`PACO API returned ${response.status}: ${errorText}`);
    }

    const decryptedResponse = await this.decryptToken(await response.text());
    const paymentPageURL = decryptedResponse?.response?.Data?.paymentPage?.paymentPageURL;

    if (!paymentPageURL) throw new Error('PACO did not return a payment page URL.');

    return {
      gatewayTxnId: orderNo,
      redirectUrl: paymentPageURL,
    };
  }

  async verifyWebhook(rawBody: Buffer | string, signatureHeader: string): Promise<WebhookVerificationResult> {
    await this.loadKeys();
    const token = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8');
    
    // In Paco, the webhook comes as a JWE token in the body (usually plain text, or JSON with { payload: token })
    let payloadToken = token;
    try {
      const parsed = JSON.parse(token);
      if (parsed.payload) payloadToken = parsed.payload;
    } catch (e) {
      // Not JSON, assume raw JWE
    }

    const decrypted = await this.decryptToken(payloadToken);
    
    // Parse Paco Response (Matches Settlement or Notification callback structure)
    // Actually PACO sends standard response format
    const resp = decrypted.response;
    if (!resp || !resp.orderNo) throw new Error('Invalid PACO webhook payload');

    const bookingId = resp.orderNo.split('-')[1]; // NRT-bookingId-1234
    
    return {
      gatewayTxnId: resp.orderNo,
      bookingId,
      status: resp.respCode === '0000' ? 'SUCCESS' : 'FAILED',
    };
  }
}
