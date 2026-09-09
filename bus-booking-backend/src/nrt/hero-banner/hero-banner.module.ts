import { Module } from '@nestjs/common';
import { HeroBannerController } from './hero-banner.controller';
import { HeroBannerService } from './hero-banner.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({ imports: [PrismaModule, AuthModule], controllers: [HeroBannerController], providers: [HeroBannerService] })
export class HeroBannerModule { }
