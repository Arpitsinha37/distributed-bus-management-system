import { Module } from '@nestjs/common';
import { TicketingService } from './ticketing.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [TicketingService],
  exports: [TicketingService],
})
export class TicketingModule {}
