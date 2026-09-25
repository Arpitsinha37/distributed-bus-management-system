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
      const ROUTE_PRESETS = [
        {
          originCity: 'Kathmandu', destinationCity: 'Pokhara',
          boarding: ['Sorhakhutte', 'Balaju', 'Swayambhu', 'Bafal Sajha Petrol Pump', 'Kalanki', 'Manakamana', 'Bandipur Dumre'],
          dropping: ['Pokhara', 'Damauli', 'Bandipur Dumre', 'Manakamana'],
          distanceKm: 200, durationMinutes: 390,
        },
        {
          originCity: 'Pokhara', destinationCity: 'Kathmandu',
          boarding: ['Tourist Bus Park', 'Amarsingh Chowk', 'Damauli', 'Bandipur Dumre', 'Manakamana'],
          dropping: ['Sorhakhutte', 'Balaju', 'Kalanki', 'Manakamana', 'Bandipur Dumre'],
          distanceKm: 200, durationMinutes: 390,
        },
        {
          originCity: 'Kathmandu', destinationCity: 'Sauraha',
          boarding: ['Sorhakhutte', 'Balaju', 'Swayambhu', 'Kalanki'],
          dropping: ['Chitwan', 'Paras Bus Park', 'Sauraha'],
          distanceKm: 150, durationMinutes: 330,
        },
        {
          originCity: 'Sauraha', destinationCity: 'Kathmandu',
          boarding: ['Chitwan', 'Sauraha', 'Tadi', 'Paras Bus Park', 'Aptari'],
          dropping: ['Kathmandu'],
          distanceKm: 150, durationMinutes: 330,
        },
        {
          originCity: 'Kathmandu', destinationCity: 'Chitwan',
          boarding: ['Sorhakhutte', 'Balaju', 'Swayambhu', 'Kalanki'],
          dropping: ['Chitwan'],
          distanceKm: 150, durationMinutes: 330,
        },
        {
          originCity: 'Chitwan', destinationCity: 'Kathmandu',
          boarding: ['Chitwan'],
          dropping: ['Sorhakhutte', 'Balaju', 'Kalanki'],
          distanceKm: 150, durationMinutes: 330,
        },
        {
          originCity: 'Kathmandu', destinationCity: 'Lumbini',
          boarding: ['Sorhakhutte', 'Balaju', 'Swayambhu', 'Kalanki'],
          dropping: ['Lumbini', 'Bhairahawa'],
          distanceKm: 280, durationMinutes: 480,
        },
        {
          originCity: 'Lumbini', destinationCity: 'Kathmandu',
          boarding: ['Lumbini', 'Bhairahawa'],
          dropping: ['Sorhakhutte', 'Balaju', 'Kalanki'],
          distanceKm: 280, durationMinutes: 480,
        }
      ];

      for (const preset of ROUTE_PRESETS) {
        const existing = await prisma.route.findFirst({
          where: { 
            originCity: { equals: preset.originCity, mode: 'insensitive' },
            destinationCity: { equals: preset.destinationCity, mode: 'insensitive' }
          }
        });

        if (existing) {
          await prisma.route.update({
            where: { id: existing.id },
            data: {
              boardingPoints: preset.boarding,
              droppingPoints: preset.dropping,
              distanceKm: preset.distanceKm,
              durationMinutes: preset.durationMinutes
            }
          });
        } else {
          await prisma.route.create({
            data: {
              originCity: preset.originCity,
              destinationCity: preset.destinationCity,
              boardingPoints: preset.boarding,
              droppingPoints: preset.dropping,
              distanceKm: preset.distanceKm,
              durationMinutes: preset.durationMinutes
            }
          });
        }
      }

      return { status: 'seeded_routes' };
    } finally {
      await prisma.$disconnect();
    }
  }
}
