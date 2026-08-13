import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { SeatLockService } from './seat-lock.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, SeatLockService],
  exports: [BookingsService],
})
export class BookingsModule {}
