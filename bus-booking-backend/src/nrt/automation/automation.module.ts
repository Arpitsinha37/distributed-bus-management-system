import { Module, forwardRef } from '@nestjs/common';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CampaignModule } from '../campaign/campaign.module';

@Module({
    imports: [
        PrismaModule,
        forwardRef(() => CampaignModule),
    ],
    controllers: [AutomationController],
    providers: [AutomationService],
    exports: [AutomationService],
})
export class AutomationModule { }
