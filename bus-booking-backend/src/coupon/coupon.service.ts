import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CouponService {
    private readonly logger = new Logger(CouponService.name);

    async validate(dto: any) {
        this.logger.log(`[DUMMY] validate called with ${JSON.stringify(dto)}`);
        return {
            finalAmount: dto.bookingAmount,
            discountAmount: 0
        };
    }

    async redeem(dto: any) {
        this.logger.log(`[DUMMY] redeem called`);
        return { success: true };
    }
}
