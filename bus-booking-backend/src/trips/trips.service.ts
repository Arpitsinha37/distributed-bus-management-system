import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchTripsDto } from './dto/search-trips.dto';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  // Storefronts show every schedule regardless of siteId today — if you
  // later want a curated per-site catalog, filter this query by a
  // schedule<->site mapping table instead of exposing everything everywhere.
  async search(dto: SearchTripsDto) {
    const date = new Date(dto.date);
    const dayOfWeek = date.getUTCDay();

    const schedules = await this.prisma.schedule.findMany({
      where: {
        isActive: true,
        route: { originCity: dto.origin, destinationCity: dto.destination },
        OR: [{ daysOfWeek: { isEmpty: true } }, { daysOfWeek: { has: dayOfWeek } }],
      },
      include: { route: true, bus: { include: { seatLayout: true } } },
    });

    const results = [];
    for (const schedule of schedules) {
      const trip = await this.ensureTripExists(schedule.id, date);
      const seatCounts = await this.prisma.tripSeat.groupBy({
        by: ['status'],
        where: { tripId: trip.id },
        _count: true,
      });
      const available = seatCounts.find((s: { status: string }) => s.status === 'AVAILABLE')?._count ?? 0;

      results.push({
        tripId: trip.id,
        scheduleId: schedule.id,
        departureTime: schedule.departureTime,
        fare: schedule.fare,
        bus: { type: schedule.bus.type, amenities: schedule.bus.amenities },
        route: { origin: schedule.route.originCity, destination: schedule.route.destinationCity },
        availableSeats: available,
      });
    }
    return results;
  }

  // Idempotent: if the trip + its seat inventory already exist for this
  // schedule/date, reuse them instead of duplicating.
  async ensureTripExists(scheduleId: string, travelDate: Date) {
    const existing = await this.prisma.trip.findUnique({
      where: { scheduleId_travelDate: { scheduleId, travelDate } },
    });
    if (existing) return existing;

    const schedule = await this.prisma.schedule.findUniqueOrThrow({
      where: { id: scheduleId },
      include: { bus: { include: { seatLayout: true } } },
    });

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const trip = await tx.trip.create({
        data: { scheduleId, busId: schedule.busId, travelDate },
      });

      const seats = (schedule.bus.seatLayout.layoutJson as any).seats as { number: string }[];
      await tx.tripSeat.createMany({
        data: seats.map((s) => ({ tripId: trip.id, seatNumber: s.number })),
      });

      return trip;
    });
  }

  // Pre-generates the next N days of trips every night so search stays fast
  // and doesn't do first-request-of-the-day generation under load.
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async generateUpcomingTrips(daysAhead = 30) {
    const schedules = await this.prisma.schedule.findMany({ where: { isActive: true } });
    const today = new Date();
    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() + i);
      const dayOfWeek = date.getUTCDay();
      for (const schedule of schedules) {
        if (schedule.daysOfWeek.length === 0 || schedule.daysOfWeek.includes(dayOfWeek)) {
          await this.ensureTripExists(schedule.id, date);
        }
      }
    }
  }

  // Public — powers the seat-map screen: every seat plus its live status.
  async findOne(tripId: string) {
    const trip = await this.prisma.trip.findUniqueOrThrow({
      where: { id: tripId },
      include: {
        schedule: { include: { route: true } },
        bus: { include: { seatLayout: true } },
        seats: { orderBy: { seatNumber: 'asc' } },
      },
    });
    return {
      tripId: trip.id,
      departureTime: trip.schedule.departureTime,
      fare: trip.schedule.fare,
      route: { 
        origin: trip.schedule.route.originCity, 
        destination: trip.schedule.route.destinationCity,
        boardingPoints: trip.schedule.route.boardingPoints,
        droppingPoints: trip.schedule.route.droppingPoints
      },
      bus: { type: trip.bus.type, amenities: trip.bus.amenities },
      layout: trip.bus.seatLayout.layoutJson,
      seats: trip.seats.map((s: { seatNumber: string; status: string }) => ({
        seatNumber: s.seatNumber,
        status: s.status,
      })),
    };
  }

  // ── Trip Crew Management ────────────────────────────────────

  async assignCrew(tripId: string, dto: { crewMemberId: string; role: any }) {
    // Upsert so if they assign a DIFFERENT person to the same role (e.g. driver), it might not override, 
    // but the requirement is simple: just create/link it. Wait, multiple drivers might be allowed.
    // The unique constraint is [tripId, crewMemberId].
    return this.prisma.tripCrew.upsert({
      where: {
        tripId_crewMemberId: {
          tripId,
          crewMemberId: dto.crewMemberId,
        },
      },
      update: { role: dto.role },
      create: { tripId, crewMemberId: dto.crewMemberId, role: dto.role },
    });
  }

  getTripCrew(tripId: string) {
    return this.prisma.tripCrew.findMany({
      where: { tripId },
      include: { crewMember: true },
    });
  }

  removeTripCrew(tripId: string, crewMemberId: string) {
    return this.prisma.tripCrew.delete({
      where: {
        tripId_crewMemberId: { tripId, crewMemberId },
      },
    });
  }
}
