import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BusPortalService {
    private readonly logger = new Logger(BusPortalService.name);

    async confirmPayment(ticketNo: string, txnRef: string, status: string) {
        this.logger.log(`[DUMMY] confirmPayment called for ticket ${ticketNo}. Simulating success.`);
        return { success: true };
    }

    async cancelHolding(ticketNo: string) {
        this.logger.log(`[DUMMY] cancelHolding called for ticket ${ticketNo}. Simulating success.`);
        return { success: true };
    }

    async getPassengerDetail(ticketNo: string) {
        this.logger.log(`[DUMMY] getPassengerDetail called for ticket ${ticketNo}. Returning mock.`);
        return {
            passengerName: 'Customer',
            passengerPhone: 'N/A'
        };
    }
}
