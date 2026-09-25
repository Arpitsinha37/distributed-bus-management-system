import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Controller('health')
export class AppController {
  @Get()
  check() {
    return { status: 'ok' };
  }

  @Get('seed-routes')
  async seedRoutes() {
    const prisma = new PrismaClient();
    try {
      // Kathmandu -> Pokhara
      const ktmPkr = await prisma.route.findFirst({
        where: { originCity: { equals: 'kathmandu', mode: 'insensitive' }, destinationCity: { equals: 'pokhara', mode: 'insensitive' } }
      });
      if (ktmPkr) {
        await prisma.route.update({
          where: { id: ktmPkr.id },
          data: {
            boardingPoints: ['Sorakhutte', 'Balaju', 'Swayambhu', 'Kalanki', 'Thankot'],
            droppingPoints: ['Tourist Bus Park (Rashtriya Bank Chowk)'],
            distanceKm: 200,
            durationMinutes: 480
          }
        });
      } else {
        await prisma.route.create({
          data: {
            originCity: 'Kathmandu',
            destinationCity: 'Pokhara',
            boardingPoints: ['Sorakhutte', 'Balaju', 'Swayambhu', 'Kalanki', 'Thankot'],
            droppingPoints: ['Tourist Bus Park (Rashtriya Bank Chowk)'],
            distanceKm: 200,
            durationMinutes: 480
          }
        });
      }

      // Pokhara -> Kathmandu
      const pkrKtm = await prisma.route.findFirst({
        where: { originCity: { equals: 'pokhara', mode: 'insensitive' }, destinationCity: { equals: 'kathmandu', mode: 'insensitive' } }
      });
      if (pkrKtm) {
        await prisma.route.update({
          where: { id: pkrKtm.id },
          data: {
            boardingPoints: ['Tourist Bus Park (Rashtriya Bank Chowk)'],
            droppingPoints: ['Thankot', 'Kalanki', 'Swayambhu', 'Balaju', 'Sorakhutte'],
            distanceKm: 200,
            durationMinutes: 480
          }
        });
      } else {
        await prisma.route.create({
          data: {
            originCity: 'Pokhara',
            destinationCity: 'Kathmandu',
            boardingPoints: ['Tourist Bus Park (Rashtriya Bank Chowk)'],
            droppingPoints: ['Thankot', 'Kalanki', 'Swayambhu', 'Balaju', 'Sorakhutte'],
            distanceKm: 200,
            durationMinutes: 480
          }
        });
      }
      return { status: 'seeded_routes' };
    } finally {
      await prisma.$disconnect();
    }
  }
}
