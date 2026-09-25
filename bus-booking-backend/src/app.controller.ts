import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Controller('health')
export class AppController {
  @Get()
  check() {
    return { status: 'ok' };
  }

  @Get('seed-buses')
  async seedBuses() {
    const prisma = new PrismaClient();
    try {
      const busData = [
        { registrationNo: 'Ga 1 PA 302', driverName: '', driverContact: '', route: 'Kathmandu', gps: true },
        { registrationNo: 'Ga 1 PA 303', driverName: '', driverContact: '', route: 'Pokhara', gps: true },
        { registrationNo: 'Ga 1 Pa 159', driverName: 'Pokhara', driverContact: '9856026730', route: 'Pokhara', gps: false },
        { registrationNo: 'Ga 1 Pa 160', driverName: 'Bishow Raj Acharya', driverContact: '9856026731', route: 'Kathmandu', gps: false },
        { registrationNo: '8170', driverName: 'Phadindra Khanal', driverContact: '9851159715', route: 'Kathmandu', gps: false },
        { registrationNo: '2960', driverName: 'Rohan xchetri', driverContact: '9840250892', route: 'Kathmandu', gps: false },
        { registrationNo: 'No bus', driverName: '', driverContact: '', route: 'Kathmandu', gps: false },
        { registrationNo: 'Ba 1 Pa 1711', driverName: '', driverContact: '', route: 'Kathmandu', gps: false },
        { registrationNo: 'Ba 1 Pa 1712', driverName: '', driverContact: '', route: 'Kathmandu', gps: false },
      ];

      let layout = await prisma.seatLayout.findFirst();
      if (!layout) {
        layout = await prisma.seatLayout.create({
          data: {
            name: 'Default 2x2',
            totalSeats: 35,
            layoutJson: { rows: [] }
          }
        });
      }

      const results = [];
      for (const bus of busData) {
        const existingBus = await prisma.bus.findUnique({
          where: { registrationNo: bus.registrationNo }
        });

        if (!existingBus) {
          await prisma.bus.create({
            data: {
              registrationNo: bus.registrationNo,
              type: 'Tourist',
              seatLayoutId: layout.id,
              amenities: bus.gps ? ['GPS'] : [],
              ownerName: bus.driverName,
              ownerPhone: bus.driverContact,
            }
          });
          results.push(`Created bus ${bus.registrationNo}`);
        }

        if (bus.driverName || bus.driverContact) {
          const existingCrew = await prisma.crewMember.findFirst({
            where: { phone: bus.driverContact || '0000000000' }
          });
          
          if (!existingCrew && bus.driverContact) {
            await prisma.crewMember.create({
              data: {
                name: bus.driverName || 'Unknown',
                phone: bus.driverContact,
                role: 'DRIVER'
              }
            });
            results.push(`Created driver ${bus.driverName}`);
          }
        }
      }
      return { status: 'seeded', results };
    } finally {
      await prisma.$disconnect();
    }
  }
}
