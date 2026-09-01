import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    async sendBookingConfirmationCustomer(...args: any[]) {
        this.logger.log(`[DUMMY] sendBookingConfirmationCustomer called`);
        return { success: true };
    }

    async sendNewBookingAlertAdmin(...args: any[]) {
        this.logger.log(`[DUMMY] sendNewBookingAlertAdmin called`);
        return { success: true };
    }
}
