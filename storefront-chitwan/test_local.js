const axios = require('axios');
async function run() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:3001/api/v1' });
    
    console.log("Searching trips...");
    const trips = await api.get('/trips/search?origin=Kathmandu&destination=Pokhara&date=2026-09-22');
    const trip = trips.data.data[0];
    if (!trip) {
        console.log("No trips found. Will search 2026-09-21");
        const trips2 = await api.get('/trips/search?origin=Kathmandu&destination=Pokhara&date=2026-09-21');
        const trip2 = trips2.data.data[0];
        if (!trip2) {
           console.log("No trips found."); return;
        }
        var targetTrip = trip2;
    } else {
        var targetTrip = trip;
    }
    console.log("Trip ID:", targetTrip.id);
    
    console.log("Holding seat...");
    const holdRes = await api.post('/bookings/hold', {
      tripId: targetTrip.id,
      seats: ["1A"],
      boardingPoint: "Kathmandu",
      droppingPoint: "Pokhara",
      customerInfo: { name: "Test", email: "test@test.com", phone: "9800000000" },
      passengers: [{ seatNumber: "1A", name: "Test", age: 30 }]
    });
    console.log("Booking ID:", holdRes.data.id);
    
    console.log("Initiating payment...");
    const payRes = await api.post('/payments/esewa/initiate', {
      bookingId: holdRes.data.id
    });
    console.log(payRes.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();
