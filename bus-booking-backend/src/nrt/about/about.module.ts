import { Module } from '@nestjs/common';
import { AboutController } from './about.controller';
import { AboutService } from './about.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({ imports: [PrismaModule, AuthModule], controllers: [AboutController], providers: [AboutService] })
export class AboutModule { }
