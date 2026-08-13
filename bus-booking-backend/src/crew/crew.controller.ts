import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CrewService } from './crew.service';
import { CreateCrewDto } from './dto/create-crew.dto';
import { UpdateCrewDto } from './dto/update-crew.dto';
import { CrewRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { StaffRole } from '../common/enums/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('crew')
export class CrewController {
  constructor(private readonly crewService: CrewService) {}

  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Post()
  create(@Body() dto: CreateCrewDto) {
    return this.crewService.create(dto);
  }

  @Get()
  findAll(
    @Query('role') role?: CrewRole,
    @Query('isActive') isActive?: string,
  ) {
    const active = isActive !== undefined ? isActive === 'true' : undefined;
    return this.crewService.findAll(role, active);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.crewService.findOne(id);
  }

  @Roles(StaffRole.SUPER_ADMIN, StaffRole.SITE_MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCrewDto) {
    return this.crewService.update(id, dto);
  }

  @Roles(StaffRole.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.crewService.remove(id);
  }
}
