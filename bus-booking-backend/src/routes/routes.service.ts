import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateRouteDto) {
    return this.prisma.route.create({ data: dto });
  }

  async findAll() {
    const data = await this.prisma.route.findMany({ orderBy: { createdAt: 'asc' } });
    return { data, total: data.length };
  }

  async findOne(id: string) {
    const route = await this.prisma.route.findUnique({ where: { id } });
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  async update(id: string, dto: Partial<CreateRouteDto>) {
    await this.findOne(id);
    return this.prisma.route.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);

    const bookingCount = await this.prisma.booking.count({
      where: { trip: { schedule: { routeId: id } } },
    });
    if (bookingCount > 0) {
      throw new ConflictException('Cannot delete a route with booking history. Delete or deactivate its schedules instead.');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const schedules = await tx.schedule.findMany({ where: { routeId: id }, select: { id: true } });
      const scheduleIds = schedules.map((schedule) => schedule.id);

      if (scheduleIds.length > 0) {
        const trips = await tx.trip.findMany({
          where: { scheduleId: { in: scheduleIds } },
          select: { id: true },
        });
        const tripIds = trips.map((trip) => trip.id);

        if (tripIds.length > 0) {
          await tx.tripSeat.deleteMany({ where: { tripId: { in: tripIds } } });
          await tx.tripCrew.deleteMany({ where: { tripId: { in: tripIds } } });
          await tx.trip.deleteMany({ where: { id: { in: tripIds } } });
        }

        await tx.fareTier.deleteMany({ where: { scheduleId: { in: scheduleIds } } });
        await tx.schedule.deleteMany({ where: { id: { in: scheduleIds } } });
      }

      return tx.route.delete({ where: { id } });
    });
  }

  // Powers the "which cities can I search?" dropdown on the storefronts.
  async findDistinctCities() {
    const routes = await this.prisma.route.findMany({
      select: { originCity: true, destinationCity: true },
    });
    const cities = new Set<string>();
    routes.forEach((r: { originCity: string; destinationCity: string }) => {
      cities.add(r.originCity);
      cities.add(r.destinationCity);
    });
    return Array.from(cities).sort();
  }
}
