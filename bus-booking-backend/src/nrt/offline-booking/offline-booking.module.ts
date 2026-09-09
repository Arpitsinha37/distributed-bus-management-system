import { Module } from '@nestjs/common';
import { OfflineBookingController } from './offline-booking.controller';
import { OfflineBookingService } from './offline-booking.service';
import { OfflineBookingApiKeyGuard } from './offline-booking.guard';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [EmailModule],
    controllers: [OfflineBookingController],
    providers: [OfflineBookingService, OfflineBookingApiKeyGuard],
    exports: [OfflineBookingService],
})
export class OfflineBookingModule {}
