import { Module } from '@nestjs/common';
import { VehicleRentalController } from './vehicle-rental.controller';
import { VehicleRentalService } from './vehicle-rental.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({ imports: [PrismaModule, AuthModule], controllers: [VehicleRentalController], providers: [VehicleRentalService] })
export class VehicleRentalModule { }
