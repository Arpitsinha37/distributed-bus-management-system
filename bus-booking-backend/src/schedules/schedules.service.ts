import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateScheduleDto) {
    const { fareTiers, ...rest } = dto;
    return this.prisma.schedule.create({ 
      data: {
        ...rest,
        fareTiers: {
          create: fareTiers || [],
        }
      },
      include: { route: true, bus: true, fareTiers: true },
    });
  }

  async findAll() {
    const data = await this.prisma.schedule.findMany({
      include: { route: true, bus: true, fareTiers: true },
      orderBy: { createdAt: 'asc' },
    });
    return { data, total: data.length };
  }

  async findOne(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: { route: true, bus: true, fareTiers: true },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  async update(id: string, dto: Partial<CreateScheduleDto>) {
    await this.findOne(id);
    const { fareTiers, ...rest } = dto;
    
    // If fareTiers is provided, we can replace them entirely.
    if (fareTiers !== undefined) {
      await this.prisma.fareTier.deleteMany({ where: { scheduleId: id } });
    }

    return this.prisma.schedule.update({
      where: { id },
      data: {
        ...rest,
        ...(fareTiers !== undefined && {
          fareTiers: {
            create: fareTiers,
          }
        })
      },
      include: { route: true, bus: true, fareTiers: true },
    });
  }

  findActive() {
    return this.prisma.schedule.findMany({ where: { isActive: true }, include: { fareTiers: true } });
  }
}

