import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { customAlphabet } from 'nanoid';
import { Prisma, BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SeatLockService } from './seat-lock.service';
import { HoldSeatsDto } from './dto/hold-seats.dto';
import { CreateCounterBookingDto } from './dto/create-counter-booking.dto';

const bookingRef = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

@Injectable()
export class BookingsService {
  private holdMinutes = Number(process.env.SEAT_HOLD_MINUTES ?? 8);

  constructor(
    private prisma: PrismaService,
    private seatLock: SeatLockService,
  ) {}

  // Admin-facing paginated list with filters.
  // allowedSiteIds: if non-empty, restrict to those sites (for scoped roles);
  // if empty/undefined, no site restriction (for SUPER_ADMIN).
  async findAll(opts: {
    siteId?: string;
    status?: BookingStatus;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
    allowedSiteIds?: string[];
  }) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {};

    // Role-based scoping: non-super-admins can only see their assigned sites.
    if (opts.allowedSiteIds && opts.allowedSiteIds.length > 0) {
      where.siteId = { in: opts.allowedSiteIds };
    }
    // If they also pass a siteId filter, intersect it with their allowed sites.
    if (opts.siteId) {
      if (opts.allowedSiteIds && opts.allowedSiteIds.length > 0 && !opts.allowedSiteIds.includes(opts.siteId)) {
        // Trying to filter to a site they don't have access to — return empty.
        return { data: [], total: 0, page, limit };
      }
      where.siteId = opts.siteId;
    }
    if (opts.status) where.status = opts.status;
    if (opts.dateFrom || opts.dateTo) {
      where.createdAt = {};
      if (opts.dateFrom) where.createdAt.gte = new Date(opts.dateFrom);
      if (opts.dateTo) where.createdAt.lte = new Date(opts.dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          site: { select: { id: true, name: true, slug: true } },
          trip: { include: { schedule: { include: { route: true } } } },
          passengers: true,
          seats: { select: { seatNumber: true } },
          payment: true,
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // Step 1 of checkout: lock the chosen seats and create a PENDING booking.
  // The frontend then sends the customer to the payment gateway with this
  // booking's id/reference.
  async holdSeats(siteId: string, dto: HoldSeatsDto) {
    const holderId = `hold:${Date.now()}:${Math.random().toString(36).slice(2)}`;

    const acquired: string[] = [];
    for (const seatNumber of dto.seatNumbers) {
      const ok = await this.seatLock.acquire(dto.tripId, seatNumber, holderId);
      if (!ok) {
        await Promise.all(acquired.map((s) => this.seatLock.release(dto.tripId, s, holderId)));
        throw new ConflictException(`Seat ${seatNumber} was just taken — pick another seat`);
      }
      acquired.push(seatNumber);
    }

    try {
      return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const heldUntil = new Date(Date.now() + this.holdMinutes * 60_000);

        // Guarded by status: AVAILABLE — if another request already flipped
        // these rows (shouldn't happen given the Redis lock above, but this
        // is the real correctness backstop), the count will be short and we
        // roll back instead of overselling.
        const updateResult = await tx.tripSeat.updateMany({
          where: { tripId: dto.tripId, seatNumber: { in: dto.seatNumbers }, status: 'AVAILABLE' },
          data: { status: 'HELD', heldUntil },
        });
        if (updateResult.count !== dto.seatNumbers.length) {
          throw new ConflictException('One or more selected seats are no longer available');
        }

        const trip = await tx.trip.findUniqueOrThrow({
          where: { id: dto.tripId },
          include: { schedule: { include: { fareTiers: true } } },
        });

        // Simple default total fare. We aren't doing complex fare calculations during hold yet
        // since the frontend might not pass seat types. We'll use the base fare for now.
        // In a real system, the frontend would pass the full calculate-fare result or seats array.
        const totalFare = Number(trip.schedule.fare) * dto.seatNumbers.length;

        const booking = await tx.booking.create({
          data: {
            bookingRef: bookingRef(),
            siteId,
            tripId: dto.tripId,
            customerName: dto.customerName,
            customerPhone: dto.customerPhone,
            customerEmail: dto.customerEmail,
            totalFare,
            status: 'PENDING',
            passengers: { create: dto.passengers },
          },
        });

        await tx.tripSeat.updateMany({
          where: { tripId: dto.tripId, seatNumber: { in: dto.seatNumbers } },
          data: { bookingId: booking.id },
        });

        return { ...booking, heldUntil };
      });
    } catch (err) {
      await Promise.all(acquired.map((s) => this.seatLock.release(dto.tripId, s, holderId)));
      throw err;
    }
  }

  async calculateFare(dto: { scheduleId: string; seats: { number: string; type: string }[]; boardingPoint?: string; couponCode?: string }) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: dto.scheduleId },
      include: { fareTiers: true },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    let totalBaseFare = 0;
    const seatBreakdown = [];

    for (const seat of dto.seats) {
      // Find a matching fare tier for this seat type and boarding point
      const specificTier = schedule.fareTiers.find(t => t.seatType === seat.type && t.boardingPoint === dto.boardingPoint);
      const generalTier = schedule.fareTiers.find(t => t.seatType === seat.type && !t.boardingPoint);
      
      const appliedFare = specificTier ? Number(specificTier.amount) : (generalTier ? Number(generalTier.amount) : Number(schedule.fare));
      totalBaseFare += appliedFare;
      seatBreakdown.push({ seatNumber: seat.number, seatType: seat.type, fare: appliedFare });
    }

    let discount = 0;
    let couponApplied = null;

    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code: dto.couponCode } });
      if (coupon && coupon.isActive && coupon.validFrom <= new Date() && coupon.validTo >= new Date()) {
        if (!coupon.minBookingAmount || totalBaseFare >= Number(coupon.minBookingAmount)) {
          if (coupon.discountType === 'PERCENTAGE') {
            discount = totalBaseFare * (Number(coupon.discountValue) / 100);
          } else {
            discount = Number(coupon.discountValue);
          }
          couponApplied = coupon.code;
        }
      }
    }

    const finalFare = Math.max(0, totalBaseFare - discount);

    return {
      totalBaseFare,
      discount,
      finalFare,
      couponApplied,
      seatBreakdown,
    };
  }

  // Called by the payments module once the gateway confirms money moved.
  // Must be safe to call twice for the same booking (see payments.service).
  async confirmBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === 'CONFIRMED') return booking; // idempotent no-op

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.tripSeat.updateMany({
        where: { bookingId },
        data: { status: 'BOOKED', heldUntil: null },
      });
      return tx.booking.update({ where: { id: bookingId }, data: { status: 'CONFIRMED' } });
    });
  }

  // Public-safe read for the confirmation page — booking ids are
  // unguessable cuids, but for a customer-lookup-by-ref flow later, gate
  // this behind bookingRef + phone instead of raw id.
  async findOne(bookingIdOrRef: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [
          { id: bookingIdOrRef },
          { bookingRef: bookingIdOrRef }
        ]
      },
      include: {
        seats: { select: { seatNumber: true } },
        trip: { include: { schedule: { include: { route: true } } } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async trackBooking(bookingRef: string, phone: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        bookingRef,
        customerPhone: phone
      }
    });
    if (!booking) throw new NotFoundException('Booking not found with this PNR and phone number');
    // Return the ID so the frontend can redirect to the ticket page
    return { id: booking.id, bookingRef: booking.bookingRef };
  }

  async cancelBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { trip: { include: { schedule: true } } }
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const depTimeParts = booking.trip.schedule.departureTime.split(':');
    const exactDeparture = new Date(booking.trip.travelDate);
    exactDeparture.setHours(Number(depTimeParts[0]), Number(depTimeParts[1]), 0);
    const hoursUntilDeparture = (exactDeparture.getTime() - Date.now()) / (1000 * 60 * 60);

    const policies = await this.prisma.cancellationPolicy.findMany({
      orderBy: { hoursBeforeDep: 'desc' }
    });

    let refundPercent = 0;
    for (const policy of policies) {
      if (hoursUntilDeparture >= policy.hoursBeforeDep) {
        refundPercent = policy.refundPercent;
        break;
      }
    }

    const refundAmount = Number(booking.totalFare) * (refundPercent / 100);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.tripSeat.updateMany({
        where: { bookingId },
        data: { status: 'AVAILABLE', heldUntil: null, bookingId: null },
      });
      const updatedBooking = await tx.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } });

      if (refundAmount > 0) {
        await tx.payment.updateMany({
          where: { bookingId, status: 'SUCCESS' },
          data: { status: 'REFUNDED' }
        });
      }
      
      return { booking: updatedBooking, refundAmount, refundPercent };
    });
  }

  async createCounterBooking(siteId: string, dto: CreateCounterBookingDto) {
    const holderId = `counter:${Date.now()}:${Math.random().toString(36).slice(2)}`;

    const acquired: string[] = [];
    for (const seat of dto.seats) {
      const ok = await this.seatLock.acquire(dto.tripId, seat.number, holderId);
      if (!ok) {
        await Promise.all(acquired.map((s) => this.seatLock.release(dto.tripId, s, holderId)));
        throw new ConflictException(`Seat ${seat.number} was just taken — pick another seat`);
      }
      acquired.push(seat.number);
    }

    try {
      return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Calculate fare
        const fareCalculation = await this.calculateFare({
          scheduleId: dto.scheduleId,
          seats: dto.seats,
          boardingPoint: dto.boardingPoint,
        });

        // Auto-create or fetch customer
        let customer = await tx.customer.findUnique({ where: { phone: dto.customerPhone } });
        if (!customer) {
          customer = await tx.customer.create({
            data: {
              name: dto.customerName,
              phone: dto.customerPhone,
              email: dto.customerEmail,
            }
          });
        } else if (dto.customerEmail && !customer.email) {
           await tx.customer.update({
             where: { id: customer.id },
             data: { email: dto.customerEmail }
           });
        }

        const booking = await tx.booking.create({
          data: {
            bookingRef: bookingRef(),
            siteId,
            tripId: dto.tripId,
            customerId: customer.id,
            customerName: dto.customerName,
            customerPhone: dto.customerPhone,
            customerEmail: dto.customerEmail,
            totalFare: fareCalculation.finalFare,
            status: 'CONFIRMED',
            passengers: { create: dto.passengers },
          },
        });

        await tx.tripSeat.updateMany({
          where: { tripId: dto.tripId, seatNumber: { in: acquired } },
          data: { status: 'BOOKED', bookingId: booking.id, heldUntil: null },
        });

        // Record payment
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            gateway: dto.paymentMethod,
            amount: fareCalculation.finalFare,
            status: 'SUCCESS',
            gatewayTxnId: `CTX-${Date.now()}`
          }
        });

        // Mock SMS Delivery
        console.log(`\n\n🎫 NEW ROAD TRAVELS\nBooking: ${booking.bookingRef}\n💰 Total: NPR ${fareCalculation.finalFare}\nShow this SMS at boarding.\n\n`);

        return booking;
      });
    } catch (err) {
      await Promise.all(acquired.map((s) => this.seatLock.release(dto.tripId, s, holderId)));
      throw err;
    }
  }

  // Frees seats from abandoned checkouts — someone held seats and never
  // paid. Runs frequently since holds are short (minutes, not hours).
  @Cron(CronExpression.EVERY_MINUTE)
  async releaseExpiredHolds() {
    const expired = await this.prisma.booking.findMany({
      where: { status: 'PENDING', trip: { seats: { some: { heldUntil: { lt: new Date() } } } } },
      select: { id: true },
    });
    for (const { id } of expired) {
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.tripSeat.updateMany({
          where: { bookingId: id },
          data: { status: 'AVAILABLE', heldUntil: null, bookingId: null },
        });
        await tx.booking.update({ where: { id }, data: { status: 'EXPIRED' } });
      });
    }
  }
}
