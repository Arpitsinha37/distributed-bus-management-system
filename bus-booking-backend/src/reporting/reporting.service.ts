import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  async revenueBySite(opts: {
    siteId?: string;
    dateFrom?: string;
    dateTo?: string;
    allowedSiteIds?: string[];
  }) {
    const where: Prisma.BookingWhereInput = { status: 'CONFIRMED' };

    // Role-based scoping
    if (opts.allowedSiteIds && opts.allowedSiteIds.length > 0) {
      where.siteId = { in: opts.allowedSiteIds };
    }
    if (opts.siteId) {
      if (opts.allowedSiteIds && opts.allowedSiteIds.length > 0 && !opts.allowedSiteIds.includes(opts.siteId)) {
        return [];
      }
      where.siteId = opts.siteId;
    }
    if (opts.dateFrom || opts.dateTo) {
      where.createdAt = {};
      if (opts.dateFrom) where.createdAt.gte = new Date(opts.dateFrom);
      if (opts.dateTo) where.createdAt.lte = new Date(opts.dateTo);
    }

    return this.prisma.booking.groupBy({
      by: ['siteId'],
      where,
      _sum: { totalFare: true },
      _count: true,
    });
  }

  async getOverview(opts: { siteId?: string; allowedSiteIds?: string[] }) {
    const where: Prisma.BookingWhereInput = { status: 'CONFIRMED' };
    
    if (opts.allowedSiteIds && opts.allowedSiteIds.length > 0) {
      where.siteId = { in: opts.allowedSiteIds };
    }
    if (opts.siteId) {
      if (opts.allowedSiteIds && opts.allowedSiteIds.length > 0 && !opts.allowedSiteIds.includes(opts.siteId)) {
        return { error: 'Unauthorized site access' };
      }
      where.siteId = opts.siteId;
    }

    // Today's date logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalBookings,
      totalRevenue,
      todayBookings,
      todayRevenue,
      recentBookings,
      totalCustomers
    ] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.aggregate({ where, _sum: { totalFare: true } }),
      this.prisma.booking.count({ where: { ...where, createdAt: { gte: today } } }),
      this.prisma.booking.aggregate({ where: { ...where, createdAt: { gte: today } }, _sum: { totalFare: true } }),
      this.prisma.booking.findMany({ where, orderBy: { createdAt: 'desc' }, take: 5, include: { trip: { include: { schedule: { include: { route: true } } } } } }),
      this.prisma.customer.count() // global for now
    ]);

    // Revenue by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyData = await this.prisma.booking.groupBy({
      by: ['createdAt'], // GroupBy day isn't perfectly supported out of box for SQLite/Postgres cleanly without raw, but Prisma handles Date fields roughly. Let's do raw or simple fetch and group in JS.
      where: { ...where, createdAt: { gte: sevenDaysAgo } },
      _sum: { totalFare: true },
    });
    
    // JS grouping for daily revenue
    const dailyMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyMap.set(d.toISOString().split('T')[0], 0);
    }
    
    const allRecent = await this.prisma.booking.findMany({
        where: { ...where, createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, totalFare: true }
    });
    
    for (const b of allRecent) {
        const dateKey = b.createdAt.toISOString().split('T')[0];
        if (dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, dailyMap.get(dateKey)! + Number(b.totalFare));
        }
    }
    
    const revenueByDay = Array.from(dailyMap.entries()).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalBookings,
      totalRevenue: totalRevenue._sum.totalFare || 0,
      todayBookings,
      todayRevenue: todayRevenue._sum.totalFare || 0,
      totalCustomers,
      recentBookings: recentBookings.map(b => ({
          id: b.id,
          ref: b.bookingRef,
          customer: b.customerName,
          route: `${b.trip.schedule.route.originCity} - ${b.trip.schedule.route.destinationCity}`,
          amount: Number(b.totalFare),
          date: b.createdAt
      })),
      revenueByDay
    };
  }
}

