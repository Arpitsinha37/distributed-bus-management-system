import { Module } from '@nestjs/common';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
@Module({ imports: [PrismaModule, AuthModule], controllers: [FeatureController], providers: [FeatureService] })
export class FeatureModule { }
