import { Module } from '@nestjs/common';
import { FAQController } from './faq.controller';
import { FAQService } from './faq.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
@Module({ imports: [PrismaModule, AuthModule], controllers: [FAQController], providers: [FAQService] })
export class FAQModule { }
