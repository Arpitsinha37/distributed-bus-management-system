const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://cms_user:cms_password@localhost:5434/bus_booking?schema=public' } } });

async function main() {
  // Find payments with mock-esewa
  const payments = await prisma.payment.findMany({
    where: { gateway: 'mock-esewa' },
    include: { booking: true }
  });

  for (const p of payments) {
    console.log('Found mock payment:', p.id, 'for booking:', p.bookingId);
    
    // Delete payment
    await prisma.payment.delete({ where: { id: p.id } });
    console.log('Deleted payment', p.id);
    
    // Check if the booking was made just for this test
    if (p.booking && p.booking.customerName === 'Test User') {
       await prisma.passenger.deleteMany({ where: { bookingId: p.booking.id } });
       await prisma.tripSeat.updateMany({
           where: { bookingId: p.booking.id },
           data: { status: 'AVAILABLE', bookingId: null }
       });
       await prisma.booking.delete({ where: { id: p.booking.id } });
       console.log('Deleted test booking', p.booking.id);
    }
  }
}

main();
