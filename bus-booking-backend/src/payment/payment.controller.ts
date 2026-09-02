// @ts-nocheck
import { Controller, Get, Post, Body, Query, Param, Req, Res, UseGuards, BadRequestException, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { EmailService } from '../email/email.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../common/guards';
import { Response } from 'express';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);
    private readonly frontendUrl = 'https://newroadtravels.com'; // Hardcoded to prod to prevent eSewa localhost redirects

    constructor(
        private paymentService: PaymentService,
        private emailService: EmailService,
    ) { }

    @Post('initiate')
    @ApiOperation({ summary: 'Initiate a payment (eSewa, Khalti, or Card)' })
    async initiate(@Body() dto: {
        ticketNo: string;
        method: string;
        amount: number;
        passengerName?: string;
        passengerPhone?: string;
        passengerEmail?: string;
        route?: string;
        travelDate?: string;
        seatNumbers?: string[];
        frontendUrl?: string;
    }) {
        try {
            return await this.paymentService.initiatePayment(dto);
        } catch (error: any) {
            console.error('PAYMENT INITIATE ERROR:', error);
            throw new BadRequestException(error.message || 'Payment initiation failed');
        }
    }

    @Get(['esewa/success', 'esewa/success/:payload'])
    @ApiOperation({ summary: 'eSewa success callback redirect' })
    async esewaSuccess(
        @Query('data') data: string,
        @Query('paymentId') paymentId: string,
        @Query('ticketNo') ticketNo: string,
        @Query('frontendUrl') frontendUrl: string,
        @Req() req: any,
        @Res() res: Response,
    ) {
        if (req.params.payload) {
            try {
                const decoded = JSON.parse(Buffer.from(req.params.payload, 'base64url').toString('utf-8'));
                paymentId = decoded.paymentId || paymentId;
                ticketNo = decoded.ticketNo || ticketNo;
                frontendUrl = decoded.frontendUrl || frontendUrl;
            } catch (e) {
                this.logger.error('Failed to parse payload parameter');
            }
        }
        this.logger.log(`[ESEWA-SUCCESS] Callback received — data=${data ? 'present' : 'MISSING'}, paymentId=${paymentId}, ticketNo=${ticketNo}, frontendUrl=${frontendUrl || 'default'}`);
        const result = await this.paymentService.verifyEsewa(data, paymentId, req.query);
        const redirectBase = frontendUrl || this.frontendUrl;
        if (result.success) {
            return res.redirect(
                `${redirectBase}/payment-success?status=success&method=esewa&ticketNo=${ticketNo}&paymentId=${paymentId}`,
            );
        }
        return res.redirect(
            `${redirectBase}/payment-success?status=failed&method=esewa&ticketNo=${ticketNo}&paymentId=${paymentId}`,
        );
    }

    @Get(['esewa/failure', 'esewa/failure/:payload'])
    @ApiOperation({ summary: 'eSewa failure callback redirect' })
    async esewaFailure(
        @Query('paymentId') paymentId: string,
        @Query('ticketNo') ticketNo: string,
        @Query('frontendUrl') frontendUrl: string,
        @Req() req: any,
        @Res() res: Response,
    ) {
        if (req.params.payload) {
            try {
                const decoded = JSON.parse(Buffer.from(req.params.payload, 'base64url').toString('utf-8'));
                paymentId = decoded.paymentId || paymentId;
                ticketNo = decoded.ticketNo || ticketNo;
                frontendUrl = decoded.frontendUrl || frontendUrl;
            } catch (e) {
                this.logger.error('Failed to parse payload parameter');
            }
        }
        this.logger.log(`[ESEWA-FAILURE] Callback received — paymentId=${paymentId}, ticketNo=${ticketNo}`);
        await this.paymentService.markFailed(paymentId);
        const redirectBase = frontendUrl || this.frontendUrl;
        return res.redirect(
            `${redirectBase}/payment-success?status=failed&method=esewa&ticketNo=${ticketNo}&paymentId=${paymentId}`,
        );
    }

    @Get(['khalti/verify', 'khalti/verify/:payload'])
    @ApiOperation({ summary: 'Khalti return URL callback — verify and redirect' })
    async khaltiVerify(
        @Query('pidx') pidx: string,
        @Query('paymentId') paymentId: string,
        @Query('ticketNo') ticketNo: string,
        @Query('status') status: string,
        @Query('frontendUrl') frontendUrl: string,
        @Req() req: any,
        @Res() res: Response,
    ) {
        if (req.params.payload) {
            try {
                const decoded = JSON.parse(Buffer.from(req.params.payload, 'base64url').toString('utf-8'));
                paymentId = decoded.paymentId || paymentId;
                ticketNo = decoded.ticketNo || ticketNo;
                frontendUrl = decoded.frontendUrl || frontendUrl;
            } catch (e) {
                this.logger.error('Failed to parse payload parameter');
            }
        }
        const redirectBase = frontendUrl || this.frontendUrl;
        this.logger.log(`[KHALTI-VERIFY] Callback received — pidx=${pidx || 'MISSING'}, paymentId=${paymentId}, ticketNo=${ticketNo}, status=${status}, frontendUrl=${frontendUrl || 'default'}`);
        // Always verify server-side regardless of query param status
        if (pidx) {
            const result = await this.paymentService.verifyKhalti(pidx, paymentId);
            if (result.success) {
                return res.redirect(
                    `${redirectBase}/payment-success?status=success&method=khalti&ticketNo=${ticketNo}&paymentId=${paymentId}`,
                );
            }
        }
        // Only mark failed if user explicitly cancelled (no pidx means they never completed)
        if (!pidx || status === 'User canceled') {
            await this.paymentService.markFailed(paymentId);
        }
        return res.redirect(
            `${redirectBase}/payment-success?status=failed&method=khalti&ticketNo=${ticketNo}&paymentId=${paymentId}`,
        );
    }

    // ═══════════════════════════════════════════
    // Card (PACO / HBL) Payment Callbacks
    // ═══════════════════════════════════════════

    /**
     * Card payment SUCCESS callback
     * HBL/PACO redirects here after successful card payment.
     */
    @Get(['card/success', 'card/success/:payload'])
    @ApiOperation({ summary: 'Card payment success callback (from PACO/HBL gateway)' })
    async cardSuccess(
        @Query('paymentId') paymentId: string,
        @Query('ticketNo') ticketNo: string,
        @Query('txnId') txnId: string,
        @Query('frontendUrl') frontendUrl: string,
        @Req() req: any,
        @Res() res: Response,
    ) {
        if (req.params.payload) {
            try {
                const decoded = JSON.parse(Buffer.from(req.params.payload, 'base64url').toString('utf-8'));
                paymentId = decoded.paymentId || paymentId;
                ticketNo = decoded.ticketNo || ticketNo;
                frontendUrl = decoded.frontendUrl || frontendUrl;
            } catch (e) {
                this.logger.error('Failed to parse payload parameter');
            }
        }
        this.logger.log(`[CARD-SUCCESS] Callback received — paymentId=${paymentId}, ticketNo=${ticketNo}, txnId=${txnId || 'none'}`);
        const result = await this.paymentService.verifyCardPayment(paymentId, txnId);
        const redirectBase = frontendUrl || this.frontendUrl;
        if (result.success) {
            return res.redirect(
                `${redirectBase}/payment-success?status=success&method=card&ticketNo=${ticketNo}&paymentId=${paymentId}`,
            );
        }
        return res.redirect(
            `${redirectBase}/payment-success?status=failed&method=card&ticketNo=${ticketNo}&paymentId=${paymentId}`,
        );
    }

    /**
     * Card payment FAILURE callback
     * HBL/PACO redirects here if card payment failed.
     */
    @Get(['card/failure', 'card/failure/:payload'])
    @ApiOperation({ summary: 'Card payment failure callback (from PACO/HBL gateway)' })
    async cardFailure(
        @Query('paymentId') paymentId: string,
        @Query('ticketNo') ticketNo: string,
        @Query('frontendUrl') frontendUrl: string,
        @Req() req: any,
        @Res() res: Response,
    ) {
        if (req.params.payload) {
            try {
                const decoded = JSON.parse(Buffer.from(req.params.payload, 'base64url').toString('utf-8'));
                paymentId = decoded.paymentId || paymentId;
                ticketNo = decoded.ticketNo || ticketNo;
                frontendUrl = decoded.frontendUrl || frontendUrl;
            } catch (e) {
                this.logger.error('Failed to parse payload parameter');
            }
        }
        this.logger.log(`[CARD-FAILURE] Callback received — paymentId=${paymentId}, ticketNo=${ticketNo}`);
        await this.paymentService.markFailed(paymentId);
        const redirectBase = frontendUrl || this.frontendUrl;
        return res.redirect(
            `${redirectBase}/payment-success?status=failed&method=card&ticketNo=${ticketNo}&paymentId=${paymentId}`,
        );
    }

    /**
     * Card payment CANCEL callback
     * HBL/PACO redirects here when user cancels on the payment page.
     */
    @Get(['card/cancel', 'card/cancel/:payload'])
    @ApiOperation({ summary: 'Card payment cancellation callback (from PACO/HBL gateway)' })
    async cardCancel(
        @Query('paymentId') paymentId: string,
        @Query('ticketNo') ticketNo: string,
        @Query('frontendUrl') frontendUrl: string,
        @Req() req: any,
        @Res() res: Response,
    ) {
        if (req.params.payload) {
            try {
                const decoded = JSON.parse(Buffer.from(req.params.payload, 'base64url').toString('utf-8'));
                paymentId = decoded.paymentId || paymentId;
                ticketNo = decoded.ticketNo || ticketNo;
                frontendUrl = decoded.frontendUrl || frontendUrl;
            } catch (e) {
                this.logger.error('Failed to parse payload parameter');
            }
        }
        this.logger.log(`[CARD-CANCEL] Callback received — paymentId=${paymentId}, ticketNo=${ticketNo}`);
        await this.paymentService.markFailed(paymentId);
        const redirectBase = frontendUrl || this.frontendUrl;
        return res.redirect(
            `${redirectBase}/payment-success?status=cancelled&method=card&ticketNo=${ticketNo}&paymentId=${paymentId}`,
        );
    }

    /**
     * Card payment BACKEND notification (server-to-server)
     * PACO sends a JOSE-encrypted JWE body here after payment completion.
     * This handler decrypts it, matches the payment, and auto-completes if successful.
     */
    @Post('card/backend')
    @ApiOperation({ summary: 'Card payment backend notification (server-to-server from PACO)' })
    async cardBackendNotification(@Body() body: any) {
        console.log('[PACO] Backend notification received');
        const encryptedBody = typeof body === 'string' ? body : body?.payload || body?.token || JSON.stringify(body);
        try {
            const result = await this.paymentService.handleCardBackendNotification(encryptedBody);
            console.log('[PACO] Backend notification result:', JSON.stringify(result));
            return result;
        } catch (err: any) {
            console.error('[PACO] Backend notification error:', err.message);
            return { status: 'error', message: err.message };
        }
    }

    // ═══════════════════════════════════════════
    // Card Admin Operations — Inquiry, Refund, Void
    // ═══════════════════════════════════════════

    @Post(':id/card/inquiry')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin', 'operator_admin')
    @ApiOperation({ summary: 'Admin: Inquire card payment status from PACO/HBL gateway' })
    async cardInquiry(@Param('id') id: string) {
        return this.paymentService.cardInquiry(id);
    }

    @Post(':id/card/refund')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin')
    @ApiOperation({ summary: 'Admin: Refund a completed card payment via PACO/HBL' })
    async cardRefund(@Param('id') id: string, @Body() body: { amount?: number }) {
        return this.paymentService.cardRefund(id, body.amount);
    }

    @Post(':id/card/void')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin')
    @ApiOperation({ summary: 'Admin: Void an unsettled card payment via PACO/HBL' })
    async cardVoid(@Param('id') id: string, @Body() body: { approvalCode: string }) {
        if (!body.approvalCode) {
            throw new BadRequestException('approvalCode is required to void a card payment.');
        }
        return this.paymentService.cardVoid(id, body.approvalCode);
    }

    // ═══════════════════════════════════════════
    // Diagnostics
    // ═══════════════════════════════════════════

    @Get('test-email')
    @ApiOperation({ summary: 'Diagnostic: send a test email to verify SMTP works' })
    async testEmail(@Query('to') to: string) {
        const targetEmail = to || 'arpitsinha579@gmail.com';
        return this.emailService.sendTestEmail(targetEmail);
    }

    // ═══════════════════════════════════════════
    // Public ticket lookup (for ticket generation page)
    // ═══════════════════════════════════════════

    @Get('ticket/:ticketNo')
    @ApiOperation({ summary: 'Get completed payment details by ticket number (public)' })
    async getByTicketNo(@Param('ticketNo') ticketNo: string) {
        // First try our DB
        try {
            const payment = await this.paymentService.findByTicketNo(ticketNo);
            if (payment) return payment;
        } catch (e) {
            // Not found in our DB — fall through to bus portal
        }

        // Not in our DB — try to fetch from bus portal and auto-save
        try {
            const saved = await this.paymentService.syncManualBookingFromPortal(ticketNo);
            if (saved) return saved;
        } catch (portalErr: any) {
            this.logger.warn(`[TICKET-LOOKUP] Bus portal fallback failed for ${ticketNo}: ${portalErr?.message}`);
        }

        // Nothing found anywhere
        throw new BadRequestException(`Ticket ${ticketNo} not found`);
    }

    @Get('phone/:phone')
    @ApiOperation({ summary: 'Get all completed bookings by passenger phone number (public)' })
    async getByPhone(@Param('phone') phone: string) {
        return this.paymentService.findByPhone(phone);
    }

    // ═══════════════════════════════════════════
    // Admin endpoints (CMS dashboard)
    // ═══════════════════════════════════════════

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin', 'operator_admin', 'staff')
    @ApiOperation({ summary: 'List all payments (CMS dashboard)' })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('method') method?: string,
        @Query('status') status?: string,
    ) {
        return this.paymentService.findAll(
            Number(page) || 1,
            Number(limit) || 20,
            method || undefined,
            status || undefined,
        );
    }

    @Get('stats')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin', 'operator_admin')
    @ApiOperation({ summary: 'Get payment statistics' })
    getStats(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('method') method?: string,
        @Query('status') status?: string,
    ) {
        return this.paymentService.getStats({ startDate, endDate, method, status });
    }

    @Get('analytics')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin', 'operator_admin')
    @ApiOperation({ summary: 'Get advanced analytics (Frappe-style dashboard data)' })
    getAnalytics(@Query('period') period?: string) {
        return this.paymentService.getAnalytics(period || '30d');
    }

    @Post(':id/sync')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin', 'operator_admin')
    @ApiOperation({ summary: 'Admin force-sync a pending payment with Khalti/eSewa/Card' })
    async syncPayment(@Param('id') id: string) {
        return this.paymentService.syncPaymentStatus(id);
    }

    @Post(':id/force-complete')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin', 'operator_admin')
    @ApiOperation({ summary: 'Emergency: Admin force-complete a payment (manual override)' })
    async forceComplete(@Param('id') id: string, @Body() body: { transactionId?: string }) {
        return this.paymentService.forceComplete(id, body.transactionId);
    }
}
