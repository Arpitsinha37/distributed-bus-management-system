const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');


async function run() {
  const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://cms_user:cms_password@localhost:5434/bus_booking?schema=public' } } });
  const staff = await prisma.staff.findFirst({ where: { role: 'SUPER_ADMIN' } });
  const site = await prisma.site.findFirst();
  
  // Create token
  const token = jwt.sign(
    { sub: staff.id, role: staff.role, email: staff.email, siteIds: [] },
    'super-secret-jwt-key-change-in-production',
    { expiresIn: '8h' }
  );
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Site-Id': site.slug
  };

  try {
    // 1. Initial Analytics
    let res = await fetch('http://localhost:3001/api/v1/reporting/overview', { headers });
    const analyticsBefore = await res.json();
    console.log("[Analytics] Revenue before:", analyticsBefore.revenue);
    console.log("[Analytics] Bookings before:", analyticsBefore.totalBookings);

    // 2. Find an available seat
    const seat = await prisma.tripSeat.findFirst({
      where: { status: 'AVAILABLE' },
      include: { trip: { include: { schedule: true } } }
    });
    
    if (!seat) {
      console.log("No available seats found in DB!");
      return;
    }

    // 3. Counter Booking
    const payload = {
      tripId: seat.tripId,
      scheduleId: seat.trip.scheduleId,
      seats: [{ number: seat.seatNumber, type: 'standard' }],
      customerName: 'Roundtrip Test',
      customerPhone: '9999999999',
      customerEmail: 'test@example.com',
      passengers: [{ name: 'Roundtrip Test', seatNumber: seat.seatNumber }],
      paymentMethod: 'CASH'
    };
    
    console.log(`[Booking] Attempting to book seat ${seat.seatNumber} on trip ${seat.tripId}`);
    res = await fetch('http://localhost:3001/api/v1/bookings/counter', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const bookingRes = await res.json();
    if (res.status !== 201) {
        console.log("[Booking] Failed!", bookingRes);
        return;
    }
    console.log("[Booking] Success! ID:", bookingRes.id);

    // 4. Verify in Bookings list
    res = await fetch('http://localhost:3001/api/v1/bookings?limit=50', { headers });
    const bookingsList = await res.json();
    const foundBooking = bookingsList.data.find(b => b.id === bookingRes.id);
    console.log("[Bookings List] Found new booking?", !!foundBooking);

    // 5. Verify Analytics changed
    res = await fetch('http://localhost:3001/api/v1/reporting/overview', { headers });
    const analyticsAfter = await res.json();
    console.log("[Analytics] Revenue after:", analyticsAfter.revenue);
    console.log("[Analytics] Bookings after:", analyticsAfter.totalBookings);
    console.log("[Analytics] Match expected?", 
        analyticsAfter.totalBookings === analyticsBefore.totalBookings + 1
    );

    // 6. Verify Payments against DB
    res = await fetch('http://localhost:3001/api/v1/payments?limit=5', { headers });
    const paymentsList = await res.json();
    if (paymentsList.data && paymentsList.data.length > 0) {
      const apiPayment = paymentsList.data[0];
      const dbPayment = await prisma.payment.findUnique({ where: { id: apiPayment.id } });
      
      console.log("[Payments] API Status:", apiPayment.status, "DB Status:", dbPayment.status);
      console.log("[Payments] API Amount:", apiPayment.amount, "DB Amount:", dbPayment.amount.toString());
      console.log("[Payments] Match?", apiPayment.status === dbPayment.status && apiPayment.amount == dbPayment.amount.toString());
    } else {
      console.log("[Payments] No payments found in API.");
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
