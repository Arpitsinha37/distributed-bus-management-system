import { Module } from '@nestjs/common';
import { TourPackageController } from './tour-package.controller';
import { TourPackageService } from './tour-package.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({ imports: [PrismaModule, AuthModule], controllers: [TourPackageController], providers: [TourPackageService] })
export class TourPackageModule { }
