import { Injectable, Logger } from '@nestjs/common';

// One place for every outbound channel. Ticketing calls this after
// generating a ticket; nothing else in the app needs to know how SMS,
// email, or WhatsApp actually work.
@Injectable()
export class NotificationsService {
  private logger = new Logger(NotificationsService.name);

  async sendEmail(to: string, subject: string, body: string) {
    // plug in SendGrid/SES here
    this.logger.log(`[email] to=${to} subject="${subject}"`);
  }

  async sendSms(to: string, message: string) {
    // plug in a local SMS gateway (e.g. Sparrow SMS) or Twilio here
    this.logger.log(`[sms] to=${to} message="${message}"`);
  }

  async sendWhatsApp(to: string, message: string) {
    // plug in the WhatsApp Cloud API or a BSP here
    this.logger.log(`[whatsapp] to=${to} message="${message}"`);
  }
}
