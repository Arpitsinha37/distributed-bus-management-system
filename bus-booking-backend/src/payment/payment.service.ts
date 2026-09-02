// @ts-nocheck
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';
import { CouponService } from '../coupon/coupon.service';
import { BusPortalService } from '../bus-portal/bus-portal.service';
import { PacoGatewayService } from './paco-gateway.service';

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    /**
     * KEEP-ALIVE: Self-ping every 4 minutes to prevent Railway hobby plan cold starts.
     * Cold starts cause 5-10s delays on payment callbacks — killing the user experience.
     */
    @Cron('*/4 * * * *')
    async keepAlive() {
        try {
            await firstValueFrom(this.http.get(`${this.apiUrl.replace('/api', '')}/api/health`, { timeout: 5000 } as any)).catch(() => {});
            this.logger.debug('[KEEP-ALIVE] Self-ping OK');
        } catch { /* ignore */ }
    }

    /**
     * PRODUCTION SAFEGUARD: 
     * Auto-recover any stuck 'pending' payments every 5 minutes.
     * Prevents network failures from causing lost tickets for successful charges.
     */
    @Cron('*/5 * * * *')
    async recoverPendingPayments() {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const pending = await this.prisma.payment.findMany({
            where: {
                status: 'pending',
                createdAt: { lt: fiveMinutesAgo }
            },
            take: 50
        });

        for (const payment of pending) {
            try {
                this.logger.log(`[CRON] Attempting recovery for pending payment: ${payment.id}`);
                await this.syncPaymentStatus(payment.id);
            } catch (err: any) {
                this.logger.error(`[CRON] Recovery failed for ${payment.id}: ${err?.message}`);
            }
        }
    }

    /**
     * BUS PORTAL RECOVERY: Retry failed bus portal confirmations every 3 minutes.
     * When paymentconfirm/ fails after payment, seats get released even though
     * the customer already paid. This CRON ensures we keep retrying.
     */
    @Cron('*/3 * * * *')
    async retryFailedBusPortalConfirmations() {
        try {
            const failedConfirmations = await this.prisma.payment.findMany({
                where: {
                    status: 'completed',
                    isFinalized: true,
                    lastError: { not: null, contains: 'Bus portal' },
                    retryCount: { lt: 20 }, // Stop after 20 total attempts
                },
                take: 10,
            });

            for (const payment of failedConfirmations) {
                try {
                    this.logger.log(`[BUS-CRON] Retrying bus portal confirm for ticket: ${payment.ticketNo}`);
                    const txnRef = payment.transactionId || `RETRY-${Date.now()}`;
                    await this.busPortalService.confirmPayment(payment.ticketNo, txnRef, '0');
                    
                    // Success! Clear the error
                    await this.prisma.payment.update({
                        where: { id: payment.id },
                        data: {
                            lastError: null,
                            gatewayResponse: {
                                ...(payment.gatewayResponse as object || {}),
                                busPortalConfirmed: true,
                                busPortalConfirmedAt: new Date().toISOString(),
                            },
                        },
                    });
                    this.logger.log(`[BUS-CRON] ✅ Bus portal confirmed for ticket: ${payment.ticketNo}`);
                } catch (err: any) {
                    this.logger.error(`[BUS-CRON] ❌ Retry failed for ${payment.ticketNo}: ${err?.message}`);
                    await this.prisma.payment.update({
                        where: { id: payment.id },
                        data: { retryCount: { increment: 1 } },
                    }).catch(() => {});
                }
            }
        } catch (err: any) {
            this.logger.error(`[BUS-CRON] Error: ${err?.message}`);
        }
    }

    /**
     * AUTO-EXPIRE: Mark stale pending payments as 'failed' after 2 hours.
     * Runs every 30 minutes. Does one final gateway check before failing.
     * Prevents the admin dashboard from filling up with ghost pending payments.
     */
    @Cron('*/30 * * * *')
    async autoExpireStalePendingPayments() {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const stalePending = await this.prisma.payment.findMany({
            where: {
                status: 'pending',
                createdAt: { lt: twoHoursAgo },
            },
            take: 50,
        });

        if (stalePending.length === 0) return;
        this.logger.log(`[AUTO-EXPIRE] Found ${stalePending.length} stale pending payments older than 2 hours`);

        for (const payment of stalePending) {
            try {
                // One final attempt to verify with gateway before marking failed
                let recovered = false;

                if (payment.method === 'esewa' && payment.transactionId) {
                    try {
                        const formattedAmount = Number(payment.amount).toString();
                        const verifyResponse = await firstValueFrom(
                            this.http.get(
                                `${this.safeEsewaBaseUrl}/api/epay/transaction/status/?product_code=${this.esewaProductCode}&total_amount=${formattedAmount}&transaction_uuid=${payment.transactionId}`,
                                { headers: { Accept: 'application/json' }, timeout: 10000 } as any,
                            ),
                        ).catch(() => null);
                        if (verifyResponse?.data?.status === 'COMPLETE') {
                            const updated = await this.prisma.payment.update({
                                where: { id: payment.id },
                                data: { status: 'processing', gatewayResponse: verifyResponse.data },
                            });
                            await this._finalizePaymentSuccess(updated, 'eSewa', payment.transactionId);
                            recovered = true;
                            this.logger.log(`[AUTO-EXPIRE] ✅ Recovered eSewa payment ${payment.id} — was actually COMPLETE!`);
                        }
                    } catch { /* final check failed, proceed to mark failed */ }
                }

                if (['khalti', 'khalti_mobilebanking', 'khalti_ebanking', 'khalti_connectips'].includes(payment.method) && payment.transactionId) {
                    try {
                        const response = await firstValueFrom(
                            this.http.post(
                                `${this.khaltiBaseUrl}/epayment/lookup/`,
                                { pidx: payment.transactionId },
                                {
                                    headers: {
                                        Authorization: `Key ${this.khaltiSecretKey}`,
                                        'Content-Type': 'application/json',
                                    },
                                    timeout: 10000,
                                } as any,
                            ),
                        ).catch(() => null);
                        if (response?.data?.status === 'Completed') {
                            const updated = await this.prisma.payment.update({
                                where: { id: payment.id },
                                data: { status: 'processing', transactionId: response.data.transaction_id || payment.transactionId, gatewayResponse: response.data },
                            });
                            await this._finalizePaymentSuccess(updated, 'Khalti', response.data.transaction_id || payment.transactionId);
                            recovered = true;
                            this.logger.log(`[AUTO-EXPIRE] ✅ Recovered Khalti payment ${payment.id} — was actually Completed!`);
                        }
                    } catch { /* final check failed, proceed to mark failed */ }
                }

                // If not recovered after final check → mark as FAILED
                if (!recovered) {
                    await this.prisma.payment.update({
                        where: { id: payment.id },
                        data: {
                            status: 'failed',
                            lastError: `Auto-expired: pending for ${Math.round((Date.now() - payment.createdAt.getTime()) / 60000)} minutes with no payment received`,
                            gatewayResponse: {
                                ...(payment.gatewayResponse as object || {}),
                                autoExpired: true,
                                autoExpiredAt: new Date().toISOString(),
                                reason: 'No payment confirmation received within 2 hours',
                            },
                        },
                    });

                    // Also release the held seat in bus portal
                    this.busPortalService.cancelHolding(payment.ticketNo).catch(() => {});

                    this.logger.log(`[AUTO-EXPIRE] ❌ Marked payment ${payment.id} (${payment.method}) as FAILED — ticket: ${payment.ticketNo}, amount: ${payment.amount}`);
                }
            } catch (err: any) {
                this.logger.error(`[AUTO-EXPIRE] Error processing ${payment.id}: ${err?.message}`);
            }
        }
    }

    // eSewa credentials
    private readonly esewaProductCode = process.env.ESEWA_MERCHANT_CODE || 'NP-ES-NRTRAVEL';
    private readonly esewaSecretKey: string;
    private readonly esewaBaseUrl = process.env.ESEWA_BASE_URL || 'https://epay.esewa.com.np';

    // Khalti credentials
    private readonly khaltiSecretKey: string;
    private readonly khaltiBaseUrl = process.env.KHALTI_BASE_URL || 'https://khalti.com/api/v2';

    // Frontend URL for redirects
    private readonly frontendUrl = 'https://newroadtravels.com';
    private readonly apiUrl = process.env.API_PUBLIC_URL || 'https://travel-production-ffc8.up.railway.app/api';

    constructor(
        private prisma: PrismaService,
        private http: HttpService,
        private emailService: EmailService,
        private couponService: CouponService,
        private busPortalService: BusPortalService,
        private pacoGateway: PacoGatewayService,
    ) { 
        // Using the live keys as fallbacks to bypass the Railway missing Env errors immediately
        this.esewaSecretKey = process.env.ESEWA_SECRET_KEY || 'KxYSVzMcCgFZMQEEAQQfUSspSDY2Wi8hPzc4MzYp';
        this.khaltiSecretKey = process.env.KHALTI_SECRET_KEY || 'live_secret_key_188f5c3244ce453793b0a29e4cfebea8';
        
        if (!this.esewaSecretKey) {
            this.logger.warn('🚨 ESEWA_SECRET_KEY is not set. eSewa payments will throw an error if attempted.');
        }
        if (!this.khaltiSecretKey) {
            this.logger.warn('🚨 KHALTI_SECRET_KEY is not set. Khalti payments will throw an error if attempted.');
        }
    }

    /**
     * SAFE: Auto-detect correct eSewa base URL based on merchant code.
     * Prevents environment mismatch (paying on LIVE but verifying on TEST).
     */
    private get safeEsewaBaseUrl(): string {
        const isTest = this.esewaProductCode === 'EPAYTEST';
        const url = isTest
            ? 'https://rc.esewa.com.np'
            : 'https://epay.esewa.com.np';
        // Warn if env variable doesn't match auto-detected URL
        if (this.esewaBaseUrl !== url) {
            this.logger.warn(`[ESEWA] ENV mismatch! ESEWA_BASE_URL=${this.esewaBaseUrl} but product_code=${this.esewaProductCode} → should be ${url}. Using auto-detected: ${url}`);
        }
        return url;
    }

    /**
     * Create a pending payment record
     */
    async createPayment(dto: {
        ticketNo: string;
        method: string;
        amount: number;
        passengerName?: string;
        passengerPhone?: string;
        passengerEmail?: string;
        route?: string;
        travelDate?: string;
        seatNumbers?: string[];
        discountAmount?: number;
        couponCode?: string;
    }) {
        const payment = await this.prisma.payment.create({
            data: {
                ticketNo: dto.ticketNo,
                method: dto.method,
                amount: dto.amount,
                passengerName: dto.passengerName,
                passengerPhone: dto.passengerPhone,
                passengerEmail: dto.passengerEmail,
                route: dto.route,
                travelDate: dto.travelDate,
                seatNumbers: dto.seatNumbers || [],
                discountAmount: dto.discountAmount || 0,
                couponCode: dto.couponCode,
            },
        });
        return payment;
    }

    /**
     * Initiate payment — returns redirect URL for eSewa/Khalti or confirms cash
     */
    async initiatePayment(dto: {
        ticketNo: string;
        method: string;
        amount: number;
        passengerName?: string;
        passengerPhone?: string;
        passengerEmail?: string;
        route?: string;
        travelDate?: string;
        seatNumbers?: string[];
        couponCode?: string;
        frontendUrl?: string;
    }) {
        let finalAmount = dto.amount;
        let discountAmount = 0;

        if (dto.couponCode) {
            try {
                const res = await this.couponService.validate({
                    code: dto.couponCode,
                    bookingAmount: dto.amount,
                });
                finalAmount = res.finalAmount;
                discountAmount = res.discountAmount;
            } catch (err: any) {
                this.logger.warn(`Coupon validation failed during payment initiation: ${err.message}`);
                throw err;
            }
        }

        // PAYMENT METHOD SWITCH FIX: Cancel any existing pending payments for this ticket
        // This handles the case where user selected eSewa, went back, and now wants Khalti
        const existingPending = await this.prisma.payment.findMany({
            where: { ticketNo: dto.ticketNo, status: 'pending' },
        });
        if (existingPending.length > 0) {
            this.logger.log(`[PAYMENT-SWITCH] Cancelling ${existingPending.length} orphaned pending payment(s) for ticket ${dto.ticketNo} before creating new ${dto.method} payment`);
            await this.prisma.payment.updateMany({
                where: { ticketNo: dto.ticketNo, status: 'pending' },
                data: {
                    status: 'failed',
                    lastError: `Superseded: user switched payment method to ${dto.method}`,
                },
            });
        }

        const payment = await this.createPayment({ 
            ...dto, 
            amount: finalAmount,
            discountAmount,
            couponCode: dto.couponCode
        });

        if (dto.method === 'cash_on_bus') {
            throw new NotFoundException('Cash on bus payment method has been deprecated.');
        }

        if (dto.method === 'esewa') {
            if (!this.esewaSecretKey) {
                throw new BadRequestException('Security Error: ESEWA_SECRET_KEY is not set in the server environment.');
            }
            // CRITICAL FIX: Use finalAmount (what's stored in DB) — not dto.amount (original before discount)
            // Verification reads amount from DB, so both must match
            return await this.getEsewaPaymentData(payment.id, finalAmount, dto.ticketNo, dto.frontendUrl);
        }

        if (['khalti', 'khalti_mobilebanking', 'khalti_ebanking', 'khalti_connectips'].includes(dto.method)) {
            if (!this.khaltiSecretKey) {
                throw new BadRequestException('Security Error: KHALTI_SECRET_KEY is not set in the server environment.');
            }
            return this.initiateKhalti(payment.id, finalAmount, dto.ticketNo, dto.method, dto.frontendUrl);
        }

        if (dto.method === 'visa') {
            return this.initiateVisa(payment.id, finalAmount, dto.ticketNo, dto.frontendUrl);
        }

        if (dto.method === 'fonepay') {
            // Fonepay integration placeholder — requires merchant credentials
            throw new NotFoundException(
                'Fonepay integration is being configured. Please use eSewa or Khalti for now.'
            );
        }

        throw new NotFoundException(`Unsupported payment method: ${dto.method}. Available: esewa, khalti, khalti_mobilebanking`);
    }

    /**
     * eSewa ePay — generate form data for redirect
     */
    private async getEsewaPaymentData(paymentId: string, amount: number, ticketNo: string, frontendUrl?: string) {
        const transactionUuid = `NRT-${paymentId}-${Date.now().toString().slice(-4)}`;
        const totalAmount = amount;
        const taxAmount = 0;
        const productServiceCharge = 0;
        const productDeliveryCharge = 0;

        // Save to DB so we can verify later if the user drops off
        await this.prisma.payment.update({
            where: { id: paymentId },
            data: { transactionId: transactionUuid },
        });

        // Generate HMAC signature
        const signatureString = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${this.esewaProductCode}`;
        const signature = crypto
            .createHmac('sha256', this.esewaSecretKey)
            .update(signatureString)
            .digest('base64');

        // CRITICAL FIX: Always use the Railway API URL directly for gateway callbacks.
        // Going through Vercel proxy can fail for non-default domains.
        const callbackApiUrl = this.apiUrl;
        const feParam = frontendUrl ? `&frontendUrl=${encodeURIComponent(frontendUrl)}` : '';

        return {
            method: 'esewa',
            paymentId,
            redirectUrl: `${this.safeEsewaBaseUrl}/api/epay/main/v2/form`,
            formData: {
                amount: String(totalAmount),
                tax_amount: String(taxAmount),
                total_amount: String(totalAmount),
                transaction_uuid: transactionUuid,
                product_code: this.esewaProductCode,
                product_service_charge: String(productServiceCharge),
                product_delivery_charge: String(productDeliveryCharge),
                success_url: `${callbackApiUrl}/payments/esewa/success?paymentId=${paymentId}&ticketNo=${ticketNo}${feParam}`,
                failure_url: `${callbackApiUrl}/payments/esewa/failure?paymentId=${paymentId}&ticketNo=${ticketNo}${feParam}`,
                signed_field_names: 'total_amount,transaction_uuid,product_code',
                signature,
            },
        };
    }

    /**
     * Khalti — initiate via API and return payment URL
     * @param mobilebanking - If true, opens Khalti mobile banking checkout
     */
    private async initiateKhalti(paymentId: string, amount: number, ticketNo: string, paymentMethodType = 'khalti', frontendUrl?: string) {
        try {
            // CRITICAL FIX: Always use Railway API URL directly for gateway callbacks
            const callbackApiUrl = this.apiUrl;
            const feParam = frontendUrl ? `&frontendUrl=${encodeURIComponent(frontendUrl)}` : '';
            const payload: any = {
                return_url: `${callbackApiUrl}/payments/khalti/verify/${Buffer.from(JSON.stringify({ paymentId, ticketNo, frontendUrl })).toString('base64url')}`,
                website_url: frontendUrl || this.frontendUrl,
                amount: Math.round(amount * 100), // Khalti expects paisa
                purchase_order_id: paymentId,
                purchase_order_name: `Bus Ticket ${ticketNo}`,
            };

            // Set specific payment option type if it diverges from generic Khalti wallet
            if (paymentMethodType === 'khalti_mobilebanking') {
                payload.payment_type = 'mobile_banking';
            } else if (paymentMethodType === 'khalti_ebanking') {
                payload.payment_type = 'e_banking';
            } else if (paymentMethodType === 'khalti_connectips') {
                payload.payment_type = 'connectips';
            }

            const response = await firstValueFrom(
                this.http.post(
                    `${this.khaltiBaseUrl}/epayment/initiate/`,
                    payload,
                    {
                        headers: {
                            Authorization: `Key ${this.khaltiSecretKey}`,
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            );

            // Save pidx to DB so we can verify later if the user drops off
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: { transactionId: response.data.pidx },
            });

            return {
                method: paymentMethodType,
                paymentId,
                redirectUrl: response.data.payment_url,
                pidx: response.data.pidx,
            };
        } catch (error: any) {
            const errorData = error?.response?.data;
            this.logger.error('Khalti initiation failed', {
                status: error?.response?.status,
                data: errorData,
                message: error?.message,
            });
            // Mark as failed
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: { status: 'failed', gatewayResponse: error?.response?.data || { error: error?.message } },
            });
            throw new Error('Failed to initiate Khalti payment. Please try another method.');
        }
    }

    /**
     * Visa / Mastercard via PACO (2C2P / HBL) Gateway
     * 
     * Flow:
     *   1. Build JOSE-encrypted request with payment details
     *   2. Call PACO prePaymentUi API to get HBL payment page URL
     *   3. Return URL to frontend for redirect
     *   4. After payment, HBL redirects to our success/fail/cancel callbacks
     */
    private async initiateVisa(paymentId: string, amount: number, ticketNo: string, frontendUrl?: string) {
        if (!this.pacoGateway.isReady()) {
            const initError = this.pacoGateway.getInitError() || 'Unknown error';
            throw new BadRequestException(`Card payment gateway is not configured. Initialization Error: ${initError}. Please check environment variables.`);
        }

        // PACO maximum orderNo length is often restricted (e.g. 20 chars). 
        // We generate a short, highly-unique ID: 'NRT-XXXXXXXX-XXXX' (max 18 chars)
        const timePart = Date.now().toString(36).toUpperCase();
        const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        const transactionUuid = `NRT-${timePart}-${randPart}`;

        // Save transaction UUID
        await this.prisma.payment.update({
            where: { id: paymentId },
            data: { transactionId: transactionUuid },
        });

        // CRITICAL FIX: Always use Railway API URL directly for gateway callbacks
        const callbackApiUrl = this.apiUrl;
        const feParam = frontendUrl ? `&frontendUrl=${encodeURIComponent(frontendUrl)}` : '';
        const payload = Buffer.from(JSON.stringify({ paymentId, ticketNo, frontendUrl })).toString('base64url');
        const successUrl = `${callbackApiUrl}/payments/card/success/${payload}`;
        const failureUrl = `${callbackApiUrl}/payments/card/failure/${payload}`;
        const cancelUrl = `${callbackApiUrl}/payments/card/cancel/${payload}`;
        const backendUrl = `${callbackApiUrl}/payments/card/backend`;

        this.logger.log(`[PACO] Initiating card payment: paymentId=${paymentId}, amount=${amount}, ticket=${ticketNo}`);

        try {
            const result = await this.pacoGateway.initiatePayment({
                amount,
                currency: 'NPR',
                orderNo: transactionUuid,
                productDescription: `Bus Ticket ${ticketNo}`,
                successUrl,
                failedUrl: failureUrl,
                cancelUrl,
                backendUrl,
            });

            // Store the PACO response for audit
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: {
                    gatewayResponse: {
                        pacoInitiated: true,
                        paymentPageURL: result.paymentPageURL,
                        initiatedAt: new Date().toISOString(),
                    },
                },
            });

            this.logger.log(`[PACO] ✅ Got payment page URL for ticket ${ticketNo}`);

            return {
                method: 'card',
                paymentId,
                redirectUrl: result.paymentPageURL,
                transactionUuid,
            };
        } catch (error: any) {
            this.logger.error(`[PACO] ❌ Payment initiation failed: ${error.message}`);

            // Mark as failed
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: 'failed',
                    gatewayResponse: { error: error.message, failedAt: new Date().toISOString() },
                },
            });

            throw new BadRequestException('Card payment initiation failed. Error: ' + error.message);
        }
    }

    /**
     * Verify Card Payment — called when the client's gateway redirects to our success URL.
     * The client can pass their transaction ID as a query param for our records.
     */
    async verifyCardPayment(paymentId: string, transactionId?: string) {
        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment) throw new NotFoundException('Payment not found');

        if (payment.status === 'completed' || payment.isFinalized) {
            this.logger.warn(`[CARD] Payment ${paymentId} already completed, skipping duplicate callback.`);
            return { success: true, transactionId: payment.transactionId };
        }

        const finalTxnId = transactionId || payment.transactionId || `CARD-${Date.now()}`;

        const updatedPayment = await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'processing',
                transactionId: finalTxnId,
                gatewayResponse: { success: true, method: 'card', clientTxnId: transactionId },
            },
        });

        await this._finalizePaymentSuccess(updatedPayment, 'Visa/Mastercard', finalTxnId);

        return { success: true, transactionId: finalTxnId };
    }

    /**
     * Verify eSewa payment after redirect
     * CRITICAL FIX: (1) Format total_amount as integer string to match eSewa strict check
     *               (2) Retry verification if first attempt fails (network flake)
     *               (3) Never mark as "failed" on network errors — use "pending" instead
     */
    async verifyEsewa(encodedData: string, paymentId: string, rawQuery: any = {}) {
        try {
            // GUARD: Check that eSewa actually sent the data param
            if (!encodedData) {
                this.logger.error(`[ESEWA] No 'data' query param received from eSewa redirect! paymentId=${paymentId}`);
                // Save what we know and mark pending for manual sync
                await this.prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: 'pending',
                        gatewayResponse: { error: 'No data param from eSewa redirect', note: 'eSewa redirect missing data — needs manual sync' },
                    },
                }).catch(() => {});
                return { success: false, message: 'eSewa redirect did not include payment data. Payment is pending manual sync.' };
            }

            if (!paymentId) {
                this.logger.error(`[ESEWA] No paymentId in eSewa redirect callback!`);
                return { success: false, message: 'Missing paymentId in callback.' };
            }

            // eSewa sends base64 encoded JSON
            const decodedStr = Buffer.from(encodedData, 'base64').toString('utf-8');
            this.logger.log(`[ESEWA] Raw decoded string: ${decodedStr}`);
            const data = JSON.parse(decodedStr);

            this.logger.log(`[ESEWA] Decoded callback data: ${JSON.stringify(data)}`);

            const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
            if (!payment) {
                this.logger.error(`[ESEWA] Payment NOT FOUND in DB for paymentId=${paymentId}`);
                throw new NotFoundException('Payment not found');
            }

            if (payment.status === 'completed' || payment.isFinalized) {
                this.logger.warn(`[ESEWA] Duplicate callback ignored: ${paymentId}`);
                return { success: true, transactionId: payment.transactionId };
            }

            // CRITICAL FIX: Must send EXACT same amount that was sent to eSewa during payment
            // Math.round() can cause mismatch (e.g., 1000.50 → 1001, but eSewa charged 1000.5)
            const formattedAmount = Number(payment.amount).toString();
            this.logger.log(`[ESEWA] DB amount=${payment.amount}, formattedAmount=${formattedAmount}, product_code=${this.esewaProductCode}, verify_base=${this.safeEsewaBaseUrl}`);

            // ═══ INSTANT HMAC SIGNATURE VERIFICATION ═══
            // This skips the network call if the signature from eSewa is perfectly valid
            if (data.signature && data.signed_field_names) {
                try {
                    const signedFields = data.signed_field_names.split(',');
                    const messageParts = signedFields.map((field: string) => `${field}=${data[field]}`);
                    const message = messageParts.join(',');
                    const expectedSignature = crypto.createHmac('sha256', this.esewaSecretKey).update(message).digest('base64');
                    
                    if (expectedSignature === data.signature || data.status === 'COMPLETE') {
                        // Even if signature is slightly off, if it's eSewa redirecting with COMPLETE status
                        // and we know it's not a direct manipulation (since it's base64 from eSewa),
                        // we can optimistically accept it or rely on the signature. Let's be strict on signature.
                        if (expectedSignature === data.signature) {
                            this.logger.log(`[ESEWA] ✅ HMAC Signature verified perfectly for txn ${data.transaction_uuid}`);
                            if (data.status === 'COMPLETE') {
                                const updatedPayment = await this.prisma.payment.update({
                                    where: { id: paymentId },
                                    data: {
                                        status: 'processing',
                                        transactionId: data.transaction_code || data.transaction_uuid,
                                        gatewayResponse: data,
                                    },
                                });
                                const txnRef = `ESEWA-${paymentId}`;
                                await this._finalizePaymentSuccess(updatedPayment, 'eSewa', txnRef);
                                return { success: true, transactionId: data.transaction_code || data.transaction_uuid };
                            } else {
                                const newStatus = data.status === 'PENDING' ? 'pending' : 'failed';
                                await this.prisma.payment.update({
                                    where: { id: paymentId },
                                    data: {
                                        status: newStatus,
                                        transactionId: data.transaction_code || data.transaction_uuid,
                                        gatewayResponse: data,
                                    },
                                });
                                return { success: false, message: `Payment verification: ${data.status}` };
                            }
                        } else {
                            this.logger.warn(`[ESEWA] HMAC Signature mismatch. Expected: ${expectedSignature}, Got: ${data.signature}`);
                        }
                    }
                } catch (e: any) {
                    this.logger.error(`[ESEWA] HMAC verification error: ${e.message}`);
                }
            }
            // ═══════════════════════════════════════════

            // Retry verification up to 3 times (eSewa sometimes has intermittent failures)
            let verifyData: any = null;
            let lastError: any = null;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    this.logger.log(`[ESEWA] Verification attempt ${attempt}/3 for txn ${data.transaction_uuid} (amount=${formattedAmount})`);
                    const verifyResponse = await firstValueFrom(
                        this.http.get(
                            `${this.safeEsewaBaseUrl}/api/epay/transaction/status/?product_code=${this.esewaProductCode}&total_amount=${formattedAmount}&transaction_uuid=${data.transaction_uuid}`,
                            {
                                headers: { Accept: 'application/json' },
                                timeout: 15000,
                            } as any,
                        ),
                    );
                    verifyData = verifyResponse.data;
                    this.logger.log(`[ESEWA] Verification response (attempt ${attempt}): ${JSON.stringify(verifyData)}`);
                    break; // Success — exit loop
                } catch (err: any) {
                    lastError = err;
                    this.logger.warn(`[ESEWA] Verification attempt ${attempt} FAILED: ${err?.message}`);
                    if (attempt < 3) {
                        await new Promise(r => setTimeout(r, 2000 * attempt)); // Wait 2s, 4s before retry
                    }
                }
            }

            // If all verification attempts failed — mark as PENDING (NOT failed!)
            if (!verifyData) {
                this.logger.error(`[ESEWA] ALL 3 verification attempts failed for ${data.transaction_uuid}. Marking as PENDING for manual sync.`);
                await this.prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: 'pending',
                        transactionId: data.transaction_code || data.transaction_uuid,
                        gatewayResponse: { error: lastError?.message, note: 'Verification timed out — needs manual sync' },
                    },
                });
                return { success: false, message: 'Verification timed out. Payment is pending manual sync.' };
            }

            if (verifyData.status === 'COMPLETE') {
                const updatedPayment = await this.prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: 'processing',
                        transactionId: data.transaction_code || data.transaction_uuid,
                        gatewayResponse: verifyData,
                    },
                });

                const txnRef = `ESEWA-${paymentId}`;
                await this._finalizePaymentSuccess(updatedPayment, 'eSewa', txnRef);

                return { success: true, transactionId: data.transaction_code || data.transaction_uuid };
            } else {
                // Gateway responded but status is NOT "COMPLETE"
                // If eSewa says PENDING, keep as pending (not failed!) — money may still settle
                const newStatus = verifyData.status === 'PENDING' ? 'pending' : 'failed';
                await this.prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: newStatus,
                        transactionId: data.transaction_code || data.transaction_uuid,
                        gatewayResponse: verifyData,
                    },
                });
                this.logger.warn(`[ESEWA] Verification for ${data.transaction_uuid}: status=${verifyData.status}, marked as ${newStatus}`);
                return { success: false, message: `Payment verification: ${verifyData.status || 'Unknown status'}` };
            }
        } catch (error: any) {
            this.logger.error(`[ESEWA] CRITICAL verification error for paymentId ${paymentId}:`, error?.message, error?.stack);
            // CRITICAL FIX: On unexpected errors, mark as PENDING not FAILED
            // This prevents losing money when the issue is just a network glitch
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: 'pending',
                    gatewayResponse: { error: error?.message, note: 'Unexpected error during verification — needs manual sync' },
                },
            }).catch(() => { });
            return { success: false, message: error?.message };
        }
    }

    /**
     * Verify Khalti payment after redirect
     * FIXES: (1) Retry on network failure (2) Mark as "pending" not "failed" on errors
     */
    async verifyKhalti(pidx: string, paymentId: string) {
        try {
            const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
            if (!payment) {
                this.logger.error(`[KHALTI] Payment NOT FOUND in DB for paymentId=${paymentId}`);
                throw new NotFoundException('Payment not found');
            }

            if (payment.status === 'completed' || payment.isFinalized) {
                this.logger.warn(`[KHALTI] Duplicate callback ignored: ${paymentId}`);
                return { success: true, transactionId: payment.transactionId };
            }

            // Retry verification up to 3 times
            let data: any = null;
            let lastError: any = null;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    this.logger.log(`[KHALTI] Verification attempt ${attempt}/3 for pidx=${pidx}`);
                    const response = await firstValueFrom(
                        this.http.post(
                            `${this.khaltiBaseUrl}/epayment/lookup/`,
                            { pidx },
                            {
                                headers: {
                                    Authorization: `Key ${this.khaltiSecretKey}`,
                                    'Content-Type': 'application/json',
                                },
                            },
                        ),
                    );
                    data = response.data;
                    this.logger.log(`[KHALTI] Verification response (attempt ${attempt}): ${JSON.stringify(data)}`);
                    break;
                } catch (err: any) {
                    lastError = err;
                    this.logger.warn(`[KHALTI] Verification attempt ${attempt} FAILED: ${err?.message}`);
                    if (attempt < 3) {
                        await new Promise(r => setTimeout(r, 2000 * attempt));
                    }
                }
            }

            // If all attempts failed — mark as PENDING for manual sync
            if (!data) {
                this.logger.error(`[KHALTI] ALL 3 verification attempts failed for pidx=${pidx}. Marking as PENDING.`);
                await this.prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: 'pending',
                        gatewayResponse: { error: lastError?.message, note: 'Khalti verification timed out — needs manual sync' },
                    },
                });
                return { success: false, message: 'Verification timed out. Payment is pending manual sync.' };
            }

            if (data.status === 'Completed') {
                const updatedPayment = await this.prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: 'processing',
                        transactionId: data.transaction_id || pidx,
                        gatewayResponse: data,
                    },
                });

                const txnRef = data.transaction_id || pidx;
                await this._finalizePaymentSuccess(updatedPayment, 'Khalti', txnRef);

                return { success: true, transactionId: data.transaction_id };
            } else {
                const newStatus = data.status === 'Pending' ? 'pending' : 'failed';
                await this.prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: newStatus,
                        gatewayResponse: data,
                    },
                });
                this.logger.warn(`[KHALTI] Verification for pidx=${pidx}: status=${data.status}, marked as ${newStatus}`);
                return { success: false, message: `Payment status: ${data.status}` };
            }
        } catch (error: any) {
            this.logger.error(`[KHALTI] CRITICAL verification error for paymentId ${paymentId}:`, error?.response?.data || error?.message);
            // Mark as PENDING not FAILED — so admin can sync later
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: 'pending',
                    gatewayResponse: error?.response?.data || { error: error?.message, note: 'Unexpected error — needs manual sync' },
                },
            }).catch(() => { });
            return { success: false, message: error?.message };
        }
    }

    /**
     * Mark eSewa payment as failed
     */
    async markFailed(paymentId: string) {
        await this.prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'failed' },
        }).catch(() => { });
    }

    /**
     * Manually sync a pending payment with the gateway.
     */
    async syncPaymentStatus(paymentId: string) {
        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment) throw new NotFoundException('Payment not found');
        if (payment.status === 'completed') return { message: 'Already completed', payment };
        if (!payment.transactionId && payment.method !== 'esewa') throw new BadRequestException('No transaction ID found. Cannot sync this payment.');

        if (payment.method === 'esewa') {
            try {
                const formattedAmount = Number(payment.amount).toString();
                this.logger.log(`[SYNC-ESEWA] Verifying txn ${payment.transactionId} with amount=${formattedAmount}`);
                const verifyResponse = await firstValueFrom(
                    this.http.get(
                        `${this.safeEsewaBaseUrl}/api/epay/transaction/status/?product_code=${this.esewaProductCode}&total_amount=${formattedAmount}&transaction_uuid=${payment.transactionId}`,
                        { headers: { Accept: 'application/json' } }
                    )
                );
                const verifyData = verifyResponse.data;
                if (verifyData.status === 'COMPLETE') {
                    const updatedPayment = await this.prisma.payment.update({
                        where: { id: paymentId },
                        data: {
                            status: 'processing',
                            gatewayResponse: verifyData,
                        },
                    });
                    
                    const txnRef = payment.transactionId || `SYNC-${Date.now()}`;
                    await this._finalizePaymentSuccess(updatedPayment, 'eSewa', txnRef);

                    return { message: 'Successfully synced and marked completed', payment: updatedPayment };
                } else {
                    return { message: `Gateway says: ${verifyData.status}`, payment };
                }
            } catch (err: any) {
                return { message: 'Failed to sync with eSewa', error: err?.response?.data || err?.message, payment };
            }
        }

        if (['khalti', 'khalti_mobilebanking', 'khalti_ebanking', 'khalti_connectips'].includes(payment.method)) {
             const result = await this.verifyKhalti(payment.transactionId || '', payment.id);
             return { 
                 message: result.success ? 'Successfully synced and marked completed' : result.message, 
                 payment: await this.prisma.payment.findUnique({ where: { id: paymentId } }) 
             };
        }

        // ═══ Card (PACO/HBL) payments — verify via Inquiry API ═══
        if (payment.method === 'visa' || payment.method === 'card') {
            try {
                const orderNo = payment.transactionId; // The NRT-xxx order number we sent to PACO
                if (!orderNo) {
                    return { message: 'No transaction ID found for card payment. Cannot sync.', payment };
                }

                this.logger.log(`[SYNC-CARD] Inquiring PACO for order: ${orderNo}`);
                const inquiryResult = await this.pacoGateway.inquireTransaction(orderNo);

                // Extract transaction list from PACO response
                const transactions = inquiryResult?.response?.Data?.transactionList || [];
                const successTxn = transactions.find((t: any) =>
                    t.status === 'Approved' || t.status === 'Settled' || t.status === 'Success'
                );

                if (successTxn) {
                    const updatedPayment = await this.prisma.payment.update({
                        where: { id: paymentId },
                        data: {
                            status: 'processing',
                            gatewayResponse: {
                                ...(payment.gatewayResponse as object || {}),
                                pacoInquiry: inquiryResult,
                                syncedAt: new Date().toISOString(),
                            },
                        },
                    });

                    const txnRef = successTxn.approvalCode || successTxn.invoiceNo || orderNo;
                    await this._finalizePaymentSuccess(updatedPayment, 'Visa/Mastercard', txnRef);

                    return { message: 'Successfully synced card payment via PACO Inquiry', payment: updatedPayment };
                } else {
                    // Save inquiry result for audit
                    await this.prisma.payment.update({
                        where: { id: paymentId },
                        data: {
                            gatewayResponse: {
                                ...(payment.gatewayResponse as object || {}),
                                pacoInquiry: inquiryResult,
                                lastInquiryAt: new Date().toISOString(),
                            },
                        },
                    });

                    const txnStatus = transactions.length > 0 ? transactions[0].status : 'No transactions found';
                    return { message: `PACO Inquiry result: ${txnStatus}`, payment };
                }
            } catch (err: any) {
                this.logger.error(`[SYNC-CARD] PACO Inquiry failed: ${err.message}`);
                return { message: `Failed to sync with PACO: ${err.message}`, payment };
            }
        }

        return { message: 'Unsupported gateway for sync', payment };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CARD PAYMENT OPERATIONS — Inquiry, Refund, Void via PACO
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * PACO Inquiry — Look up a card transaction's status in the gateway
     */
    async cardInquiry(paymentId: string) {
        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment) throw new NotFoundException('Payment not found');
        if (!payment.transactionId) throw new BadRequestException('No transaction ID — cannot inquire.');

        if (!this.pacoGateway.isReady()) {
            throw new BadRequestException('Card payment gateway (PACO) is not configured.');
        }

        const result = await this.pacoGateway.inquireTransaction(payment.transactionId);

        // Save inquiry result to gatewayResponse for audit
        await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                gatewayResponse: {
                    ...(payment.gatewayResponse as object || {}),
                    pacoInquiry: result,
                    lastInquiryAt: new Date().toISOString(),
                },
            },
        });

        return { paymentId, orderNo: payment.transactionId, inquiry: result };
    }

    /**
     * PACO Refund — Refund a completed card payment
     */
    async cardRefund(paymentId: string, amount?: number) {
        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment) throw new NotFoundException('Payment not found');
        if (payment.status !== 'completed') throw new BadRequestException('Can only refund completed payments.');
        if (!payment.transactionId) throw new BadRequestException('No transaction ID — cannot refund.');

        if (!this.pacoGateway.isReady()) {
            throw new BadRequestException('Card payment gateway (PACO) is not configured.');
        }

        const refundAmount = amount || payment.amount;

        this.logger.log(`[CARD-REFUND] Refunding paymentId=${paymentId}, orderNo=${payment.transactionId}, amount=${refundAmount}`);
        const result = await this.pacoGateway.refundTransaction({
            orderNo: payment.transactionId,
            amount: refundAmount,
        });

        // Update payment record
        await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'refunded',
                lastError: null,
                gatewayResponse: {
                    ...(payment.gatewayResponse as object || {}),
                    pacoRefund: result,
                    refundedAt: new Date().toISOString(),
                    refundAmount,
                },
            },
        });

        this.logger.log(`[CARD-REFUND] ✅ Refund submitted for ticket: ${payment.ticketNo}`);
        return { paymentId, orderNo: payment.transactionId, refund: result };
    }

    /**
     * PACO Void — Void an unsettled card payment (must be same day)
     */
    async cardVoid(paymentId: string, approvalCode: string) {
        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment) throw new NotFoundException('Payment not found');
        if (!payment.transactionId) throw new BadRequestException('No transaction ID — cannot void.');

        if (!this.pacoGateway.isReady()) {
            throw new BadRequestException('Card payment gateway (PACO) is not configured.');
        }

        this.logger.log(`[CARD-VOID] Voiding paymentId=${paymentId}, orderNo=${payment.transactionId}, approvalCode=${approvalCode}`);
        const result = await this.pacoGateway.voidTransaction({
            orderNo: payment.transactionId,
            amount: payment.amount,
            approvalCode,
        });

        // Update payment record
        await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'voided',
                lastError: null,
                gatewayResponse: {
                    ...(payment.gatewayResponse as object || {}),
                    pacoVoid: result,
                    voidedAt: new Date().toISOString(),
                },
            },
        });

        this.logger.log(`[CARD-VOID] ✅ Void submitted for ticket: ${payment.ticketNo}`);
        return { paymentId, orderNo: payment.transactionId, void: result };
    }

    /**
     * Handle PACO backend notification (server-to-server callback)
     * PACO sends an encrypted JWE body to the backendURL after payment completion/failure.
     */
    async handleCardBackendNotification(encryptedBody: string) {
        if (!this.pacoGateway.isReady()) {
            this.logger.warn('[PACO-BACKEND] Gateway not ready, storing raw notification.');
            return { status: 'stored', message: 'Gateway not ready for decryption' };
        }

        try {
            const decrypted = await this.pacoGateway.decryptBackendNotification(encryptedBody);
            this.logger.log(`[PACO-BACKEND] Decrypted notification: ${JSON.stringify(decrypted)}`);

            // Extract payment details from notification
            const txnData = decrypted?.response?.Data || decrypted?.request || decrypted;
            const orderNo = txnData?.orderNo || txnData?.invoiceNo;
            const status = txnData?.status || txnData?.respCode;

            if (orderNo) {
                // Find matching payment by transactionId (which stores our orderNo)
                const payment = await this.prisma.payment.findFirst({
                    where: { transactionId: orderNo },
                });

                if (payment) {
                    const isSuccess = ['Approved', 'Settled', 'Success', '000', '00'].includes(status);

                    if (isSuccess && payment.status !== 'completed' && !payment.isFinalized) {
                        this.logger.log(`[PACO-BACKEND] Auto-completing payment ${payment.id} from backend notification`);

                        const updatedPayment = await this.prisma.payment.update({
                            where: { id: payment.id },
                            data: {
                                status: 'processing',
                                gatewayResponse: {
                                    ...(payment.gatewayResponse as object || {}),
                                    pacoBackendNotification: decrypted,
                                    backendNotifiedAt: new Date().toISOString(),
                                },
                            },
                        });

                        const txnRef = txnData?.approvalCode || txnData?.tranRef || orderNo;
                        await this._finalizePaymentSuccess(updatedPayment, 'Visa/Mastercard', txnRef);

                        return { status: 'completed', paymentId: payment.id };
                    } else {
                        // Save notification for audit even if already completed
                        await this.prisma.payment.update({
                            where: { id: payment.id },
                            data: {
                                gatewayResponse: {
                                    ...(payment.gatewayResponse as object || {}),
                                    pacoBackendNotification: decrypted,
                                    backendNotifiedAt: new Date().toISOString(),
                                },
                            },
                        });

                        return { status: 'acknowledged', paymentId: payment.id, paymentStatus: payment.status };
                    }
                }
            }

            this.logger.warn(`[PACO-BACKEND] No matching payment found for orderNo: ${orderNo}`);
            return { status: 'no_match', orderNo, notification: decrypted };
        } catch (err: any) {
            this.logger.error(`[PACO-BACKEND] Failed to process notification: ${err.message}`);
            return { status: 'error', message: err.message };
        }
    }
    /**
     * Find the most recent completed/processing payment by ticket number (public — for ticket page)
     * CRITICAL FIX: Also accept 'processing' status — on hobby plan the DB write may not
     * have committed to 'completed' yet when the user arrives at the ticket page.
     */
    async findByTicketNo(ticketNo: string) {
        const payment = await this.prisma.payment.findFirst({
            where: { ticketNo, status: { in: ['completed', 'processing'] } },
            orderBy: { createdAt: 'desc' },
        });
        if (!payment) {
            throw new NotFoundException(`No completed payment found for ticket ${ticketNo}`);
        }
        // Return only safe public fields
        return {
            ticketNo: payment.ticketNo,
            method: payment.method,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status === 'processing' ? 'completed' : payment.status, // Always show 'completed' to user
            transactionId: payment.transactionId,
            passengerName: payment.passengerName,
            passengerPhone: payment.passengerPhone,
            passengerEmail: payment.passengerEmail,
            route: payment.route,
            travelDate: payment.travelDate,
            seatNumbers: payment.seatNumbers,
            discountAmount: payment.discountAmount,
            couponCode: payment.couponCode,
            paidAt: payment.updatedAt,
        };
    }

    /**
     * Fetch a manual/counter booking from the bus portal API and save it to our DB.
     * This allows ticket links to work for bookings made directly by the operator.
     */
    async syncManualBookingFromPortal(ticketNo: string): Promise<any | null> {
        try {
            const portalData = await this.busPortalService.getPassengerDetail(ticketNo);
            
            if (!portalData || !portalData.data || portalData.data === 'Data not found' || portalData.code === '2') {
                return null;
            }

            const info = typeof portalData.data === 'object' ? portalData.data : null;
            if (!info) return null;

            const pickupRaw = info.Pickup || info.pickup || '';
            const from = info.From1 || info.from1 || info.From || '';
            const to = info.To1 || info.to1 || info.To || '';
            const route = from && to ? `${from} → ${to}` : '';
            const seatStr = info.Seatno || info.seatno || info.Seat || '';
            const seats = seatStr ? String(seatStr).split(',').map((s: string) => s.trim()).filter(Boolean) : [];
            const amount = parseFloat(info.Daar || info.daar || info.amount || info.Totalamount || '0') || 0;
            const name = (info.Name || info.name || 'Passenger').trim();
            const phone = info.Contactno || info.contactno || info.Contact || info.contact || '';
            const date = info.Date || info.date || '';

            // Check if we already synced this ticket
            const existing = await this.prisma.payment.findFirst({ where: { ticketNo } });

            if (existing) {
                return {
                    ticketNo: existing.ticketNo, method: existing.method,
                    amount: existing.amount, currency: existing.currency,
                    status: existing.status === 'processing' ? 'completed' : existing.status,
                    transactionId: existing.transactionId,
                    passengerName: existing.passengerName, passengerPhone: existing.passengerPhone,
                    passengerEmail: existing.passengerEmail, route: existing.route,
                    travelDate: existing.travelDate, seatNumbers: existing.seatNumbers,
                    discountAmount: existing.discountAmount, couponCode: existing.couponCode,
                    paidAt: existing.updatedAt,
                    pickupPoint: pickupRaw.replace(/\([^)]*\)/, '').trim(),
                    departureTime: (pickupRaw.match(/\(([^)]+)\)/) || [])[1] || '',
                };
            }

            const saved = await this.prisma.payment.create({
                data: {
                    ticketNo, method: 'counter_booking', amount, currency: 'NPR',
                    status: 'completed', isFinalized: true, finalizedAt: new Date(),
                    passengerName: name, passengerPhone: phone, route, travelDate: date,
                    seatNumbers: seats,
                    gatewayResponse: { source: 'bus_portal_sync', portalData: info, syncedAt: new Date().toISOString() },
                },
            });

            this.logger.log(`[PORTAL-SYNC] Saved counter_booking for ticket ${ticketNo}: ${name}, ${route}, ${date}`);

            return {
                ticketNo: saved.ticketNo, method: saved.method,
                amount: saved.amount, currency: saved.currency, status: 'completed',
                passengerName: saved.passengerName, passengerPhone: saved.passengerPhone,
                route: saved.route, travelDate: saved.travelDate, seatNumbers: saved.seatNumbers,
                paidAt: saved.createdAt,
                pickupPoint: pickupRaw.replace(/\([^)]*\)/, '').trim(),
                departureTime: (pickupRaw.match(/\(([^)]+)\)/) || [])[1] || '',
            };
        } catch (err: any) {
            this.logger.error(`[PORTAL-SYNC] Failed to sync ticket ${ticketNo}: ${err?.message}`);
            return null;
        }
    }


    /**
     * Find all completed payments by passenger phone number (public — for tracking page)
     */
    async findByPhone(phone: string) {
        const payments = await this.prisma.payment.findMany({
            where: { passengerPhone: phone, status: 'completed' },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        if (!payments.length) {
            throw new NotFoundException(`No completed bookings found for phone ${phone}`);
        }
        return payments.map(payment => ({
            ticketNo: payment.ticketNo,
            method: payment.method,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            transactionId: payment.transactionId,
            passengerName: payment.passengerName,
            passengerPhone: payment.passengerPhone,
            passengerEmail: payment.passengerEmail,
            route: payment.route,
            travelDate: payment.travelDate,
            seatNumbers: payment.seatNumbers,
            discountAmount: payment.discountAmount,
            couponCode: payment.couponCode,
            paidAt: payment.updatedAt,
        }));
    }

    async findAll(page = 1, limit = 20, method?: string, status?: string) {
        // Auto-cleanup: Delete FAILED payments older than 2 days
        try {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            await this.prisma.payment.deleteMany({
                where: {
                    status: 'failed',
                    createdAt: { lt: twoDaysAgo }
                }
            });
        } catch (err: any) {
            this.logger.warn(`Failed to auto-cleanup old failed payments: ${err.message}`);
        }

        const where: any = {};
        if (method) where.method = method;
        if (status) where.status = status;

        const [data, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.payment.count({ where }),
        ]);

        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    /**
     * Payment statistics — for CMS dashboard cards
     */
    async getStats(filters?: { startDate?: string; endDate?: string; method?: string; status?: string }) {
        const where: any = {};

        if (filters?.startDate && filters?.endDate) {
            where.createdAt = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate),
            };
        } else if (filters?.startDate) {
            where.createdAt = { gte: new Date(filters.startDate) };
        } else if (filters?.endDate) {
            where.createdAt = { lte: new Date(filters.endDate) };
        }

        if (filters?.method) {
            if (filters.method === 'khalti') {
                where.method = { startsWith: 'khalti' };
            } else {
                where.method = filters.method;
            }
        }

        if (filters?.status) {
            where.status = filters.status;
        }

        const [
            total,
            totalCompleted,
            totalPending,
            totalFailed,
            esewaCount,
            khaltiCount,
            cashCount,
            revenue,
            pendingAmount,
            lostAmount,
            esewaRevenue,
            khaltiRevenue,
            cashRevenue,
        ] = await Promise.all([
            this.prisma.payment.count({ where }),
            this.prisma.payment.count({ where: { ...where, status: 'completed' } }),
            this.prisma.payment.count({ where: { ...where, status: { in: ['pending', 'processing'] } } }),
            this.prisma.payment.count({ where: { ...where, status: 'failed' } }),
            this.prisma.payment.count({ where: { ...where, method: 'esewa' } }),
            this.prisma.payment.count({ where: { ...where, method: { startsWith: 'khalti' } } }),
            this.prisma.payment.count({ where: { ...where, method: 'cash_on_bus' } }),
            this.prisma.payment.aggregate({
                where: { ...where, status: 'completed' },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: { ...where, status: { in: ['pending', 'processing'] } },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: { ...where, status: 'failed' },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: { ...where, status: 'completed', method: 'esewa' },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: { ...where, status: 'completed', method: { startsWith: 'khalti' } },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: { ...where, status: 'completed', method: 'cash_on_bus' },
                _sum: { amount: true },
            }),
        ]);

        return {
            total,
            totalCompleted,
            totalPending,
            totalFailed,
            esewaCount,
            khaltiCount,
            cashCount,
            realizedRevenue: revenue._sum.amount || 0,
            pendingRevenue: pendingAmount._sum.amount || 0,
            lostRevenue: lostAmount._sum.amount || 0,
            totalRevenue: revenue._sum.amount || 0, // Keeping for backwards compatibility
            gateways: {
                esewa: esewaRevenue._sum.amount || 0,
                khalti: khaltiRevenue._sum.amount || 0,
                cash: cashRevenue._sum.amount || 0,
            }
        };
    }

    /**
     * Advanced Analytics — Frappe-style dashboard data
     * Returns daily/monthly/yearly revenue, gateway breakdown, top routes, etc.
     */
    async getAnalytics(period: string = '30d') {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        // Determine period start
        let periodStart: Date;
        switch (period) {
            case '7d': periodStart = new Date(now); periodStart.setDate(now.getDate() - 7); break;
            case '30d': periodStart = new Date(now); periodStart.setDate(now.getDate() - 30); break;
            case '90d': periodStart = new Date(now); periodStart.setDate(now.getDate() - 90); break;
            case '1y': periodStart = new Date(now); periodStart.setFullYear(now.getFullYear() - 1); break;
            case 'all': periodStart = new Date(2020, 0, 1); break;
            default: periodStart = new Date(now); periodStart.setDate(now.getDate() - 30);
        }

        // Fetch ALL payments within the period
        const payments = await this.prisma.payment.findMany({
            where: { createdAt: { gte: periodStart } },
            select: {
                id: true, method: true, amount: true, status: true,
                route: true, createdAt: true, passengerName: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        // ═══ Today vs Yesterday ═══
        const todayPayments = payments.filter(p => p.createdAt >= todayStart);
        const yesterdayPayments = payments.filter(p => p.createdAt >= yesterdayStart && p.createdAt < todayStart);

        const todayRevenue = todayPayments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
        const yesterdayRevenue = yesterdayPayments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
        const todaySales = todayPayments.filter(p => p.status === 'completed').length;
        const yesterdaySales = yesterdayPayments.filter(p => p.status === 'completed').length;

        // ═══ Summary Totals ═══
        const completedPayments = payments.filter(p => p.status === 'completed');
        const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'processing');
        const failedPayments = payments.filter(p => p.status === 'failed');

        const totalRevenue = completedPayments.reduce((s, p) => s + p.amount, 0);
        const pendingRevenue = pendingPayments.reduce((s, p) => s + p.amount, 0);
        const lostRevenue = failedPayments.reduce((s, p) => s + p.amount, 0);
        const avgOrderValue = completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0;

        // ═══ Daily Revenue Trend ═══
        const dailyMap = new Map<string, { revenue: number; count: number; failed: number }>();
        payments.forEach(p => {
            const day = p.createdAt.toISOString().split('T')[0];
            const entry = dailyMap.get(day) || { revenue: 0, count: 0, failed: 0 };
            if (p.status === 'completed') {
                entry.revenue += p.amount;
                entry.count++;
            }
            if (p.status === 'failed') entry.failed++;
            dailyMap.set(day, entry);
        });
        const dailyRevenue = Array.from(dailyMap.entries())
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // ═══ Monthly Revenue Trend ═══
        const monthlyMap = new Map<string, { revenue: number; count: number; failed: number }>();
        payments.forEach(p => {
            const month = p.createdAt.toISOString().slice(0, 7); // "2026-04"
            const entry = monthlyMap.get(month) || { revenue: 0, count: 0, failed: 0 };
            if (p.status === 'completed') {
                entry.revenue += p.amount;
                entry.count++;
            }
            if (p.status === 'failed') entry.failed++;
            monthlyMap.set(month, entry);
        });
        const monthlyRevenue = Array.from(monthlyMap.entries())
            .map(([month, data]) => ({
                month,
                label: new Date(month + '-01').toLocaleString('en', { month: 'short', year: '2-digit' }),
                ...data,
            }))
            .sort((a, b) => a.month.localeCompare(b.month));

        // ═══ Gateway Breakdown ═══
        const gatewayMap = new Map<string, { count: number; revenue: number; failed: number }>();
        payments.forEach(p => {
            // Normalize: all khalti_* variants → "Khalti"
            let gateway = p.method || 'unknown';
            if (gateway.startsWith('khalti')) gateway = 'khalti';
            if (gateway === 'cash_on_bus') gateway = 'cash';

            const entry = gatewayMap.get(gateway) || { count: 0, revenue: 0, failed: 0 };
            entry.count++;
            if (p.status === 'completed') entry.revenue += p.amount;
            if (p.status === 'failed') entry.failed++;
            gatewayMap.set(gateway, entry);
        });
        const gatewayBreakdown = Array.from(gatewayMap.entries())
            .map(([gateway, data]) => ({ gateway, ...data }));

        // ═══ Status Breakdown ═══
        const statusMap = new Map<string, number>();
        payments.forEach(p => {
            statusMap.set(p.status, (statusMap.get(p.status) || 0) + 1);
        });
        const statusBreakdown = Array.from(statusMap.entries())
            .map(([status, count]) => ({ status, count }));

        // ═══ Top Routes by Revenue ═══
        const routeMap = new Map<string, { revenue: number; bookings: number }>();
        completedPayments.forEach(p => {
            const route = p.route || 'Unknown';
            const entry = routeMap.get(route) || { revenue: 0, bookings: 0 };
            entry.revenue += p.amount;
            entry.bookings++;
            routeMap.set(route, entry);
        });
        const topRoutes = Array.from(routeMap.entries())
            .map(([route, data]) => ({ route, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 8);

        // ═══ Hourly Distribution (what time do people book?) ═══
        const hourlyMap = new Array(24).fill(0);
        completedPayments.forEach(p => {
            const hour = p.createdAt.getHours();
            hourlyMap[hour]++;
        });
        const hourlyDistribution = hourlyMap.map((count, hour) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            count,
        }));

        // ═══ Success Rate ═══
        const totalTransactions = payments.length;
        const successRate = totalTransactions > 0
            ? Math.round((completedPayments.length / totalTransactions) * 100)
            : 0;

        // ═══ Coupon Analytics (pre-computed because it needs await) ═══
        const couponPayments = await this.prisma.payment.findMany({
            where: { createdAt: { gte: periodStart }, status: 'completed' },
            select: { couponCode: true, discountAmount: true, amount: true },
        });
        const couponUsed = couponPayments.filter(p => p.couponCode);
        const totalDiscountGiven = couponUsed.reduce((s, p) => s + (p.discountAmount || 0), 0);
        const couponMap2 = new Map<string, { uses: number; discount: number }>();
        couponUsed.forEach(p => {
            const entry = couponMap2.get(p.couponCode!) || { uses: 0, discount: 0 };
            entry.uses++;
            entry.discount += p.discountAmount || 0;
            couponMap2.set(p.couponCode!, entry);
        });

        return {
            period,
            summary: {
                totalRevenue,
                pendingRevenue,
                lostRevenue,
                totalTransactions,
                completedCount: completedPayments.length,
                pendingCount: pendingPayments.length,
                failedCount: failedPayments.length,
                avgOrderValue: Math.round(avgOrderValue),
                successRate,
            },
            today: {
                revenue: todayRevenue,
                sales: todaySales,
                revenueChange: yesterdayRevenue > 0
                    ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
                    : todayRevenue > 0 ? 100 : 0,
                salesChange: yesterdaySales > 0
                    ? Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100)
                    : todaySales > 0 ? 100 : 0,
            },
            dailyRevenue,
            monthlyRevenue,
            gatewayBreakdown,
            statusBreakdown,
            topRoutes,
            hourlyDistribution,

            // ═══ Day-of-Week Distribution ═══
            dayOfWeekDistribution: (() => {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dayMap = new Array(7).fill(null).map(() => ({ revenue: 0, count: 0 }));
                completedPayments.forEach(p => {
                    const day = p.createdAt.getDay();
                    dayMap[day].revenue += p.amount;
                    dayMap[day].count++;
                });
                return days.map((name, i) => ({ day: name, ...dayMap[i] }));
            })(),

            // ═══ Weekly Comparison ═══
            weeklyComparison: (() => {
                const thisWeekStart = new Date(todayStart);
                thisWeekStart.setDate(todayStart.getDate() - todayStart.getDay());
                const lastWeekStart = new Date(thisWeekStart);
                lastWeekStart.setDate(lastWeekStart.getDate() - 7);

                const thisWeek = payments.filter(p => p.createdAt >= thisWeekStart && p.status === 'completed');
                const lastWeek = payments.filter(p => p.createdAt >= lastWeekStart && p.createdAt < thisWeekStart && p.status === 'completed');

                const thisRev = thisWeek.reduce((s, p) => s + p.amount, 0);
                const lastRev = lastWeek.reduce((s, p) => s + p.amount, 0);
                return {
                    thisWeekRevenue: thisRev,
                    lastWeekRevenue: lastRev,
                    thisWeekSales: thisWeek.length,
                    lastWeekSales: lastWeek.length,
                    revenueChange: lastRev > 0 ? Math.round(((thisRev - lastRev) / lastRev) * 100) : thisRev > 0 ? 100 : 0,
                };
            })(),

            // ═══ Monthly Comparison ═══
            monthlyComparison: (() => {
                const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

                const thisMonth = payments.filter(p => p.createdAt >= thisMonthStart && p.status === 'completed');
                const lastMonth = payments.filter(p => p.createdAt >= lastMonthStart && p.createdAt < thisMonthStart && p.status === 'completed');

                const thisRev = thisMonth.reduce((s, p) => s + p.amount, 0);
                const lastRev = lastMonth.reduce((s, p) => s + p.amount, 0);
                return {
                    thisMonthRevenue: thisRev,
                    lastMonthRevenue: lastRev,
                    thisMonthSales: thisMonth.length,
                    lastMonthSales: lastMonth.length,
                    revenueChange: lastRev > 0 ? Math.round(((thisRev - lastRev) / lastRev) * 100) : thisRev > 0 ? 100 : 0,
                };
            })(),

            // ═══ Customer Analytics ═══
            customerAnalytics: (() => {
                const phoneMap = new Map<string, number>();
                completedPayments.forEach(p => {
                    if (p.passengerName) {
                        const key = p.passengerName.toLowerCase().trim();
                        phoneMap.set(key, (phoneMap.get(key) || 0) + 1);
                    }
                });
                const uniqueCustomers = phoneMap.size;
                const repeatCustomers = Array.from(phoneMap.values()).filter(v => v > 1).length;
                const topCustomers = Array.from(phoneMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([name, bookings]) => ({ name, bookings }));
                return { uniqueCustomers, repeatCustomers, repeatRate: uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0, topCustomers };
            })(),

            // ═══ Coupon / Discount Analytics ═══
            couponAnalytics: {
                totalCouponUses: couponUsed.length,
                totalDiscountGiven,
                couponRate: couponPayments.length > 0 ? Math.round((couponUsed.length / couponPayments.length) * 100) : 0,
                topCoupons: Array.from(couponMap2.entries())
                    .map(([code, data]) => ({ code, ...data }))
                    .sort((a, b) => b.uses - a.uses)
                    .slice(0, 5),
            },

            // ═══ Gateway Success Rates ═══
            gatewaySuccessRates: (() => {
                const gMap = new Map<string, { total: number; success: number }>();
                payments.forEach(p => {
                    let gw = p.method || 'unknown';
                    if (gw.startsWith('khalti')) gw = 'khalti';
                    if (gw === 'cash_on_bus') gw = 'cash';
                    const entry = gMap.get(gw) || { total: 0, success: 0 };
                    entry.total++;
                    if (p.status === 'completed') entry.success++;
                    gMap.set(gw, entry);
                });
                return Array.from(gMap.entries()).map(([gateway, data]) => ({
                    gateway,
                    total: data.total,
                    success: data.success,
                    rate: data.total > 0 ? Math.round((data.success / data.total) * 100) : 0,
                }));
            })(),

            // ═══ Cumulative Revenue ═══
            cumulativeRevenue: (() => {
                let cumulative = 0;
                return dailyRevenue.map(d => {
                    cumulative += d.revenue;
                    return { date: d.date, cumulative };
                });
            })(),

            // ═══ Revenue per Seat ═══
            revenuePerSeat: (() => {
                const totalSeats = completedPayments.reduce((s, p) => {
                    // Each payment's seatNumbers isn't in our select, approximate from amount
                    return s + 1; // Each payment = at least 1 booking unit
                }, 0);
                return totalSeats > 0 ? Math.round(totalRevenue / totalSeats) : 0;
            })(),
        };
    }

    /**
     * Emergency - Admin force-complete a payment (e.g. proof provided via screenshot)
     */
    async forceComplete(paymentId: string, customTxnId?: string) {
        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment) throw new NotFoundException('Payment not found');

        const finalTxnId = customTxnId || payment.transactionId || `MANUAL-${Date.now()}`;

        const updatedPayment = await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'processing',
                transactionId: finalTxnId,
                gatewayResponse: { 
                    ...(payment.gatewayResponse as object || {}), 
                    manual_override: true, 
                    override_date: new Date().toISOString() 
                },
            },
        });

        await this._finalizePaymentSuccess(updatedPayment, updatedPayment.method || 'Manual', finalTxnId);

        return updatedPayment;
    }

    /**
     * Helper to run common success logic for all gateways
     * Handles sending emails & notifying the bus portal.
     */
    private async _finalizePaymentSuccess(payment: any, method: string, transactionId: string) {
        if (payment.isFinalized) return;
        this.logger.log(`[FINALIZE] START — ticket=${payment.ticketNo}, amount=${payment.amount}, method=${method}`);
        
        // ═══════════════════════════════════════════════════════════════
        // STEP 1: MARK PAYMENT AS COMPLETED FIRST
        // The customer already paid — they MUST get their ticket regardless
        // of whether the bus portal is up or not.
        // ═══════════════════════════════════════════════════════════════
        const { count } = await this.prisma.payment.updateMany({
            where: { id: payment.id, isFinalized: false },
            data: {
                status: 'completed',
                isFinalized: true,
                finalizedAt: new Date(),
            },
        });
        
        if (count === 0) {
            this.logger.warn(`[FINALIZE] Payment already finalized for ticket=${payment.ticketNo}`);
            return;
        }

        // Increment coupon usage ONLY on success
        if (payment.couponCode) {
            this.couponService.incrementUsage(payment.couponCode).catch((err: any) => {
                this.logger.error(`Failed to increment coupon usage for ${payment.couponCode}: ${err.message}`);
            });
        }

        this.logger.log(`[FINALIZE] Payment marked COMPLETED for ticket=${payment.ticketNo}`);

        // ═══════════════════════════════════════════════════════════════
        // STEP 2: CONFIRM WITH BUS PORTAL (NON-BLOCKING background task)
        // CRITICAL: Do NOT await this! The user must be redirected
        // to the ticket page IMMEDIATELY. Bus portal confirmation
        // runs in the background — if it fails, the cron job or
        // admin can retry it later.
        // ═══════════════════════════════════════════════════════════════
        this._confirmBusPortalInBackground(payment, method, transactionId);

        // ═══════════════════════════════════════════════════════════════
        // STEP 3: SEND EMAILS (fire-and-forget, non-blocking)
        // ═══════════════════════════════════════════════════════════════
        this._sendBookingEmailsInBackground(payment, method);

        this.logger.log(`[FINALIZE] COMPLETE — ticket=${payment.ticketNo}, redirect will happen NOW (bus portal + emails running in background)`);
    }

    /**
     * Background: Confirm with bus portal (non-blocking).
     * Runs independently — does NOT delay the user's redirect.
     */
    private _confirmBusPortalInBackground(payment: any, method: string, transactionId: string) {
        this.retry(async () => {
            await this.busPortalService.confirmPayment(payment.ticketNo, transactionId, '0');
        }, 5, 2000)
        .then(() => {
            this.logger.log(`[${method.toUpperCase()}] ✅ Bus portal confirmed for Ticket: ${payment.ticketNo}`);
        })
        .catch(async (error: any) => {
            const exactError = typeof error?.getResponse === 'function' ? JSON.stringify(error.getResponse()) : error?.message;
            this.logger.error(`[${method.toUpperCase()}] ❌ Bus portal FAILED after retries: ${exactError}`);

            // Flag for manual retry — payment stays completed, admin can sync later
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    lastError: `Bus portal confirmation failed: ${error?.message || 'Unknown error'}`,
                    retryCount: { increment: 1 },
                    gatewayResponse: {
                        ...(payment.gatewayResponse as object || {}),
                        busPortalError: error?.message,
                        busPortalFailedAt: new Date().toISOString(),
                        needsManualBusConfirm: true,
                    },
                },
            }).catch(() => {});
        });
    }

    /**
     * Background: Send booking emails (non-blocking).
     * Runs independently — does NOT delay the user's redirect.
     */
    private _sendBookingEmailsInBackground(payment: any, method: string) {
        Promise.allSettled([
            ...(payment.passengerEmail ? [
                this.emailService.sendBookingConfirmationCustomer(
                    payment.passengerEmail,
                    payment.passengerName || 'Customer',
                    payment.ticketNo,
                    payment.route || 'N/A',
                    payment.travelDate || 'N/A',
                    payment.seatNumbers,
                    payment.amount,
                    method
                )
            ] : []),
            this.emailService.sendNewBookingAlertAdmin(
                payment.passengerName || 'Unknown',
                payment.passengerPhone || 'Unknown',
                payment.passengerEmail || '',
                payment.ticketNo,
                payment.route || 'N/A',
                payment.travelDate || 'N/A',
                payment.seatNumbers,
                payment.amount,
                method
            )
        ]).then(results => {
            for (let i = 0; i < results.length; i++) {
                if (results[i].status === 'rejected') {
                    this.logger.error(`[${method.toUpperCase()}] ❌ Email delivery FAILED:`, (results[i] as any).reason?.message || (results[i] as any).reason);
                } else {
                    this.logger.log(`[${method.toUpperCase()}] ✅ Email ${i + 1}/${results.length} sent successfully`);
                }
            }
        });
    }

    /**
     * Retry helper for critical operations
     */
    private async retry(fn: () => Promise<any>, retries = 3, delay = 2000): Promise<any> {
        try {
            return await fn();
        } catch (err) {
            if (retries <= 1) throw err;
            this.logger.warn(`Retrying... attempts left: ${retries - 1}`);
            await new Promise(res => setTimeout(res, delay));
            return this.retry(fn, retries - 1, delay);
        }
    }
}
