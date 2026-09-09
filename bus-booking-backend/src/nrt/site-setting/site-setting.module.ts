import { Module } from '@nestjs/common';
import { SiteSettingController } from './site-setting.controller';
import { SiteSettingService } from './site-setting.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
@Module({ imports: [PrismaModule, AuthModule], controllers: [SiteSettingController], providers: [SiteSettingService] })
export class SiteSettingModule { }
