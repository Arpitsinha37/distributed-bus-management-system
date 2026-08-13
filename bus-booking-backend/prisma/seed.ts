import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // One super-admin, one storefront, one bus/route/schedule — enough to
  // hit /trips/search and /bookings/hold end to end.
  const passwordHash = await bcrypt.hash('changeme123', 10);
  await prisma.staff.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { name: 'Super Admin', email: 'admin@example.com', passwordHash, role: 'SUPER_ADMIN' },
  });

  const site = await prisma.site.upsert({
    where: { slug: 'site-a' },
    update: {},
    create: { slug: 'site-a', name: 'Storefront A', domain: 'site-a.example.com', currency: 'NPR' },
  });

  // Using findFirst + create for these since they don't have simple unique constraints
  let seatLayout = await prisma.seatLayout.findFirst({ where: { name: '32-seat 2x2' } });
  if (!seatLayout) {
    seatLayout = await prisma.seatLayout.create({
      data: {
        name: '32-seat 2x2',
        totalSeats: 32,
        layoutJson: {
          seats: Array.from({ length: 32 }, (_, i) => ({
            number: `${String.fromCharCode(65 + Math.floor(i / 4))}${(i % 4) + 1}`,
            type: i % 4 === 0 || i % 4 === 3 ? 'window' : 'aisle',
          })),
        },
      },
    });
  }

  let bus = await prisma.bus.findUnique({ where: { registrationNo: 'BA-1-KHA-1234' } });
  if (!bus) {
    bus = await prisma.bus.create({
      data: {
        registrationNo: 'BA-1-KHA-1234',
        type: 'AC Deluxe',
        amenities: ['wifi', 'charging'],
        seatLayoutId: seatLayout.id,
      },
    });
  }

  let route = await prisma.route.findFirst({ where: { originCity: 'Kathmandu', destinationCity: 'Pokhara' } });
  if (!route) {
    route = await prisma.route.create({
      data: {
        originCity: 'Kathmandu',
        destinationCity: 'Pokhara',
        durationMinutes: 360,
        boardingPoints: ['New Buspark'],
        droppingPoints: ['Prithvi Chowk'],
      },
    });
  }

  let schedule = await prisma.schedule.findFirst({ where: { routeId: route.id, busId: bus.id, departureTime: '07:00' } });
  if (!schedule) {
    await prisma.schedule.create({
      data: { routeId: route.id, busId: bus.id, departureTime: '07:00', daysOfWeek: [], fare: 1500 },
    });
  }

  console.log(`Seeded. Site slug: ${site.slug} / login: admin@example.com / changeme123`);
}

main().finally(() => prisma.$disconnect());
