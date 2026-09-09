import { Module } from '@nestjs/common';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [StoryController],
    providers: [StoryService],
    exports: [StoryService],
})
export class StoryModule { }
