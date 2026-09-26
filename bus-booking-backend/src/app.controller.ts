import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Controller('health')
export class AppController {
  @Get()
  check() {
    return { status: 'ok' };
  }

  @Get('seed-schedules-alternate')
  async seedSchedulesAlternate() {
    const prisma = new PrismaClient();
    try {
      const ROTATION_START = new Date('2024-09-28T00:00:00Z');

      const schedules = [
        // Pair 1: 302 and 159
        { origin: 'Kathmandu', destination: 'Pokhara', busReg: 'Ga 1 PA 302', time: '06:55', fare: 1600, rotationDays: 2, offset: 0 },
        { origin: 'Pokhara', destination: 'Kathmandu', busReg: 'Ga 1 PA 302', time: '08:00', fare: 1600, rotationDays: 2, offset: 1 },
        { origin: 'Kathmandu', destination: 'Pokhara', busReg: 'Ga 1 Pa 159', time: '06:55', fare: 1600, rotationDays: 2, offset: 1 },
        { origin: 'Pokhara', destination: 'Kathmandu', busReg: 'Ga 1 Pa 159', time: '08:00', fare: 1600, rotationDays: 2, offset: 0 },

        // Pair 2: 303 and 160
        { origin: 'Kathmandu', destination: 'Pokhara', busReg: 'Ga 1 PA 303', time: '06:55', fare: 1600, rotationDays: 2, offset: 0 },
        { origin: 'Pokhara', destination: 'Kathmandu', busReg: 'Ga 1 PA 303', time: '08:00', fare: 1600, rotationDays: 2, offset: 1 },
        { origin: 'Kathmandu', destination: 'Pokhara', busReg: 'Ga 1 Pa 160', time: '06:55', fare: 1600, rotationDays: 2, offset: 1 },
        { origin: 'Pokhara', destination: 'Kathmandu', busReg: 'Ga 1 Pa 160', time: '08:00', fare: 1600, rotationDays: 2, offset: 0 },

        // Pair 3: 1711 and 1712
        { origin: 'Kathmandu', destination: 'Sauraha', busReg: 'Ba 1 Pa 1711', time: '06:49', fare: 1300, rotationDays: 2, offset: 0 },
        { origin: 'Sauraha', destination: 'Kathmandu', busReg: 'Ba 1 Pa 1711', time: '08:00', fare: 1200, rotationDays: 2, offset: 1 },
        { origin: 'Kathmandu', destination: 'Sauraha', busReg: 'Ba 1 Pa 1712', time: '06:49', fare: 1300, rotationDays: 2, offset: 1 },
        { origin: 'Sauraha', destination: 'Kathmandu', busReg: 'Ba 1 Pa 1712', time: '08:00', fare: 1200, rotationDays: 2, offset: 0 },

        // Pair 4: 8170 and 2960 (Ktm-Pkr via Hetauda)
        { origin: 'Kathmandu', destination: 'Pokhara', busReg: '8170', time: '07:00', fare: 2200, rotationDays: 2, offset: 0 },
        { origin: 'Pokhara', destination: 'Kathmandu', busReg: '8170', time: '07:00', fare: 2200, rotationDays: 2, offset: 1 },
        { origin: 'Kathmandu', destination: 'Pokhara', busReg: '2960', time: '07:00', fare: 2200, rotationDays: 2, offset: 1 },
        { origin: 'Pokhara', destination: 'Kathmandu', busReg: '2960', time: '07:00', fare: 2200, rotationDays: 2, offset: 0 },
      ];

      const results = [];
      for (const s of schedules) {
        const route = await prisma.route.findFirst({
          where: { 
            originCity: { equals: s.origin, mode: 'insensitive' },
            destinationCity: { equals: s.destination, mode: 'insensitive' }
          }
        });
        const bus = await prisma.bus.findFirst({
          where: { registrationNo: { equals: s.busReg, mode: 'insensitive' } }
        });

        if (route && bus) {
          const existing = await prisma.schedule.findFirst({
            where: { routeId: route.id, busId: bus.id }
          });
          if (existing) {
             await prisma.schedule.update({
               where: { id: existing.id },
               data: { daysOfWeek: [], rotationDays: s.rotationDays, rotationStartDate: ROTATION_START, rotationOffset: s.offset }
             });
             results.push(`Updated: ${s.origin}-${s.destination} via ${s.busReg}`);
          } else {
             await prisma.schedule.create({
               data: {
                 routeId: route.id, busId: bus.id, departureTime: s.time, fare: s.fare,
                 daysOfWeek: [], rotationDays: s.rotationDays, rotationStartDate: ROTATION_START, rotationOffset: s.offset
               }
             });
             results.push(`Created: ${s.origin}-${s.destination} via ${s.busReg}`);
          }
        }
      }
      return { status: 'seeded_alternate', results };
    } finally {
      await prisma.$disconnect();
    }
  }
}
