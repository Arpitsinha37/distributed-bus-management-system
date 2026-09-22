import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`Email transport configured: ${host}:${port}`);
    } else {
      this.logger.warn('SMTP not configured — emails will be logged but not sent. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars.');
    }
  }

  private get fromAddress(): string {
    return process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@pokharatravels.com';
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.log(`[NO-SMTP] Would send to ${to}: ${subject}`);
      return { success: true, simulated: true };
    }
    try {
      await this.transporter.sendMail({
        from: `"Pokhara Travels" <${this.fromAddress}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
      return { success: true };
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err);
      return { success: false, error: (err as Error).message };
    }
  }

  async sendBookingConfirmationCustomer(booking: {
    customerName: string;
    customerEmail: string;
    bookingRef: string;
    route: string;
    date: string;
    departureTime: string;
    seatNumbers: string[];
    totalFare: number;
    pickupPoint?: string;
  }) {
    if (!booking.customerEmail) {
      this.logger.warn('No customer email provided — skipping confirmation email');
      return { success: false, reason: 'no_email' };
    }

    const siteUrl = process.env.FRONTEND_URL || 'https://pokharatokathmandutouristbusbooking.com';
    const trackUrl = `${siteUrl}/track?pnr=${booking.bookingRef}`;
    const waNumber = process.env.OPERATOR_WHATSAPP || '9779800000000';
    const waText = encodeURIComponent(
      `Hi! I just booked PNR: ${booking.bookingRef}\nRoute: ${booking.route}\nDate: ${booking.date}\nSeats: ${booking.seatNumbers.join(', ')}`
    );
    const waLink = `https://wa.me/${waNumber}?text=${waText}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <!-- Header -->
    <tr><td style="background:linear-gradient(135deg,#10b981,#059669);padding:32px 24px;text-align:center;">
        <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:14px;margin:0 auto 12px;line-height:56px;font-size:28px;">✓</div>
        <h1 style="color:#ffffff;font-size:22px;margin:0 0 4px;">Booking Confirmed!</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;">Your bus ticket has been booked successfully</p>
    </td></tr>
    
    <!-- Greeting -->
    <tr><td style="padding:24px 24px 8px;">
        <p style="color:#374151;font-size:14px;margin:0;">Dear <strong>${booking.customerName}</strong>,</p>
        <p style="color:#6b7280;font-size:13px;margin:8px 0 0;">Thank you for booking with Pokhara Travels. Here are your ticket details:</p>
    </td></tr>
    
    <!-- Ticket Card -->
    <tr><td style="padding:16px 24px;">
        <table width="100%" style="background-color:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;" cellpadding="0" cellspacing="0">
            <tr><td style="padding:16px 20px;border-bottom:2px dashed #e5e7eb;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Ticket No</td>
                        <td style="text-align:right;font-family:'Courier New',monospace;font-weight:bold;color:#111827;font-size:16px;">${booking.bookingRef}</td>
                    </tr>
                </table>
            </td></tr>
            <tr><td style="padding:16px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
                    <tr><td style="color:#9ca3af;padding-bottom:10px;">Route</td><td style="text-align:right;color:#111827;font-weight:600;padding-bottom:10px;">${booking.route}</td></tr>
                    <tr><td style="color:#9ca3af;padding-bottom:10px;">Travel Date</td><td style="text-align:right;color:#111827;font-weight:600;padding-bottom:10px;">${booking.date}</td></tr>
                    <tr><td style="color:#9ca3af;padding-bottom:10px;">Departure</td><td style="text-align:right;color:#111827;font-weight:600;padding-bottom:10px;">${booking.departureTime}</td></tr>
                    <tr><td style="color:#9ca3af;padding-bottom:10px;">Seat(s)</td><td style="text-align:right;color:#111827;font-weight:600;padding-bottom:10px;">${booking.seatNumbers.join(', ')}</td></tr>
                    ${booking.pickupPoint ? `<tr><td style="color:#9ca3af;padding-bottom:10px;">Pickup Point</td><td style="text-align:right;color:#111827;font-weight:600;padding-bottom:10px;">${booking.pickupPoint}</td></tr>` : ''}
                    <tr style="border-top:1px solid #e5e7eb;"><td style="color:#111827;font-weight:bold;padding-top:12px;font-size:15px;">Total Paid</td><td style="text-align:right;color:#059669;font-weight:bold;padding-top:12px;font-size:15px;">NPR ${booking.totalFare.toLocaleString()}</td></tr>
                </table>
            </td></tr>
        </table>
    </td></tr>
    
    <!-- Important Note -->
    <tr><td style="padding:0 24px 16px;">
        <table width="100%" style="background-color:#eff6ff;border-radius:10px;border:1px solid #dbeafe;" cellpadding="0" cellspacing="0">
            <tr><td style="padding:12px 16px;font-size:12px;color:#1d4ed8;">
                <strong>📋 Important:</strong> Please present your ticket number <strong>${booking.bookingRef}</strong> when boarding the bus. Arrive 15 minutes before departure.
            </td></tr>
        </table>
    </td></tr>
    
    <!-- CTA -->
    <tr><td style="padding:0 24px 24px;text-align:center;">
        <a href="${trackUrl}" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:13px;font-weight:bold;margin-bottom:12px;">View Full Ticket</a><br/>
        <a href="${waLink}" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:10px;font-size:13px;font-weight:bold;">💬 Share on WhatsApp</a>
    </td></tr>
    
    <!-- Footer -->
    <tr><td style="background-color:#f9fafb;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#6b7280;font-size:11px;margin:0 0 4px;">Have a safe journey! 🚌</p>
        <p style="color:#9ca3af;font-size:10px;margin:0;">Pokhara Travels • Nepal • This is an automated email.</p>
    </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    return this.send(booking.customerEmail, `Booking Confirmed — PNR ${booking.bookingRef} | ${booking.route}`, html);
  }

  async sendNewBookingAlertAdmin(booking: {
    bookingRef: string;
    customerName: string;
    customerPhone?: string;
    route: string;
    date: string;
    departureTime: string;
    seatNumbers: string[];
    totalFare: number;
  }) {
    const adminEmail = process.env.ADMIN_ALERT_EMAIL;
    if (!adminEmail) {
      this.logger.log('[NO-ADMIN-EMAIL] Skipping admin booking alert');
      return { success: false, reason: 'no_admin_email' };
    }

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px 24px;">
    <h2 style="color:#333;margin:0 0 16px;">🔔 New Booking Alert</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#666;">PNR</td><td style="padding:8px 0;font-weight:700;color:#DC143C;">${booking.bookingRef}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Customer</td><td style="padding:8px 0;font-weight:600;">${booking.customerName}</td></tr>
      ${booking.customerPhone ? `<tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;">${booking.customerPhone}</td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#666;">Route</td><td style="padding:8px 0;">${booking.route}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Date</td><td style="padding:8px 0;">${booking.date}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Departure</td><td style="padding:8px 0;">${booking.departureTime}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Seats</td><td style="padding:8px 0;">${booking.seatNumbers.join(', ')}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:12px 0;color:#333;font-weight:700;">Total</td><td style="padding:12px 0;font-weight:700;color:#DC143C;">NPR ${booking.totalFare.toLocaleString()}</td></tr>
    </table>
  </div>
</body>
</html>`;

    return this.send(adminEmail, `New Booking: ${booking.bookingRef} — ${booking.route}`, html);
  }

  async sendPaymentFailed(email: string, booking: {
    customerName: string;
    bookingRef: string;
    route: string;
  }) {
    if (!email) return { success: false, reason: 'no_email' };

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ef4444;padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">⚠️ Payment Failed</h1>
    </div>
    <div style="padding:32px 24px;">
      <p>Hi <strong>${booking.customerName}</strong>,</p>
      <p>We couldn't process your payment for booking <strong>${booking.bookingRef}</strong> on the <strong>${booking.route}</strong> route.</p>
      <p>Don't worry — no money has been deducted. If any amount was charged, it will be refunded within 24-48 hours.</p>
      <p>Please try booking again.</p>
    </div>
  </div>
</body>
</html>`;

    return this.send(email, `Payment Failed — ${booking.bookingRef}`, html);
  }

  async sendBookingCancellation(email: string, booking: {
    customerName: string;
    bookingRef: string;
    route: string;
    refundAmount?: number;
  }) {
    if (!email) return { success: false, reason: 'no_email' };

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#f59e0b;padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Booking Cancelled</h1>
    </div>
    <div style="padding:32px 24px;">
      <p>Hi <strong>${booking.customerName}</strong>,</p>
      <p>Your booking <strong>${booking.bookingRef}</strong> for the <strong>${booking.route}</strong> route has been cancelled.</p>
      ${booking.refundAmount ? `<p>A refund of <strong>NPR ${booking.refundAmount.toLocaleString()}</strong> will be processed within 3-5 business days.</p>` : ''}
      <p>If you didn't request this cancellation, please contact us immediately.</p>
    </div>
  </div>
</body>
</html>`;

    return this.send(email, `Booking Cancelled — ${booking.bookingRef}`, html);
  }
}
