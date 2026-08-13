import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { FleetService } from './fleet.service';
import { CreateSeatLayoutDto } from './dto/create-seat-layout.dto';
import { CreateBusDto } from './dto/create-bus.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { StaffRole } from '../common/enums/roles.enum';

@Controller('fleet')
export class FleetController {
  constructor(private fleetService: FleetService) {}

  // ── Seat Layouts ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN)
  @Post('seat-layouts')
  createSeatLayout(@Body() dto: CreateSeatLayoutDto) {
    return this.fleetService.createSeatLayout(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('seat-layouts')
  findAllSeatLayouts() {
    return this.fleetService.findAllSeatLayouts();
  }

  @UseGuards(JwtAuthGuard)
  @Get('seat-layouts/:id')
  findOneSeatLayout(@Param('id') id: string) {
    return this.fleetService.findOneSeatLayout(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN)
  @Patch('seat-layouts/:id')
  updateSeatLayout(@Param('id') id: string, @Body() dto: Partial<CreateSeatLayoutDto>) {
    return this.fleetService.updateSeatLayout(id, dto);
  }

  // ── Buses ────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('buses/expiring')
  getExpiringDocuments() {
    return this.fleetService.getExpiringDocuments();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN)
  @Post('buses')
  createBus(@Body() dto: CreateBusDto) {
    return this.fleetService.createBus(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('buses')
  findAllBuses() {
    return this.fleetService.findAllBuses();
  }

  @UseGuards(JwtAuthGuard)
  @Get('buses/:id')
  findOneBus(@Param('id') id: string) {
    return this.fleetService.findOneBus(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN)
  @Patch('buses/:id')
  updateBus(@Param('id') id: string, @Body() dto: Partial<CreateBusDto>) {
    return this.fleetService.updateBus(id, dto);
  }
}

