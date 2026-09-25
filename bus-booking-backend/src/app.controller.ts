import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Controller('health')
export class AppController {
  @Get()
  check() {
    return { status: 'ok' };
  }

  @Get('seed-schedules')
  async seedSchedules() {
    const prisma = new PrismaClient();
    try {
      const scheduleData = [
        { origin: 'Kathmandu', destination: 'Pokhara', busReg: 'Ga 1 PA 302', time: '06:55', fare: 1600 },
        { origin: 'Kathmandu', destination: 'Pokhara', busReg: 'Ga 1 PA 303', time: '06:55', fare: 1600 },
        // Pokhara -> Kathmandu Sofa Bus (blank bus, assign Ga 1 Pa 159)
        { origin: 'Pokhara', destination: 'Kathmandu', busReg: 'Ga 1 Pa 159', time: '08:00', fare: 1600 },
        // Pokhara -> Kathmandu Sofa Bus (another blank? Wait, assign Ga 1 Pa 160 just in case there are 2 daily)
        { origin: 'Pokhara', destination: 'Kathmandu', busReg: 'Ga 1 Pa 160', time: '08:00', fare: 1600 },
        
        { origin: 'Kathmandu', destination: 'Sauraha', busReg: 'Ba 1 Pa 1711', time: '06:49', fare: 1300 },
        { origin: 'Kathmandu', destination: 'Sauraha', busReg: 'Ba 1 Pa 1712', time: '06:49', fare: 1300 },
        
        { origin: 'Sauraha', destination: 'Kathmandu', busReg: 'Ba 1 Pa 1711', time: '08:00', fare: 1200 },
        { origin: 'Sauraha', destination: 'Kathmandu', busReg: 'Ba 1 Pa 1712', time: '08:00', fare: 1200 },
        
        // Kathmandu - Pokhara Vai Hetauda Sauraha (blank bus, assign 8170)
        { origin: 'Kathmandu', destination: 'Pokhara', busReg: '8170', time: '07:00', fare: 2200 },
        // Pokhara - Kathmandu Vai Sauraha Hetauda (blank bus, assign 2960)
        { origin: 'Pokhara', destination: 'Kathmandu', busReg: '2960', time: '07:00', fare: 2200 },
      ];

      const results = [];
      for (const s of scheduleData) {
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
          // Check if schedule already exists
          const existing = await prisma.schedule.findFirst({
            where: { routeId: route.id, busId: bus.id, departureTime: s.time }
          });

          if (!existing) {
            await prisma.schedule.create({
              data: {
                routeId: route.id,
                busId: bus.id,
                departureTime: s.time,
                fare: s.fare,
                daysOfWeek: [] // Every day
              }
            });
            results.push(`Seeded: ${s.origin}-${s.destination} at ${s.time} via ${s.busReg}`);
          } else {
            results.push(`Already exists: ${s.origin}-${s.destination} at ${s.time} via ${s.busReg}`);
          }
        } else {
          results.push(`Failed: Missing route or bus for ${s.origin}-${s.destination} via ${s.busReg}`);
        }
      }

      return { status: 'seeded_schedules', results };
    } finally {
      await prisma.$disconnect();
    }
  }
}
