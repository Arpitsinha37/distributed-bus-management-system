import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { BusPortalModule } from '../nrt/bus-portal/bus-portal.module';

@Module({
  imports: [BusPortalModule],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
