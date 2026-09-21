const axios = require('axios');

async function testHoldAndPay() {
  const api = axios.create({ baseURL: 'https://backend-api-production-be2e.up.railway.app/api/v1' });

  try {
    console.log("Searching trips...");
    const trips = await api.get('/trips/search?origin=Kathmandu&destination=Pokhara&date=2026-09-22').catch(() => null);
    let trip = trips?.data?.data?.[0];
    
    if (!trip) {
      console.log("Searching trips for 2026-09-21...");
      const trips2 = await api.get('/trips/search?origin=Kathmandu&destination=Pokhara&date=2026-09-21');
      trip = trips2.data.data[0];
    }
    
    if (!trip) {
      console.log("No trips found.");
      return;
    }
    console.log("Using Trip ID:", trip.id);

    console.log("Holding seat...");
    // generate a random seat
    const seat = "1A";
    const holdRes = await api.post('/bookings/hold', {
      tripId: trip.id,
      seats: [seat],
      boardingPoint: "Kathmandu",
      droppingPoint: "Pokhara",
      customerInfo: { name: "Test API", email: "test@example.com", phone: "9800000000" },
      passengers: [{ seatNumber: seat, name: "Test API", age: 30 }]
    });

    const bookingId = holdRes.data.id;
    console.log("Successfully held seat. Booking ID:", bookingId);

    console.log("Initiating eSewa payment...");
    const payRes = await api.post('/payments/esewa/initiate', { bookingId });
    console.log("eSewa Payment Initiated:", payRes.data);

    console.log("Initiating Khalti payment (just to test)...");
    const payResKhalti = await api.post('/payments/khalti/initiate', { bookingId });
    console.log("Khalti Payment Initiated:", payResKhalti.data);

  } catch (err) {
    if (err.response) {
      console.error("API Error:", err.response.status, err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
}

testHoldAndPay();
