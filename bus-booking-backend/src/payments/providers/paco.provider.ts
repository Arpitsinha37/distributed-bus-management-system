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

  private readonly paymentEndpoint = process.env.PACO_ENDPOINT || 'https://core.paco.2c2p.com/';
  private readonly apiKeys: Record<string, string> = {
    NPR: process.env.PACO_API_KEY_NPR || process.env.PACO_API_KEY || 'bde9e02c854347c7ba2b220877f47281',
    USD: process.env.PACO_API_KEY_USD || 'bde9e02c854347c7ba2b220877f47281',
  };
  private readonly merchantId = process.env.PACO_MERCHANT_ID || '9104132790';
  private readonly encryptionKeyId = process.env.PACO_ENCRYPTION_KEY_ID || '19f84b5655f04e25a99b09f1ee2fac78';

  private readonly TOKEN_TYPE = 'JWT';
  private readonly JWS_ALGORITHM = 'PS256';
  private readonly JWE_ALGORITHM = 'RSA-OAEP';
  private readonly JWE_ENCRYPTION = 'A128CBC-HS256';

  private readonly merchantSigningPrivateKeyB64 = process.env.PACO_MERCHANT_SIGNING_KEY || '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';
  private readonly pacoEncryptionPublicKeyB64 = process.env.PACO_ENCRYPTION_PUBLIC_KEY || 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA6ZLups2K0iYEMxQqgASX8gY6tWhNVCp08YuDgjCsOVrGVgUHD0dh0TWFNJ7Lq2Jp0SOsGgi54+hrjwPOL2CCZxw8pKUlL57UksoD9oWUrK/KkSvEAwPU4cZqzxIXyhBcZb8O96iN4WQJILkRTg+DXLkML6qisO496fPGIs+vCoc87toucy5O9fRfaYSjcqjreyi8JDkvVJM/BeNtOEM2a0b/lcWa67RH+tN97H25k+Qez7QthLru6oBfWBgD6iIwhV+ICqLWHmp6fQ+DHQk/o+OO3yFiY9OAvMiy8MOTinvkBlFwYgYNznG3/w0Xh8U5vtudUXPDNUO6ddf4y99+6LlWDiKgJn/Th93YUg+gFH4LUJHyPrSY2JuC+Q8kksp2xyiZDTHGzi96kturwrqCui6TytCHcU4UB0VRMR+M7VRl3S2YPhcxv5U8Fh2PITqydZE5vv1Va06qhegjOlSZnEUl2xKPm5k/u+UHvUP/oq04fQLTlYqyA3JYDCe4z5Ea2SOgjeVl+qTatWYzmkUXyCONLZ4UaRrgbYCp0nCPHoTFgRQdChu8ezDbnYY9IW7cT/s2fEi5N7X1XrQttiEP4rbn0y0qVYYjN86+elfhtYGHidZTUSUS5RSTHqOkj59p5LIGwFF9iTXzCjfUqq8clnfOk76qSLY1+Kj+SMMe6Z8CAwEAAQ==';
  private readonly pacoSigningPublicKeyB64 = process.env.PACO_SIGNING_PUBLIC_KEY || 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAr0XW6QacR8GilY4nZrJZW40wnFeYu7h9aXUSqxCP6djurCWZmLqnrsYWP7/HR8WOulYPHTVpfqJesTOdVqPgY6p10H811oRbJG9jvsG8j8kn/Bk8b2wZ9qelNqdNJMDbR5WUyaytaDWW6QdI4+clqjFfwCOw76noDSe+R4pDSzgMiyCk5R4m2ECT1fv/4Axz2bvLN+DRTg5DPPIMLWpA87lgjxeaDlGyJqZCbkJozW7JX0AJVc0X7YR9kzbiTi3LVOInSKY+VHT8yCARIdvXtKc6+IWSbVQqgpNIBB8GN0OvU8xedjPNCMGZnnMtgd7XLTf/okyadbdNLAqQLTbDs/5HnIVx8FyfgiOS/zsim5ivi3ljVAW3T3ePGjkY0q1DMzr5iJ4m/WTL2d1TArlfHyQhkSpFpQPOO+pJyVQqttHJo99vMirQogdSx4lIu//aod0yJyJLpjCeiqb2Fz3Qk0AZ4S78QKeeGsxTRchTP6Wsb6okaZd+cFi6z8qbP0z/Y3xRZO7vOLB/whkqS+pMVKBQ42YzgQPRzbXXmgCkf1nCqgrD9bnIB5ovdRGfDXW86GKY8XwGVjb4BoMvql+HsbonKHAO+eGfQulpB5YfQGQU3ZXdMdfCLAk8FuqemH4k7S7diLzVvRCuisHsEx6qJ4ewxzNCvW7OGVinTR9NSQUCAwEAAQ==';
  private readonly merchantDecryptionPrivateKeyB64 = process.env.PACO_MERCHANT_DECRYPTION_KEY || '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';

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
