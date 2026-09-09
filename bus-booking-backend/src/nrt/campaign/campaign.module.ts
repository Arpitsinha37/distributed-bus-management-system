import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [PrismaModule, AuthModule, EmailModule],
    controllers: [CampaignController],
    providers: [CampaignService],
    exports: [CampaignService],
})
export class CampaignModule { }
