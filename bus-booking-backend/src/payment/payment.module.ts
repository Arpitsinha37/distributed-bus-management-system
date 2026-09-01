import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PacoGatewayService } from './paco-gateway.service';
import { EmailModule } from '../email/email.module';
import { CouponModule } from '../coupon/coupon.module';
import { BusPortalModule } from '../bus-portal/bus-portal.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [HttpModule, EmailModule, CouponModule, BusPortalModule, PrismaModule],
    controllers: [PaymentController],
    providers: [PaymentService, PacoGatewayService],
    exports: [PaymentService],
})
export class PaymentModule { }
