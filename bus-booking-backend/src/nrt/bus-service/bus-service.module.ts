import { Module } from '@nestjs/common';
import { BusServiceController } from './bus-service.controller';
import { BusServiceService } from './bus-service.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({ imports: [PrismaModule, AuthModule], controllers: [BusServiceController], providers: [BusServiceService] })
export class BusServiceModule { }
