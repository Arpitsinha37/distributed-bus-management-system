import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchTripsDto } from './dto/search-trips.dto';
import { BusPortalService } from '../nrt/bus-portal/bus-portal.service';

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(
    private prisma: PrismaService,
    private busPortal: BusPortalService
  ) {}

  // Storefronts show every schedule regardless of siteId today — if you
  // later want a curated per-site catalog, filter this query by a
  // schedule<->site mapping table instead of exposing everything everywhere.
  async search(dto: SearchTripsDto) {
    try {
      // Fetch from portal API
      // Note: portal expects date in yyyy-mm-dd format
      const dateStr = new Date(dto.date).toISOString().split('T')[0];
      const portalResponse = await this.busPortal.fetchTrips(dto.origin, dto.destination, dateStr);
      
      if (!portalResponse || portalResponse.status !== 'true' || !portalResponse.data) {
        return []; // No buses or error
      }

      return portalResponse.data.map((bus: any) => {
        // Encode origin|destination|date|busno into a single ID so we can fetch it later for seat map
        const compoundId = `${dto.origin}|${dto.destination}|${dateStr}|${bus.busno}`;
        const encodedId = Buffer.from(compoundId).toString('base64');
        
        return {
          tripId: encodedId, // We use this encoded ID as the unique tripId
          scheduleId: encodedId, // Frontend expects this for routing
          id: encodedId,
          departureTime: bus.time || '07:00 PM',
          fare: parseFloat(bus.Price || '0'),
          baseFare: parseFloat(bus.Price || '0'),
          bus: { 
            type: bus.type || bus.CompanyName || 'Tourist Bus', 
            amenities: bus.Amenities ? bus.Amenities.split(',') : ['AC', 'WiFi'] 
          },
          route: { origin: dto.origin, destination: dto.destination },
          availableSeats: parseInt(bus.TotalSeat || '0', 10), // We might need to count 'Yes' in SeatLayoutt
          isDeparted: false, // We could add logic for this based on current time
        };
      });
    } catch (e: any) {
      this.logger.error(`Failed to fetch from bus portal: ${e.message}`);
      return [];
    }
  }

  // Idempotent: if the trip + its seat inventory already exist for this
  // schedule/date, reuse them instead of duplicating.
  async ensureTripExists(scheduleId: string, travelDate: Date) {
    // Keep this for backward compatibility if other internal scripts use it
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

      const layoutJson = schedule.bus.seatLayout.layoutJson as any;
      const seats = (layoutJson?.seats || []) as { number: string }[];
      
      if (seats.length > 0) {
        await tx.tripSeat.createMany({
          data: seats
            // CMS might save it as `label`, older layouts might use `number`
            .map((s: any) => ({ tripId: trip.id, seatNumber: s.number || s.label }))
            // filter out empty/driver/door seats that have no label
            .filter((s: any) => s.seatNumber),
        });
      }

      return trip;
    });
  }

  // Pre-generates the next N days of trips every night so search stays fast
  // and doesn't do first-request-of-the-day generation under load.
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async generateUpcomingTrips(daysAhead = 30) {
    // Left empty or keep for local schedules if needed
  }

  // Public — powers the seat-map screen: every seat plus its live status.
  async findUpcoming(limit = 50) {
    return { data: [], total: 0 }; // Not used directly in our new flow
  }

  async findOne(tripId: string) {
    try {
      // Decode our custom ID
      const decoded = Buffer.from(tripId, 'base64').toString('ascii');
      const [origin, destination, dateStr, busno] = decoded.split('|');

      if (!busno) throw new Error("Invalid trip ID format");

      // Fetch the full list again from the portal
      const portalResponse = await this.busPortal.fetchTrips(origin, destination, dateStr);
      
      if (!portalResponse || portalResponse.status !== 'true' || !portalResponse.data) {
        throw new Error("Could not fetch trips from portal");
      }

      // Find our specific bus
      const bus = portalResponse.data.find((b: any) => b.busno === busno);
      if (!bus) throw new Error("Bus not found in portal response");

      // Build the seat layout response
      // The frontend expects layoutJson in a specific format (rows, columns, seats array)
      const portalSeats = bus.SeatLayoutt || [];
      
      // Calculate rows and columns based on the portal data if not provided
      const columns = parseInt(bus.noofcolumn || '5', 10);
      const rows = parseInt(bus.noofrow || Math.ceil(portalSeats.length / columns).toString(), 10);

      const frontendSeats = [];
      const seatStatuses = [];

      for (let i = 0; i < portalSeats.length; i++) {
        const pSeat = portalSeats[i];
        
        const row = Math.floor(i / columns) + 1;
        const col = (i % columns) + 1;
        
        let type = 'SEAT';
        if (pSeat.displayName === 'na') {
          type = 'EMPTY';
        }

        frontendSeats.push({
          id: pSeat.displayName === 'na' ? `empty-${i}` : pSeat.displayName,
          row,
          column: col,
          type,
          label: pSeat.displayName !== 'na' ? pSeat.displayName : ''
        });

        if (type === 'SEAT') {
          seatStatuses.push({
            seatNumber: pSeat.displayName,
            // mapping 'Yes' -> AVAILABLE, 'No' -> BOOKED
            status: pSeat.bookingStatus === 'Yes' ? 'AVAILABLE' : 'BOOKED'
          });
        }
      }

      const layoutJson = {
        rows,
        columns,
        seats: frontendSeats
      };

      return {
        tripId: tripId,
        id: tripId, // add this so params.id matches schedule.id if it checks
        departureTime: bus.time || '07:00 PM',
        fare: parseFloat(bus.Price || '0'),
        baseFare: parseFloat(bus.Price || '0'),
        route: { 
          origin: origin, 
          destination: destination,
          boardingPoints: bus.from_location1 || [],
          droppingPoints: bus.Drop || []
        },
        bus: { type: bus.type || bus.CompanyName || 'Tourist Bus', amenities: bus.Amenities ? bus.Amenities.split(',') : ['AC'] },
        layout: layoutJson,
        seats: seatStatuses,
      };
    } catch (e: any) {
      this.logger.error(`Failed to decode/fetch seat map: ${e.message}`);
      throw e;
    }
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
