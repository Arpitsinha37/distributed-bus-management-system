import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { TripsService } from './trips.service';
import { SearchTripsDto } from './dto/search-trips.dto';
import { AssignCrewDto } from './dto/assign-crew.dto';

@Controller('trips')
export class TripsController {
  constructor(private tripsService: TripsService) {}

  // Public — this is the main storefront search endpoint.
  @Get('search')
  search(@Query() dto: SearchTripsDto) {
    return this.tripsService.search(dto);
  }

  // Public — seat map for the seat-selection screen.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  // ── Admin: Trip Crew ─────────────────────────────────────────

  @Post(':id/crew')
  assignCrew(@Param('id') id: string, @Body() dto: AssignCrewDto) {
    return this.tripsService.assignCrew(id, dto);
  }

  @Get(':id/crew')
  getTripCrew(@Param('id') id: string) {
    return this.tripsService.getTripCrew(id);
  }

  @Delete(':id/crew/:crewId')
  removeTripCrew(@Param('id') id: string, @Param('crewId') crewId: string) {
    return this.tripsService.removeTripCrew(id, crewId);
  }
}
