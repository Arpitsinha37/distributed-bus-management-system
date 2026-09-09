import { Module } from '@nestjs/common';
import { PartnerRequestController } from './partner-request.controller';
import { PartnerRequestService } from './partner-request.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
@Module({ imports: [PrismaModule, AuthModule], controllers: [PartnerRequestController], providers: [PartnerRequestService] })
export class PartnerRequestModule { }
