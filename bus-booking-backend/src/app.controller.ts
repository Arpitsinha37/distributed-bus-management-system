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
      const SET_A = [1, 3, 5]; // Mon, Wed, Fri
      const SET_B = [0, 2, 4, 6]; // Sun, Tue, Thu, Sat

      const schedules = [
        // Pair 1: 302 and 159
        { origin: 'Kathmandu', destination: 'Pokhara', busReg: 'Ga 1 PA 302', time: '06:55', fare: 1600, days: SET_A },
        { origin: 'Pokhara', destination: 'Kathmandu', busReg: 'Ga 1 PA 302', time: '08:00', fare: 1600, days: SET_B },
        { origin: 'Kathmandu', destination: 'Pokhara', busReg: 'Ga 1 Pa 159', time: '06:55', fare: 1600, days: SET_B },
        { origin: 'Pokhara', destination: 'Kathmandu', busReg: 'Ga 1 Pa 159', time: '08:00', fare: 1600, days: SET_A },

        // Pair 2: 303 and 160
        { origin: 'Kathmandu', destination: 'Pokhara', busReg: 'Ga 1 PA 303', time: '06:55', fare: 1600, days: SET_A },
        { origin: 'Pokhara', destination: 'Kathmandu', busReg: 'Ga 1 PA 303', time: '08:00', fare: 1600, days: SET_B },
        { origin: 'Kathmandu', destination: 'Pokhara', busReg: 'Ga 1 Pa 160', time: '06:55', fare: 1600, days: SET_B },
        { origin: 'Pokhara', destination: 'Kathmandu', busReg: 'Ga 1 Pa 160', time: '08:00', fare: 1600, days: SET_A },

        // Pair 3: 1711 and 1712
        { origin: 'Kathmandu', destination: 'Sauraha', busReg: 'Ba 1 Pa 1711', time: '06:49', fare: 1300, days: SET_A },
        { origin: 'Sauraha', destination: 'Kathmandu', busReg: 'Ba 1 Pa 1711', time: '08:00', fare: 1200, days: SET_B },
        { origin: 'Kathmandu', destination: 'Sauraha', busReg: 'Ba 1 Pa 1712', time: '06:49', fare: 1300, days: SET_B },
        { origin: 'Sauraha', destination: 'Kathmandu', busReg: 'Ba 1 Pa 1712', time: '08:00', fare: 1200, days: SET_A },

        // Pair 4: 8170 and 2960 (Ktm-Pkr via Hetauda)
        { origin: 'Kathmandu', destination: 'Pokhara', busReg: '8170', time: '07:00', fare: 2200, days: SET_A },
        { origin: 'Pokhara', destination: 'Kathmandu', busReg: '8170', time: '07:00', fare: 2200, days: SET_B },
        { origin: 'Kathmandu', destination: 'Pokhara', busReg: '2960', time: '07:00', fare: 2200, days: SET_B },
        { origin: 'Pokhara', destination: 'Kathmandu', busReg: '2960', time: '07:00', fare: 2200, days: SET_A },
      ];

      const results = [];
      for (const s of schedules) {
        // Find Route
        const route = await prisma.route.findFirst({
          where: { 
            originCity: { equals: s.origin, mode: 'insensitive' },
            destinationCity: { equals: s.destination, mode: 'insensitive' }
          }
        });

        // Find Bus
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
               data: { daysOfWeek: s.days, departureTime: s.time, fare: s.fare }
             });
             results.push(`Updated: ${s.origin}-${s.destination} at ${s.time} via ${s.busReg}`);
          } else {
             await prisma.schedule.create({
               data: {
                 routeId: route.id,
                 busId: bus.id,
                 departureTime: s.time,
                 fare: s.fare,
                 daysOfWeek: s.days
               }
             });
             results.push(`Created: ${s.origin}-${s.destination} at ${s.time} via ${s.busReg}`);
          }
        } else {
          results.push(`Failed: Missing route or bus for ${s.origin}-${s.destination} via ${s.busReg}`);
        }
      }

      return { status: 'seeded_alternate', results };
    } finally {
      await prisma.$disconnect();
    }
  }
}
