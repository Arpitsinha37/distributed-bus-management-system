import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateScheduleDto) {
    const { fareTiers, rotationStartDate, ...rest } = dto;
    return this.prisma.schedule.create({ 
      data: {
        ...rest,
        ...(rotationStartDate ? { rotationStartDate: new Date(rotationStartDate) } : {}),
        fareTiers: {
          create: fareTiers || [],
        }
      },
      include: { route: true, bus: true, fareTiers: true },
    });
  }

  async findAll(includeInactive = false) {
    const data = await this.prisma.schedule.findMany({
      where: includeInactive ? undefined : { isActive: true },
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
    const { fareTiers, rotationStartDate, ...rest } = dto;
    
    // If fareTiers is provided, we can replace them entirely.
    if (fareTiers !== undefined) {
      await this.prisma.fareTier.deleteMany({ where: { scheduleId: id } });
    }

    return this.prisma.schedule.update({
      where: { id },
      data: {
        ...rest,
        ...(rotationStartDate !== undefined && {
          rotationStartDate: rotationStartDate ? new Date(rotationStartDate) : null
        }),
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

  async remove(id: string) {
    await this.findOne(id);

    const bookingCount = await this.prisma.booking.count({ where: { trip: { scheduleId: id } } });
    if (bookingCount > 0) {
      return this.prisma.schedule.update({
        where: { id },
        data: { isActive: false },
        include: { route: true, bus: true, fareTiers: true },
      });
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const trips = await tx.trip.findMany({ where: { scheduleId: id }, select: { id: true } });
      const tripIds = trips.map((trip) => trip.id);

      if (tripIds.length > 0) {
        await tx.tripSeat.deleteMany({ where: { tripId: { in: tripIds } } });
        await tx.tripCrew.deleteMany({ where: { tripId: { in: tripIds } } });
        await tx.trip.deleteMany({ where: { id: { in: tripIds } } });
      }

      await tx.fareTier.deleteMany({ where: { scheduleId: id } });
      return tx.schedule.delete({ where: { id } });
    });
  }
}
