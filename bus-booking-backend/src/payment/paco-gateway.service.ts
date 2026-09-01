/**
 * PACO (2C2P / HBL) Payment Gateway Service
 * 
 * Ported from verified standalone test at:
 *   c:\Users\arpit\Downloads\PACO\paco-test-backend\src\{crypto,payment,config}.js
 * 
 * JOSE Flow:
 *   Outgoing: JSON → JWS (PS256 sign) → JWE (RSA-OAEP + A128CBC-HS256 encrypt) → POST to PACO
 *   Incoming: JWE → decrypt → JWS → verify → JSON
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  importPKCS8,
  importSPKI,
  CompactSign,
  CompactEncrypt,
  compactDecrypt,
  compactVerify,
} from 'jose';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PacoGatewayService implements OnModuleInit {
  private readonly logger = new Logger(PacoGatewayService.name);

  // ─── Crypto Keys (loaded on init) ─────────────────────────
  private signingKey: CryptoKey | null = null;
  private encryptionKey: CryptoKey | null = null;
  private decryptionKey: CryptoKey | null = null;
  private verificationKey: CryptoKey | null = null;

  // ─── Configuration (from env with UAT defaults) ───────────
  // IMPORTANT: For production, set ALL PACO_* env vars on Railway!
  // UAT endpoint & keys are defaults so local dev works out of the box.
  // Production: PACO_ENDPOINT=https://core.paco.2c2p.com/
  //             PACO_API_KEY_NPR=c68a4b0383864d32a6835e53c438bfe4
  //             PACO_API_KEY_USD=7def5500601949d18d72525bbf630d25
  //             PACO_ENCRYPTION_KEY_ID=19f84b5655f04e25a99b09f1ee2fac78
  //             + all 4 PACO_MERCHANT_* / PACO_*_PUBLIC_KEY vars
  private readonly paymentEndpoint = process.env.PACO_ENDPOINT || 'https://core.demo-paco.2c2p.com/';
  private readonly apiKeys: Record<string, string> = {
    NPR: process.env.PACO_API_KEY_NPR || process.env.PACO_API_KEY || '65805a1636c74b8e8ac81a991da80be4',
    USD: process.env.PACO_API_KEY_USD || '65805a1636c74b8e8ac81a991da80be4',
  };
  private readonly merchantId = process.env.PACO_MERCHANT_ID || '9104137120';
  private readonly encryptionKeyId = process.env.PACO_ENCRYPTION_KEY_ID || '7664a2ed0dee4879bdfca0e8ce1ac313';

  // Algorithm config (fixed by PACO spec)
  private readonly TOKEN_TYPE = 'JWT';
  private readonly JWS_ALGORITHM = 'PS256';
  private readonly JWE_ALGORITHM = 'RSA-OAEP';
  private readonly JWE_ENCRYPTION = 'A128CBC-HS256';

  // Raw base64 keys (from env, UAT defaults from PHP SecurityData)
  private readonly merchantSigningPrivateKeyB64 = process.env.PACO_MERCHANT_SIGNING_KEY || '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';

  private readonly pacoEncryptionPublicKeyB64 = process.env.PACO_ENCRYPTION_PUBLIC_KEY || 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA6ZLups2K0iYEMxQqgASX8gY6tWhNVCp08YuDgjCsOVrGVgUHD0dh0TWFNJ7Lq2Jp0SOsGgi54+hrjwPOL2CCZxw8pKUlL57UksoD9oWUrK/KkSvEAwPU4cZqzxIXyhBcZb8O96iN4WQJILkRTg+DXLkML6qisO496fPGIs+vCoc87toucy5O9fRfaYSjcqjreyi8JDkvVJM/BeNtOEM2a0b/lcWa67RH+tN97H25k+Qez7QthLru6oBfWBgD6iIwhV+ICqLWHmp6fQ+DHQk/o+OO3yFiY9OAvMiy8MOTinvkBlFwYgYNznG3/w0Xh8U5vtudUXPDNUO6ddf4y99+6LlWDiKgJn/Th93YUg+gFH4LUJHyPrSY2JuC+Q8kksp2xyiZDTHGzi96kturwrqCui6TytCHcU4UB0VRMR+M7VRl3S2YPhcxv5U8Fh2PITqydZE5vv1Va06qhegjOlSZnEUl2xKPm5k/u+UHvUP/oq04fQLTlYqyA3JYDCe4z5Ea2SOgjeVl+qTatWYzmkUXyCONLZ4UaRrgbYCp0nCPHoTFgRQdChu8ezDbnYY9IW7cT/s2fEi5N7X1XrQttiEP4rbn0y0qVYYjN86+elfhtYGHidZTUSUS5RSTHqOkj59p5LIGwFF9iTXzCjfUqq8clnfOk76qSLY1+Kj+SMMe6Z8CAwEAAQ==';

  private readonly pacoSigningPublicKeyB64 = process.env.PACO_SIGNING_PUBLIC_KEY || 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAr0XW6QacR8GilY4nZrJZW40wnFeYu7h9aXUSqxCP6djurCWZmLqnrsYWP7/HR8WOulYPHTVpfqJesTOdVqPgY6p10H811oRbJG9jvsG8j8kn/Bk8b2wZ9qelNqdNJMDbR5WUyaytaDWW6QdI4+clqjFfwCOw76noDSe+R4pDSzgMiyCk5R4m2ECT1fv/4Axz2bvLN+DRTg5DPPIMLWpA87lgjxeaDlGyJqZCbkJozW7JX0AJVc0X7YR9kzbiTi3LVOInSKY+VHT8yCARIdvXtKc6+IWSbVQqgpNIBB8GN0OvU8xedjPNCMGZnnMtgd7XLTf/okyadbdNLAqQLTbDs/5HnIVx8FyfgiOS/zsim5ivi3ljVAW3T3ePGjkY0q1DMzr5iJ4m/WTL2d1TArlfHyQhkSpFpQPOO+pJyVQqttHJo99vMirQogdSx4lIu//aod0yJyJLpjCeiqb2Fz3Qk0AZ4S78QKeeGsxTRchTP6Wsb6okaZd+cFi6z8qbP0z/Y3xRZO7vOLB/whkqS+pMVKBQ42YzgQPRzbXXmgCkf1nCqgrD9bnIB5ovdRGfDXW86GKY8XwGVjb4BoMvql+HsbonKHAO+eGfQulpB5YfQGQU3ZXdMdfCLAk8FuqemH4k7S7diLzVvRCuisHsEx6qJ4ewxzNCvW7OGVinTR9NSQUCAwEAAQ==';

  private readonly merchantDecryptionPrivateKeyB64 = process.env.PACO_MERCHANT_DECRYPTION_KEY || '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';

  private initError: string | null = null;

  /**
   * Initialize all JOSE crypto keys on module startup
   */
  async onModuleInit() {
    // Log raw env var diagnostics for debugging Railway key issues
    const keyDiag: [string, string][] = [
      ['PACO_MERCHANT_SIGNING_KEY', this.merchantSigningPrivateKeyB64],
      ['PACO_ENCRYPTION_PUBLIC_KEY', this.pacoEncryptionPublicKeyB64],
      ['PACO_MERCHANT_DECRYPTION_KEY', this.merchantDecryptionPrivateKeyB64],
      ['PACO_SIGNING_PUBLIC_KEY', this.pacoSigningPublicKeyB64],
    ];

    for (const [name, val] of keyDiag) {
      const fromEnv = !!process.env[name];
      const len = val?.length || 0;
      const first20 = val?.substring(0, 20) || '(empty)';
      const last20 = val?.substring(Math.max(0, len - 20)) || '';
      this.logger.log(`[PACO-DIAG] ${name}: fromEnv=${fromEnv}, len=${len}, start="${first20}...", end="...${last20}"`);
    }

    try {
      this.logger.log('[PACO] Initializing JOSE crypto keys...');

      // Merchant signing private key (for signing outgoing requests)
      const signingPEM = this.toPEM(this.merchantSigningPrivateKeyB64, 'private');
      try {
        this.signingKey = await importPKCS8(signingPEM, this.JWS_ALGORITHM);
        this.logger.log('[PACO] ✅ Merchant signing key loaded');
      } catch (e: any) {
        throw new Error(`MERCHANT_SIGNING_KEY failed: ${e.message}`);
      }

      // PACO encryption public key (for encrypting outgoing requests)
      const encPEM = this.toPEM(this.pacoEncryptionPublicKeyB64, 'public');
      try {
        this.encryptionKey = await importSPKI(encPEM, this.JWE_ALGORITHM);
        this.logger.log('[PACO] ✅ PACO encryption public key loaded');
      } catch (e: any) {
        throw new Error(`ENCRYPTION_PUBLIC_KEY failed: ${e.message}`);
      }

      // Merchant decryption private key (for decrypting incoming responses)
      const decPEM = this.toPEM(this.merchantDecryptionPrivateKeyB64, 'private');
      try {
        this.decryptionKey = await importPKCS8(decPEM, this.JWE_ALGORITHM);
        this.logger.log('[PACO] ✅ Merchant decryption key loaded');
      } catch (e: any) {
        throw new Error(`MERCHANT_DECRYPTION_KEY failed: ${e.message}`);
      }

      // PACO signing public key (for verifying incoming response signatures)
      const verPEM = this.toPEM(this.pacoSigningPublicKeyB64, 'public');
      try {
        this.verificationKey = await importSPKI(verPEM, this.JWS_ALGORITHM);
        this.logger.log('[PACO] ✅ PACO signing public key loaded');
      } catch (e: any) {
        throw new Error(`SIGNING_PUBLIC_KEY failed: ${e.message}`);
      }

      this.initError = null;
      this.logger.log('[PACO] ✅ All JOSE keys initialized successfully');
      this.logger.log(`[PACO] Endpoint: ${this.paymentEndpoint}`);
      this.logger.log(`[PACO] Merchant: ${this.merchantId}`);
    } catch (error: any) {
      this.initError = error.message;
      this.logger.error(`[PACO] ❌ Failed to initialize JOSE keys: ${error.message}`);
      // Don't crash the app — other payment methods still work
    }
  }

  /**
   * Convert base64-encoded DER key to PEM format.
   *
   * ROBUST: Handles all common Railway / Docker env var issues:
   *   - Surrounding quotes (single or double)
   *   - Literal backslash-n strings from JSON-encoded env vars
   *   - Windows carriage returns
   *   - Stray whitespace or invisible characters
   *   - Keys pasted with PEM headers included
   */
  private toPEM(b64Key: string, type: 'private' | 'public'): string {
    if (!b64Key || b64Key.trim().length === 0) {
      throw new Error(`Empty ${type} key provided`);
    }

    let cleaned = b64Key;

    // Strip surrounding quotes (Railway sometimes wraps values in quotes)
    cleaned = cleaned.replace(/^["']+|["']+$/g, '');

    // If the key already contains PEM headers, normalize and return
    if (cleaned.includes('-----BEGIN')) {
      // Replace literal backslash-n strings with real newlines
      cleaned = cleaned.split('\\r\\n').join('\n');
      cleaned = cleaned.split('\\n').join('\n');
      cleaned = cleaned.replace(/"/g, '');
      return cleaned.trim();
    }

    // Strip ALL non-base64 characters (handles whitespace, newlines, invisible chars, quotes)
    cleaned = cleaned.replace(/[^A-Za-z0-9+/=]/g, '');

    if (cleaned.length === 0) {
      throw new Error(`${type} key is empty after cleaning`);
    }

    // Auto-fix base64 padding (Railway CLI/UI often strips trailing '=' characters)
    while (cleaned.length % 4 !== 0) {
      cleaned += '=';
    }

    // Wrap in PEM format with 64-char lines
    const lines = cleaned.match(/.{1,64}/g) || [];
    const pemLabel = type === 'private' ? 'PRIVATE KEY' : 'PUBLIC KEY';
    return `-----BEGIN ${pemLabel}-----\n${lines.join('\n')}\n-----END ${pemLabel}-----`;
  }

  getInitError() {
    return this.initError;
  }

  /**
   * Encrypt payload: JSON → JWS (sign) → JWE (encrypt)
   * Matches PHP: EncryptPayload() in ActionRequest.php
   */
  async encryptPayload(payload: object): Promise<string> {
    if (!this.signingKey || !this.encryptionKey) {
      throw new Error('PACO JOSE keys not initialized. Check environment variables.');
    }

    const payloadString = JSON.stringify(payload);
    const encoder = new TextEncoder();

    // Step 1: Create JWS (sign the payload)
    const jws = await new CompactSign(encoder.encode(payloadString))
      .setProtectedHeader({
        alg: this.JWS_ALGORITHM,
        typ: this.TOKEN_TYPE,
      })
      .sign(this.signingKey);

    this.logger.debug('[PACO] JWS created (signed) ✓');

    // Step 2: Create JWE (encrypt the JWS)
    const jwe = await new CompactEncrypt(encoder.encode(jws))
      .setProtectedHeader({
        alg: this.JWE_ALGORITHM,
        enc: this.JWE_ENCRYPTION,
        kid: this.encryptionKeyId,
        typ: this.TOKEN_TYPE,
      })
      .encrypt(this.encryptionKey);

    this.logger.debug('[PACO] JWE created (encrypted) ✓');
    return jwe;
  }

  /**
   * Decrypt token: JWE (decrypt) → JWS (verify) → JSON
   * Matches PHP: DecryptToken() in ActionRequest.php
   */
  async decryptToken(token: string): Promise<any> {
    if (!this.decryptionKey || !this.verificationKey) {
      throw new Error('PACO JOSE keys not initialized. Check environment variables.');
    }

    // Step 1: Decrypt JWE
    const { plaintext: jwsBytes } = await compactDecrypt(token, this.decryptionKey);
    const jwsToken = new TextDecoder().decode(jwsBytes);
    this.logger.debug('[PACO] JWE decrypted ✓');

    // Step 2: Verify JWS signature
    const { payload } = await compactVerify(jwsToken, this.verificationKey);
    const decoded = new TextDecoder().decode(payload);
    this.logger.debug('[PACO] JWS verified ✓');

    return JSON.parse(decoded);
  }

  /**
   * Format amount to 12-digit string (e.g., 100 → "000000010000")
   * Matches PHP: str_pad(($amt)*100, 12, "0", STR_PAD_LEFT)
   */
  private formatAmountText(amount: number): string {
    const cents = Math.round(amount * 100);
    return cents.toString().padStart(12, '0');
  }

  /**
   * Check if PACO keys are ready
   */
  isReady(): boolean {
    return !!(this.signingKey && this.encryptionKey && this.decryptionKey && this.verificationKey);
  }

  /**
   * Initiate a payment via PACO — get payment page URL from HBL
   * 
   * Matches: Payment::ExecuteFormJose() from the PHP reference
   */
  async initiatePayment(opts: {
    amount: number;
    currency?: string;
    orderNo: string;
    productDescription: string;
    successUrl: string;
    failedUrl: string;
    cancelUrl: string;
    backendUrl: string;
    browserIp?: string;
  }): Promise<{
    paymentPageURL: string;
    fullResponse: any;
  }> {
    if (!this.isReady()) {
      throw new Error('PACO gateway is not initialized. Check PACO_* environment variables.');
    }

    const now = new Date();
    const currency = opts.currency || 'NPR';
    const apiKey = this.apiKeys[currency] || this.apiKeys['NPR'];

    // Build the payment request (matches PHP structure exactly)
    const request = {
      apiRequest: {
        requestMessageID: uuidv4(),
        requestDateTime: now.toISOString().replace(/\.\d{3}Z$/, '.000Z'),
        language: 'en-US',
      },
      officeId: this.merchantId,
      orderNo: opts.orderNo,
      productDescription: opts.productDescription,
      paymentType: 'CC',
      paymentCategory: 'ECOM',
      storeCardDetails: {
        storeCardFlag: 'N',
        storedCardUniqueID: uuidv4(),
      },
      installmentPaymentDetails: {
        ippFlag: 'N',
        installmentPeriod: 0,
        interestType: null,
      },
      mcpFlag: 'N',
      request3dsFlag: 'Y',
      transactionAmount: {
        amountText: this.formatAmountText(opts.amount),
        currencyCode: currency,
        decimalPlaces: 2,
        amount: opts.amount,
      },
      notificationURLs: {
        confirmationURL: opts.successUrl,
        failedURL: opts.failedUrl,
        cancellationURL: opts.cancelUrl,
        backendURL: opts.backendUrl,
      },
      deviceDetails: {
        browserIp: opts.browserIp || '1.0.0.1',
        browser: 'Chrome',
        browserUserAgent: 'Mozilla/5.0 NRT-Backend/1.0',
        mobileDeviceFlag: 'N',
      },
      purchaseItems: [
        {
          purchaseItemType: 'ticket',
          referenceNo: opts.orderNo,
          purchaseItemDescription: opts.productDescription,
          purchaseItemPrice: {
            amountText: this.formatAmountText(opts.amount),
            currencyCode: currency,
            decimalPlaces: 2,
            amount: opts.amount,
          },
          subMerchantID: 'string',
          passengerSeqNo: 1,
        },
      ],
      customFieldList: [
        {
          fieldName: 'Source',
          fieldValue: 'New Road Travels',
        },
      ],
    };

    // Build JWT payload (matches PHP structure)
    const payload = {
      request,
      iss: apiKey,
      aud: 'PacoAudience',
      CompanyApiKey: apiKey,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // +1 hour
    };

    this.logger.log(`[PACO] Initiating payment: ${opts.amount} ${currency}, Order: ${opts.orderNo}`);

    // Encrypt payload using JOSE
    const encryptedBody = await this.encryptPayload(payload);
    this.logger.log('[PACO] Payload encrypted, sending to PACO API...');

    // Send to PACO API
    const response = await fetch(`${this.paymentEndpoint}api/1.0/Payment/prePaymentUi`, {
      method: 'POST',
      headers: {
        'Accept': 'application/jose',
        'CompanyApiKey': apiKey,
        'Content-Type': 'application/jose; charset=utf-8',
      },
      body: encryptedBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      const headers = Object.fromEntries(response.headers.entries());
      this.logger.error(`[PACO] API error: ${response.status} - headers: ${JSON.stringify(headers)}`);
      this.logger.error(`[PACO] API error body (${errorText.length} chars): ${errorText.substring(0, 500)}`);
      
      // Try to decrypt if it looks like a JOSE token
      if (errorText && errorText.includes('.')) {
        try {
          const decrypted = await this.decryptToken(errorText);
          this.logger.error(`[PACO] Decrypted error: ${JSON.stringify(decrypted)}`);
          throw new Error(`PACO rejected: ${JSON.stringify(decrypted)}`);
        } catch (decErr: any) {
          this.logger.error(`[PACO] Could not decrypt error response: ${decErr.message}`);
          throw new Error(`PACO API returned ${response.status}, but we couldn't decrypt the error message! Decryption failed with: "${decErr.message}". This usually means your PACO_SIGNING_PUBLIC_KEY or PACO_MERCHANT_DECRYPTION_KEY in Railway is incorrect.`);
        }
      }
      throw new Error(`PACO API returned ${response.status}: ${errorText || '(empty body)'}`);
    }

    // Decrypt response
    const responseToken = await response.text();
    this.logger.log('[PACO] Got encrypted response, decrypting...');

    const decryptedResponse = await this.decryptToken(responseToken);
    this.logger.log('[PACO] Response decrypted ✓');
    this.logger.debug(`[PACO] Response: ${JSON.stringify(decryptedResponse, null, 2)}`);

    // Extract payment page URL
    const paymentPageURL = decryptedResponse?.response?.Data?.paymentPage?.paymentPageURL;

    if (!paymentPageURL) {
      this.logger.error(`[PACO] No paymentPageURL in response: ${JSON.stringify(decryptedResponse)}`);
      throw new Error('PACO did not return a payment page URL. Check credentials and request format.');
    }

    return {
      paymentPageURL,
      fullResponse: decryptedResponse,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // GENERIC JOSE API HELPER
  // Reusable for Inquiry, Settlement, Refund, Void — same encrypt/send/decrypt pattern
  // ═══════════════════════════════════════════════════════════════════════

  private async sendJoseRequest(
    endpoint: string,
    method: 'POST' | 'PUT',
    request: object,
    currency = 'NPR',
  ): Promise<any> {
    if (!this.isReady()) {
      throw new Error('PACO gateway is not initialized. Check PACO_* environment variables.');
    }

    const apiKey = this.apiKeys[currency] || this.apiKeys['NPR'];

    const payload = {
      request,
      iss: apiKey,
      aud: 'PacoAudience',
      CompanyApiKey: apiKey,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const encryptedBody = await this.encryptPayload(payload);

    const response = await fetch(`${this.paymentEndpoint}${endpoint}`, {
      method,
      headers: {
        'Accept': 'application/jose',
        'CompanyApiKey': apiKey,
        'Content-Type': 'application/jose; charset=utf-8',
      },
      body: encryptedBody,
    });

    const responseText = await response.text();

    if (!response.ok) {
      this.logger.error(`[PACO] ${endpoint} error: ${response.status}`);
      // Try to decrypt error response
      if (responseText && responseText.includes('.')) {
        try {
          const decrypted = await this.decryptToken(responseText);
          this.logger.error(`[PACO] Decrypted error: ${JSON.stringify(decrypted)}`);
          throw new Error(`PACO API error: ${JSON.stringify(decrypted)}`);
        } catch (decErr: any) {
          if (decErr.message.startsWith('PACO API error:')) throw decErr;
          this.logger.error(`[PACO] Could not decrypt error: ${decErr.message}`);
        }
      }
      throw new Error(`PACO API ${endpoint} returned ${response.status}: ${responseText.substring(0, 300) || '(empty)'}`);
    }

    const decryptedResponse = await this.decryptToken(responseText);
    this.logger.debug(`[PACO] ${endpoint} response decrypted ✓`);
    return decryptedResponse;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // INQUIRY — Look up transaction status
  // Matches: Inquiry::ExecuteJose() from PHP reference
  // ═══════════════════════════════════════════════════════════════════════

  async inquireTransaction(orderNo: string): Promise<any> {
    const now = new Date();

    const request = {
      apiRequest: {
        requestMessageID: uuidv4(),
        requestDateTime: now.toISOString().replace(/\.\d{3}Z$/, '.000Z'),
        language: 'en-US',
      },
      advSearchParams: {
        controllerInternalID: null,
        officeId: [this.merchantId],
        orderNo: [orderNo],
        invoiceNo2C2P: null,
        fromDate: '0001-01-01T00:00:00',
        toDate: '0001-01-01T00:00:00',
        amountFrom: null,
        amountTo: null,
      },
    };

    this.logger.log(`[PACO-INQUIRY] Looking up order: ${orderNo}`);
    return this.sendJoseRequest('api/1.0/Inquiry/transactionList', 'POST', request);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SETTLEMENT — Capture/settle an authorized payment
  // Matches: Settlement::ExecuteJose() from PHP reference
  // ═══════════════════════════════════════════════════════════════════════

  async settleTransaction(opts: {
    orderNo: string;
    amount: number;
    currency?: string;
    approvalCode: string;
    productDescription?: string;
  }): Promise<any> {
    const currency = opts.currency || 'NPR';

    const request = {
      officeId: this.merchantId,
      orderNo: opts.orderNo,
      productDescription: opts.productDescription || `Settlement for ${opts.orderNo}`,
      issuerApprovalCode: opts.approvalCode,
      actionBy: 'System',
      settlementAmount: {
        amountText: this.formatAmountText(opts.amount),
        currencyCode: currency,
        decimalPlaces: 2,
        amount: opts.amount,
      },
    };

    this.logger.log(`[PACO-SETTLE] Settling order: ${opts.orderNo}, amount: ${opts.amount} ${currency}`);
    return this.sendJoseRequest('api/1.0/Settlement', 'PUT', request, currency);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // REFUND — Refund a completed transaction
  // Matches: Refund::ExecuteJose() from PHP reference
  // ═══════════════════════════════════════════════════════════════════════

  async refundTransaction(opts: {
    orderNo: string;
    amount: number;
    currency?: string;
    actionBy?: string;
    actionEmail?: string;
  }): Promise<any> {
    const currency = opts.currency || 'NPR';

    const request = {
      refundAmount: {
        AmountText: this.formatAmountText(opts.amount),
        CurrencyCode: currency,
        DecimalPlaces: 2,
        Amount: opts.amount,
      },
      refundItems: [],
      localMakerChecker: {
        maker: {
          username: opts.actionBy || 'System|NRT-Admin',
          email: opts.actionEmail || 'admin@newroadtravels.com',
        },
      },
      officeId: this.merchantId,
      orderNo: opts.orderNo,
    };

    this.logger.log(`[PACO-REFUND] Refunding order: ${opts.orderNo}, amount: ${opts.amount} ${currency}`);
    return this.sendJoseRequest('api/1.0/Refund/refund', 'POST', request, currency);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VOID — Void an unsettled transaction
  // Matches: VoidRequest::ExecuteJose() from PHP reference
  // ═══════════════════════════════════════════════════════════════════════

  async voidTransaction(opts: {
    orderNo: string;
    amount: number;
    currency?: string;
    approvalCode: string;
    productDescription?: string;
  }): Promise<any> {
    const currency = opts.currency || 'NPR';

    const request = {
      officeId: this.merchantId,
      orderNo: opts.orderNo,
      productDescription: opts.productDescription || `Void for ${opts.orderNo}`,
      issuerApprovalCode: opts.approvalCode,
      actionBy: 'System',
      voidAmount: {
        amountText: this.formatAmountText(opts.amount),
        currencyCode: currency,
        decimalPlaces: 2,
        amount: opts.amount,
      },
    };

    this.logger.log(`[PACO-VOID] Voiding order: ${opts.orderNo}, amount: ${opts.amount} ${currency}`);
    return this.sendJoseRequest('api/1.0/Void', 'POST', request, currency);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DECRYPT BACKEND NOTIFICATION
  // PACO sends server-to-server JWE callbacks to the backendURL.
  // This decrypts the notification body for processing.
  // ═══════════════════════════════════════════════════════════════════════

  async decryptBackendNotification(encryptedBody: string): Promise<any> {
    if (!this.isReady()) {
      throw new Error('PACO gateway is not initialized.');
    }
    return this.decryptToken(encryptedBody);
  }
}
