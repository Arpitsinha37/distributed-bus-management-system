import { Body, Controller, Headers, Param, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post(':gateway/initiate')
  initiate(@Param('gateway') gateway: string, @Body('bookingId') bookingId: string) {
    return this.paymentsService.initiate(bookingId, gateway);
  }

  // Gateways call this directly — needs the raw body for signature
  // verification, so this route must be excluded from JSON body parsing
  // (enable `rawBody: true` in NestFactory.create options in main.ts).
  @Post(':gateway/webhook')
  webhook(
    @Param('gateway') gateway: string,
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(gateway, req.rawBody ?? '', signature);
  }
}
