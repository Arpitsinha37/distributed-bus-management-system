import { Module } from '@nestjs/common';
import { DestinationController } from './destination.controller';
import { DestinationService } from './destination.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [DestinationController],
    providers: [DestinationService],
    exports: [DestinationService],
})
export class DestinationModule { }
