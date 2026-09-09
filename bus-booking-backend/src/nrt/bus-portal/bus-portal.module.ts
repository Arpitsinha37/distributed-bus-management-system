import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BusPortalService } from './bus-portal.service';
import { BusPortalController } from './bus-portal.controller';

@Module({
    imports: [
        HttpModule.register({
            timeout: 15000,
            maxRedirects: 3,
        }),
    ],
    controllers: [BusPortalController],
    providers: [BusPortalService],
    exports: [BusPortalService],
})
export class BusPortalModule { }
