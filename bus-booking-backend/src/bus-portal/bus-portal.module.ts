import { Module } from '@nestjs/common';
import { BusPortalService } from './bus-portal.service';

@Module({
  providers: [BusPortalService],
  exports: [BusPortalService]
})
export class BusPortalModule {}
