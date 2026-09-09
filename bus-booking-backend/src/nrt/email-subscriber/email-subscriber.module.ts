import { Module, forwardRef } from '@nestjs/common';
import { EmailSubscriberController } from './email-subscriber.controller';
import { EmailSubscriberService } from './email-subscriber.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { AutomationModule } from '../automation/automation.module';
@Module({ imports: [PrismaModule, AuthModule, forwardRef(() => AutomationModule)], controllers: [EmailSubscriberController], providers: [EmailSubscriberService] })
export class EmailSubscriberModule { }
