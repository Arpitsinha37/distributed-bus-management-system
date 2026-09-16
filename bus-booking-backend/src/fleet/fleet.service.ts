import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeatLayoutDto } from './dto/create-seat-layout.dto';
import { CreateBusDto } from './dto/create-bus.dto';

@Injectable()
export class FleetService {
  constructor(private prisma: PrismaService) {}

  // ── Seat Layouts ─────────────────────────────────────────────

  createSeatLayout(dto: CreateSeatLayoutDto) {
    return this.prisma.seatLayout.create({ data: dto });
  }

  async findAllSeatLayouts() {
    const data = await this.prisma.seatLayout.findMany({ orderBy: { createdAt: 'asc' } });
    return { data, total: data.length };
  }

  async findOneSeatLayout(id: string) {
    const layout = await this.prisma.seatLayout.findUnique({ where: { id } });
    if (!layout) throw new NotFoundException('Seat layout not found');
    return layout;
  }

  async updateSeatLayout(id: string, dto: Partial<CreateSeatLayoutDto>) {
    await this.findOneSeatLayout(id);
    return this.prisma.seatLayout.update({ where: { id }, data: dto });
  }

  async deleteSeatLayout(id: string) {
    await this.findOneSeatLayout(id);
    const busCount = await this.prisma.bus.count({ where: { seatLayoutId: id } });
    if (busCount > 0) {
      throw new ConflictException('Cannot delete a seat layout while buses are using it.');
    }
    return this.prisma.seatLayout.delete({ where: { id } });
  }

  // ── Buses ────────────────────────────────────────────────────

  createBus(dto: CreateBusDto) {
    return this.prisma.bus.create({ data: dto });
  }

  async findAllBuses() {
    const data = await this.prisma.bus.findMany({
      where: { isActive: true },
      include: { seatLayout: true },
      orderBy: { createdAt: 'asc' },
    });
    return { data, total: data.length };
  }

  async findOneBus(id: string) {
    const bus = await this.prisma.bus.findUnique({
      where: { id },
      include: { seatLayout: true },
    });
    if (!bus) throw new NotFoundException('Bus not found');
    return bus;
  }

  async updateBus(id: string, dto: Partial<CreateBusDto>) {
    await this.findOneBus(id);
    return this.prisma.bus.update({
      where: { id },
      data: dto,
      include: { seatLayout: true },
    });
  }

  async deleteBus(id: string) {
    await this.findOneBus(id);

    const bookingCount = await this.prisma.booking.count({ where: { trip: { busId: id } } });
    if (bookingCount > 0) {
      await this.prisma.schedule.updateMany({ where: { busId: id }, data: { isActive: false } });
      return this.prisma.bus.update({ where: { id }, data: { isActive: false } });
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const schedules = await tx.schedule.findMany({ where: { busId: id }, select: { id: true } });
      const scheduleIds = schedules.map((schedule) => schedule.id);
      const trips = await tx.trip.findMany({ where: { busId: id }, select: { id: true } });
      const tripIds = trips.map((trip) => trip.id);

      if (tripIds.length > 0) {
        await tx.tripSeat.deleteMany({ where: { tripId: { in: tripIds } } });
        await tx.tripCrew.deleteMany({ where: { tripId: { in: tripIds } } });
        await tx.trip.deleteMany({ where: { id: { in: tripIds } } });
      }

      if (scheduleIds.length > 0) {
        await tx.fareTier.deleteMany({ where: { scheduleId: { in: scheduleIds } } });
        await tx.schedule.deleteMany({ where: { id: { in: scheduleIds } } });
      }

      return tx.bus.delete({ where: { id } });
    });
  }

  async getExpiringDocuments() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const now = new Date();

    const data = await this.prisma.bus.findMany({
      where: {
        OR: [
          { insuranceExpiry: { lte: thirtyDaysFromNow, gte: now } },
          { fitnessExpiry: { lte: thirtyDaysFromNow, gte: now } },
          { permitExpiry: { lte: thirtyDaysFromNow, gte: now } },
        ],
        isActive: true,
      },
      select: {
        id: true,
        registrationNo: true,
        insuranceExpiry: true,
        fitnessExpiry: true,
        permitExpiry: true,
      },
    });

    return { data, total: data.length };
  }
}
