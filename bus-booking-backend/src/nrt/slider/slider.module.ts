import { Module } from '@nestjs/common';
import { SliderController } from './slider.controller';
import { SliderService } from './slider.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
@Module({ imports: [PrismaModule, AuthModule], controllers: [SliderController], providers: [SliderService] })
export class SliderModule { }
