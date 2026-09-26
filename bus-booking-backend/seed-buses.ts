import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

async function main() {
  console.log('Fetching seat layout...');
  let layout = await prisma.seatLayout.findFirst();
  if (!layout) {
    console.log('No seat layout found, creating a default one...');
    layout = await prisma.seatLayout.create({
      data: {
        name: 'Default 2x2',
        totalSeats: 35,
        layoutJson: { rows: [] }
      }
    });
  }

  for (const bus of busData) {
    console.log(`Processing bus: ${bus.registrationNo}`);
    
    // Create the Bus record
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
          ownerName: bus.driverName, // Hacking driverName into ownerName just so it exists somewhere if they want it
          ownerPhone: bus.driverContact,
        }
      });
      console.log(`Created bus ${bus.registrationNo}`);
    } else {
      console.log(`Bus ${bus.registrationNo} already exists, skipping.`);
    }

    // Optionally create the CrewMember
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
        console.log(`Created driver ${bus.driverName}`);
      }
    }
  }

  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
