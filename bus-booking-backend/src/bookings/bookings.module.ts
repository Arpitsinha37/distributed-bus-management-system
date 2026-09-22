import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { SeatLockService } from './seat-lock.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [BookingsController],
  providers: [BookingsService, SeatLockService],
  exports: [BookingsService],
})
export class BookingsModule {}
