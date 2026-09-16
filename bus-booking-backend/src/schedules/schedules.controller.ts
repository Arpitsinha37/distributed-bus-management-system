import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { StaffRole } from '../common/enums/roles.enum';

@Controller('schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.schedulesService.findAll(includeInactive === 'true');
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateScheduleDto>) {
    return this.schedulesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN)
  @Put(':id')
  replace(@Param('id') id: string, @Body() dto: Partial<CreateScheduleDto>) {
    return this.schedulesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }
}
