import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { BookingsModule } from '../bookings/bookings.module';

import { EsewaProvider } from './providers/esewa.provider';
import { KhaltiProvider } from './providers/khalti.provider';
import { PacoProvider } from './providers/paco.provider';

@Module({
  imports: [BookingsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, EsewaProvider, KhaltiProvider, PacoProvider],
})
export class PaymentsModule {}
