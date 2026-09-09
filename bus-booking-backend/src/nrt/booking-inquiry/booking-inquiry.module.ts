import { Module } from '@nestjs/common';
import { BookingInquiryController } from './booking-inquiry.controller';
import { BookingInquiryService } from './booking-inquiry.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
@Module({ imports: [PrismaModule, AuthModule], controllers: [BookingInquiryController], providers: [BookingInquiryService] })
export class BookingInquiryModule { }
