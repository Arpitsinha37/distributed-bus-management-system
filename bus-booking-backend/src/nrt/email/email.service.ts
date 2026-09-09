import axios from 'axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

interface MailOptions {
    fromName: string;
    fromEmail: string;
    to: string[];
    subject: string;
    html: string;
}

@Injectable()
export class EmailService implements OnModuleInit {
    private readonly logger = new Logger(EmailService.name);
    private readonly adminEmail = process.env.ADMIN_EMAIL || 'contact@newroadtravels.com';
    private readonly senderEmail = 'contact@newroadtravels.com';
    private readonly apiKey = process.env.BREVO_API_KEY || '';

    constructor() {}

    async onModuleInit() {
        this.logger.log('✅ Brevo REST API Email Service Initialized');
    }

    private async sendWithRetry(
        mailOptions: MailOptions,
        context: string,
        maxRetries = 3,
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                    method: 'POST',
                    headers: {
                        'api-key': this.apiKey,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sender: { name: mailOptions.fromName, email: mailOptions.fromEmail },
                        to: mailOptions.to.map(email => ({ email })),
                        subject: mailOptions.subject,
                        htmlContent: mailOptions.html,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    this.logger.log(`✅ [${context}] Email sent via API on attempt ${attempt}/${maxRetries} [${data.messageId}]`);
                    return { success: true, messageId: data.messageId };
                } else {
                    throw new Error(data.message || JSON.stringify(data));
                }
            } catch (error: any) {
                this.logger.warn(`❌ [${context}] Email attempt ${attempt}/${maxRetries} failed: ${error?.message}`);
                if (attempt < maxRetries) {
                    const delay = 2000 * attempt;
                    await new Promise(r => setTimeout(r, delay));
                } else {
                    this.logger.error(`🚨 [${context}] ALL ${maxRetries} email attempts failed. Last error: ${error?.message}`);
                    return { success: false, error: error?.message };
                }
            }
        }
        return { success: false, error: 'Unknown failure' };
    }

    async sendTestEmail(to: string): Promise<{ success: boolean; messageId?: string; error?: string; smtpReady?: boolean }> {
        try {
            const result = await this.sendWithRetry(
                {
                    fromName: 'New Road Travels',
                    fromEmail: this.senderEmail,
                    to: [to],
                    subject: `Test Email ${new Date().toISOString()}`,
                    html: `<h2 style="color:#EF4F5F;">Brevo REST API Test Passed ✅</h2><p>Sent at ${new Date().toISOString()}</p>`,
                },
                'Diagnostic-Test'
            );
            return { success: result.success, messageId: result.messageId, error: result.error, smtpReady: true };
        } catch (error: any) {
            return { success: false, error: error?.message, smtpReady: false };
        }
    }

    async sendBookingConfirmationCustomer(
        toEmail: string,
        passengerName: string,
        ticketNo: string,
        route: string,
        travelDate: string,
        seatNumbers: string[],
        amount: number,
        method: string
    ) {
        if (!toEmail) return;

        const subject = `✅ Booking Confirmed: Ticket ${ticketNo} - New Road Travels`;
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#f4f5f7;font-family:'Segoe UI',Roboto,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 16px;"><tr><td align="center"><table width="100%" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);"><tr><td style="background:linear-gradient(135deg,#10b981,#059669);padding:32px 24px;text-align:center;"><img src="https://newroadtravels.com/nrt-logo.png" alt="New Road Travels" width="60" height="60" style="display:block;margin:0 auto 12px;border-radius:12px;" /><h1 style="color:#ffffff;font-size:22px;margin:0 0 4px;">Booking Confirmed!</h1><p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;">Your bus ticket has been booked successfully</p></td></tr><tr><td style="padding:24px 24px 8px;"><p style="color:#374151;font-size:14px;margin:0;">Dear <strong>${passengerName}</strong>,</p><p style="color:#6b7280;font-size:13px;margin:8px 0 0;">Thank you for booking with New Road Travels. Here are your ticket details:</p></td></tr><tr><td style="padding:16px 24px;"><table width="100%" style="background-color:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;" cellpadding="0" cellspacing="0"><tr><td style="padding:16px 20px;border-bottom:2px dashed #e5e7eb;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Ticket No</td><td style="text-align:right;font-family:'Courier New',monospace;font-weight:bold;color:#111827;font-size:16px;">${ticketNo}</td></tr></table></td></tr><tr><td style="padding:16px 20px;"><table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;"><tr><td style="color:#9ca3af;padding-bottom:10px;">Route</td><td style="text-align:right;color:#111827;font-weight:600;padding-bottom:10px;">${route}</td></tr><tr><td style="color:#9ca3af;padding-bottom:10px;">Travel Date</td><td style="text-align:right;color:#111827;font-weight:600;padding-bottom:10px;">${travelDate}</td></tr><tr><td style="color:#9ca3af;padding-bottom:10px;">Seat(s)</td><td style="text-align:right;color:#111827;font-weight:600;padding-bottom:10px;">${seatNumbers.join(', ')}</td></tr><tr><td style="color:#9ca3af;padding-bottom:10px;">Payment</td><td style="text-align:right;color:#111827;font-weight:600;padding-bottom:10px;">${method}</td></tr><tr style="border-top:1px solid #e5e7eb;"><td style="color:#111827;font-weight:bold;padding-top:12px;font-size:15px;">Total Paid</td><td style="text-align:right;color:#059669;font-weight:bold;padding-top:12px;font-size:15px;">NPR ${amount.toFixed(2)}</td></tr></table></td></tr></table></td></tr><tr><td style="padding:0 24px 16px;"><table width="100%" style="background-color:#eff6ff;border-radius:10px;border:1px solid #dbeafe;" cellpadding="0" cellspacing="0"><tr><td style="padding:12px 16px;font-size:12px;color:#1d4ed8;"><strong>📋 Important:</strong> Please present your ticket number <strong>${ticketNo}</strong> when boarding the bus.</td></tr></table></td></tr><tr><td style="padding:0 24px 24px;text-align:center;"><a href="https://new-road-travels.vercel.app/account" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:13px;font-weight:bold;">Track My Booking</a></td></tr><tr><td style="background-color:#f9fafb;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;"><p style="color:#6b7280;font-size:11px;margin:0 0 4px;">Have a safe journey! 🚌</p><p style="color:#9ca3af;font-size:10px;margin:0;">New Road Travels • Kathmandu, Nepal • 9856068470</p></td></tr></table></td></tr></table></body></html>`;

        const result = await this.sendWithRetry(
            {
                fromName: 'New Road Travels',
                fromEmail: this.senderEmail,
                to: [toEmail],
                subject,
                html,
            },
            `Customer-${ticketNo}`
        );

        if (!result.success) {
            throw new Error(`Customer email failed for ${toEmail}: ${result.error}`);
        }
    }

    async sendNewBookingAlertAdmin(
        passengerName: string,
        passengerPhone: string,
        passengerEmail: string,
        ticketNo: string,
        route: string,
        travelDate: string,
        seatNumbers: string[],
        amount: number,
        method: string
    ) {
        const alertTo = 'arpitsinha579@gmail.com';

        const subject = `🚀 New Booking: ${ticketNo} — ${route}`;
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#f4f5f7;font-family:'Segoe UI',Roboto,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 16px;"><tr><td align="center"><table width="100%" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);"><tr><td style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:24px;text-align:center;"><img src="https://newroadtravels.com/nrt-logo.png" alt="New Road Travels" width="48" height="48" style="display:block;margin:0 auto 10px;border-radius:10px;" /><h1 style="color:#ffffff;font-size:18px;margin:0;">🚀 New Booking Alert</h1></td></tr><tr><td style="padding:24px;"><h3 style="color:#374151;margin:0 0 16px;font-size:14px;">Passenger Details</h3><table width="100%" style="font-size:13px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;" cellpadding="0" cellspacing="0"><tr><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Name</td><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#111827;">${passengerName}</td></tr><tr><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Phone</td><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#111827;">${passengerPhone}</td></tr><tr><td style="padding:10px 16px;color:#6b7280;">Email</td><td style="padding:10px 16px;text-align:right;font-weight:600;color:#111827;">${passengerEmail || 'N/A'}</td></tr></table><h3 style="color:#374151;margin:20px 0 16px;font-size:14px;">Ticket Details</h3><table width="100%" style="font-size:13px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;" cellpadding="0" cellspacing="0"><tr><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Ticket</td><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace;font-weight:bold;color:#111827;">${ticketNo}</td></tr><tr><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Route</td><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#111827;">${route}</td></tr><tr><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Date</td><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#111827;">${travelDate}</td></tr><tr><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Seats</td><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#111827;">${seatNumbers.join(', ')}</td></tr><tr><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Payment</td><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#111827;">${method}</td></tr><tr><td style="padding:10px 16px;color:#6b7280;font-weight:bold;">Amount</td><td style="padding:10px 16px;text-align:right;font-weight:bold;color:#059669;font-size:15px;">NPR ${amount}</td></tr></table></td></tr><tr><td style="background-color:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;"><p style="color:#9ca3af;font-size:10px;margin:0;">New Road Travels Admin Alert • ${new Date().toISOString().split('T')[0]}</p></td></tr></table></td></tr></table></body></html>`;

        const result = await this.sendWithRetry(
            {
                fromName: 'New Road Travels Alerts',
                fromEmail: this.senderEmail,
                to: [alertTo],
                subject,
                html,
            },
            `Admin-${ticketNo}`
        );

        if (!result.success) {
            throw new Error(`Admin email failed for ticket ${ticketNo}: ${result.error}`);
        }
    }
}
