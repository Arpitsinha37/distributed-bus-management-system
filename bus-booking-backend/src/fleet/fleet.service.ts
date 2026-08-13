import { Injectable, NotFoundException } from '@nestjs/common';
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

  // ── Buses ────────────────────────────────────────────────────

  createBus(dto: CreateBusDto) {
    return this.prisma.bus.create({ data: dto });
  }

  async findAllBuses() {
    const data = await this.prisma.bus.findMany({
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

