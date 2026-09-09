import { Module } from '@nestjs/common';
import { AdventureActivityController } from './adventure-activity.controller';
import { AdventureActivityService } from './adventure-activity.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [AdventureActivityController],
    providers: [AdventureActivityService]
})
export class AdventureActivityModule { }
