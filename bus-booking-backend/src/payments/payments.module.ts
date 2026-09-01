import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeProvider } from './providers/stripe.provider';
import { BookingsModule } from '../bookings/bookings.module';

import { EsewaProvider } from './providers/esewa.provider';
import { KhaltiProvider } from './providers/khalti.provider';

@Module({
  imports: [BookingsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeProvider, EsewaProvider, KhaltiProvider],
})
export class PaymentsModule {}
