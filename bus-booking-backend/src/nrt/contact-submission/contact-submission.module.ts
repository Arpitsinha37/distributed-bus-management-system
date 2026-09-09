import { Module } from '@nestjs/common';
import { ContactSubmissionController } from './contact-submission.controller';
import { ContactSubmissionService } from './contact-submission.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
@Module({ imports: [PrismaModule, AuthModule], controllers: [ContactSubmissionController], providers: [ContactSubmissionService] })
export class ContactSubmissionModule { }
