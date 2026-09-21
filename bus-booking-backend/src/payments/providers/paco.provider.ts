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

  private readonly merchantSigningPrivateKeyB64 = process.env.PACO_MERCHANT_SIGNING_KEY || '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';
  private readonly pacoEncryptionPublicKeyB64 = process.env.PACO_ENCRYPTION_PUBLIC_KEY || 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA6ZLups2K0iYEMxQqgASX8gY6tWhNVCp08YuDgjCsOVrGVgUHD0dh0TWFNJ7Lq2Jp0SOsGgi54+hrjwPOL2CCZxw8pKUlL57UksoD9oWUrK/KkSvEAwPU4cZqzxIXyhBcZb8O96iN4WQJILkRTg+DXLkML6qisO496fPGIs+vCoc87toucy5O9fRfaYSjcqjreyi8JDkvVJM/BeNtOEM2a0b/lcWa67RH+tN97H25k+Qez7QthLru6oBfWBgD6iIwhV+ICqLWHmp6fQ+DHQk/o+OO3yFiY9OAvMiy8MOTinvkBlFwYgYNznG3/w0Xh8U5vtudUXPDNUO6ddf4y99+6LlWDiKgJn/Th93YUg+gFH4LUJHyPrSY2JuC+Q8kksp2xyiZDTHGzi96kturwrqCui6TytCHcU4UB0VRMR+M7VRl3S2YPhcxv5U8Fh2PITqydZE5vv1Va06qhegjOlSZnEUl2xKPm5k/u+UHvUP/oq04fQLTlYqyA3JYDCe4z5Ea2SOgjeVl+qTatWYzmkUXyCONLZ4UaRrgbYCp0nCPHoTFgRQdChu8ezDbnYY9IW7cT/s2fEi5N7X1XrQttiEP4rbn0y0qVYYjN86+elfhtYGHidZTUSUS5RSTHqOkj59p5LIGwFF9iTXzCjfUqq8clnfOk76qSLY1+Kj+SMMe6Z8CAwEAAQ==';
  private readonly pacoSigningPublicKeyB64 = process.env.PACO_SIGNING_PUBLIC_KEY || 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAr0XW6QacR8GilY4nZrJZW40wnFeYu7h9aXUSqxCP6djurCWZmLqnrsYWP7/HR8WOulYPHTVpfqJesTOdVqPgY6p10H811oRbJG9jvsG8j8kn/Bk8b2wZ9qelNqdNJMDbR5WUyaytaDWW6QdI4+clqjFfwCOw76noDSe+R4pDSzgMiyCk5R4m2ECT1fv/4Axz2bvLN+DRTg5DPPIMLWpA87lgjxeaDlGyJqZCbkJozW7JX0AJVc0X7YR9kzbiTi3LVOInSKY+VHT8yCARIdvXtKc6+IWSbVQqgpNIBB8GN0OvU8xedjPNCMGZnnMtgd7XLTf/okyadbdNLAqQLTbDs/5HnIVx8FyfgiOS/zsim5ivi3ljVAW3T3ePGjkY0q1DMzr5iJ4m/WTL2d1TArlfHyQhkSpFpQPOO+pJyVQqttHJo99vMirQogdSx4lIu//aod0yJyJLpjCeiqb2Fz3Qk0AZ4S78QKeeGsxTRchTP6Wsb6okaZd+cFi6z8qbP0z/Y3xRZO7vOLB/whkqS+pMVKBQ42YzgQPRzbXXmgCkf1nCqgrD9bnIB5ovdRGfDXW86GKY8XwGVjb4BoMvql+HsbonKHAO+eGfQulpB5YfQGQU3ZXdMdfCLAk8FuqemH4k7S7diLzVvRCuisHsEx6qJ4ewxzNCvW7OGVinTR9NSQUCAwEAAQ==';
  private readonly merchantDecryptionPrivateKeyB64 = process.env.PACO_MERCHANT_DECRYPTION_KEY || 'MIIJQgIBADANBgkqhkiG9w0BAQEFAASCCSwwggkoAgEAAoICAQDI4mdHpDrUVG6KO3w89SZ6mcprUy+GI30gAO516v+9kkwnqot3W0HHBMSNWn+Ura2Z7ZzD3LfGMlrLBkEr8Ih/mI5SNU0lq9y0h3Cra7EeVs4YAkLzkaLBwTXbndMk0wHplpnyUh0F6SHW8FDUI6LitLYHF1jCOeV6aJ/spwfeNJDlQ+mUiNOmOtmoR4kZVq+Nv7RUIdYhGTnW1nIos+utfJ9SYvsTvP9+F1eqzKLrnWe2mD+gOfZ/VOURwNqN+etRpPJ+o4ToRccxMjEDIDA0FVC6T4JJojaakZdnEK7ufe7tNuXmW3pRA80xXFsUPtLE07aet89L0kPb4EHioUqVAHDZnmLM2SD/jZg5viz6/B8dW0oIvzoTKZg1tSD1t8KXvpoBLrowQbw5OiUIdanJowCabcu2D05S869gA3YMPCWFN+BwXafNA4RP6poOw3FXp/0RNpVmIPXugQSlkF0NrphEIMUQodSVcKyhDVQ830xOVulkNjius3miYMWF2aPVVA9HTclZDT5qh9+ZNb7v5we/jzcoxh7kaZ7h3nK/4RnFThMhoBbhgVNr0LNRlhOJeu57G69R1AiW1b5EDcIzys8B/7JzcSQ1kKwywYZ+QTK3GQvqyCTfDsv2Ms1YCybSk3y8b3cIGiCHXZGSq6q2PI0lo7Bg7RgOQNsiIEkm9QIDAQABAoICAGIXvBsNpPR97iRt+7LAevOvGVrjGffEaJsyGT9Xa14kjC9qZgP4edw3BcuIf3gYfwcFMmGp68tKV2+ANF7Ca8Tyt7yI7o0QqQs2f9wVED4iYSz0HcFWQkWelTASl0IKD4sC0VW0pxt1xeJxIucUJ7vQRnqb+emN3/KwGDe1MHBe9sodKXgwgDlRz2sO03GeFMeA7wuOIkOzT70KpmAdy13B1wKh9ryis5fcyiBLINsw164gFiGlbCqtR9YteAuQGEqb4xXXv1S0jhoFyk0ecKteJTd1D8fpAATmRyo6yVEICZ2oCwc7cDUTSCVsVcVDECSwxSIn23/Iwv4hOcryu7m71cPSHjq9F5Mrk7po2b8hcx42Pj3xl94WTzS735r0yXX/qkhRoh/7uzzGef5F31dTOrAaBGAvzU5zHW2VGGLcsXaBay7I0+yOl7jnMRdGYpabf6QRlR8jTYsqa31lo5kQnKFmiC9KvSO+AzGTdiTQnwBdYtxYw+zCrAnK6siMLbR5fRbWmWWJtleHnl6rSOe79ZZC++iGmQhm3gql9eV53+Iqd9j3yyGXAW/eB6I0MFqaOpZa5SKUJyCvjNOOiEgUQQHOQCYBHrzkoWMTYG7AXGTj21vxxxLHa3HFOBjjflcxCoxJ8Q56dEwwjLKsd3RT7tx5LbGIvifzCWRHElVBAoIBAQD9MTwC1dioR5inxCiC/7CeWQKfTJJvS2obKcAfq95uUNLNKdod9N8eUGG3c9iig20IEorFU2j+Q+Zca/tE7hF7A2T6Elhktq+qp6cmeSHgIiepI+sIhr2meBGF9jcBWpM9wDqoRP0iXUxo5nqfs5qKL/4kzCEYydCy0l0baC66xExn3RdaURB/WK7/PddRyzRzFi5h9OmEVc1g0sIqFVK6XAsYOjfeexCfvMlW+UbV3i7uANm2FBrTqyctZRJykXEfmvz1HnULcRt32ym/hMM+9U8CXyN3BkzuajlJyZ8L5akbK3ioNyfCiSyg/Az2pB99VwDRaj6cWZmvs+R58kdZAoIBAQDLHK01I/5bCTyinAHFgMX/O9gB8zinRbanc5pG4jKP4nnZzimwpS2S4GP30I4LQu0mzx/cA8+JeCCXncAUD+Qv7HzaQwNA7oMAKUhRHKJF1Q8mG5iw4zcO5JbLGiUEqIrSdMuLlyXr3ym2CyxPhQSDIAyUtNKlHlDnEIpQo6kDBFPL4a1/aUZ3LgWoS3DDJDupdziR2+/6VmaxthTC3yaY+qa4gtO2aJeSWmhOsYM9nr+xB0nGRr6M92+Se0+PvInumSo2gwAx68EZfHuaQdZkh0/dNFsO/MbGdzL2Jpl/kpt/83fNmzouMhNbvCqE/ucprOKZ6Hx3Xjc/0dPgbUT9AoIBAQDTvRPZryqj+FQSoPncK6ZxljCaNbgUePYAR1cTZXD7wn2387Mj8D+TI1fEyo21wsEwygjhYpLgaLpCOk+E4q8dt8X/V84yU5Du34vqocyRmx6d1Zrdo4kAqVLGPBTd/fg64QJs7FzhGzMmWvDbk6C+xcn8zfUzvLragRA6NlM1/6mCBqRb9IUeanTWocnq7kwrnrYlV2LeN78spLSZ6wEnNohUt4M3fKV3YLLkGE2D125Zvb5UBdY1g+GclfTqePUooD3BY7owWmPFRTRRpN5/TTjI2/VVuaAmlhDYw1NN6L8WKLGbw5xtlLgM3RyeOrzW3iah+v7nVAsxo/iDfvjpAoIBABwZtJD0kN0xcvUgVlJn1XzRX7otVzo1N+cE5GRIKSyk7azHjBcHUz3N06bWcMB4Gu1SnJrI4C6pswCm74sXA7/pnQBpYwrZtMAR9hJavsyghH8GNGLMnLJvx7kDvfleBA7H391JJRL0BgZMl23M/mnRxkvQlJAJmLHPJQOxENH9CEbdyy4kd35HnLrC7S/iVGrGtsnfPt1IlN6jTU4Ep4dkrio612WWJNo3rdStVHXy/5xTYM6QvQ4tsX73lnNRZ1feUuvFxgIiFs4a3dLipvGzksYM10hEio+ssB1EC9qNgvv5yCpm/m6juO/pIYzS41Jtu9AFTSsKmuQ2eHTFSVUCggEAcLAvtZg6+LPLBPYKI19pVWuLiAankI8vgaLO1ux8RQlj0RJa9nr/UYEge0AN2H//hPjVWOmbsjMBasKv08JPLKWZe3heKYkT+lrcCLzPbcXWc5XcZSkT2tUeR+PY+jd4eHDE/CIJpFpFLh62S2vNANPOyB5B+O40d3BF/y7YISIVcQD7vp9F8VfP1UvHmd0pJtgb9Cq+pRN2vNpKYOYPlotFa+yTVkaGltohEMCEKQP3Cmsk7dZFnVTH6dw5oJ6nhQiwLoHSFbgnRVsMubHMpt8C/bbUpTaM/qFYimt/g0WC4ZcrYabd8rPtG8akNl17bQFVfdvwIIanyZgEIGMbjw==';

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

  async initiate(bookingId: string, amount: number, currency: string, frontendUrl: string): Promise<InitiatePaymentResult> {
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
        confirmationURL: `${frontendUrl}/payment/callback/paco`,
        failedURL: `${frontendUrl}/payment/callback/paco`,
        cancellationURL: `${frontendUrl}/payment/callback/paco`,
        backendURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/payments/paco/webhook`,
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
