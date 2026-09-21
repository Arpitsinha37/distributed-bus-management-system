const https = require('https');

const request = (method, path, headers = {}, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'backend-api-production-be2e.up.railway.app',
      port: 443,
      path: `/api/v1${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function testPayment() {
  console.log("=== 1. Find Trip ===");
  const search = await request('GET', `/trips/search?origin=Pokhara&destination=Kathmandu&date=2026-09-22`, { 'X-Site-Id': 'pokhara-travels' });
  const tripId = search.body[0]?.id;
  if (!tripId) {
    console.log("No trips found!");
    return;
  }
  
  console.log("=== 2. Hold Booking ===");
  const hold = await request('POST', `/bookings/hold`, { 'X-Site-Id': 'pokhara-travels' }, {
    tripId,
    customerName: 'Test User',
    customerPhone: '9800000001',
    customerEmail: 'test@example.com',
    boardingPoint: 'Pokhara',
    droppingPoint: 'Kathmandu',
    seats: ['A1', 'A2']
  });
  
  if(hold.status !== 201) {
    console.log("Hold Failed", hold.status, hold.body);
    return;
  }

  const bookingId = hold.body.id;
  console.log("Booking ID:", bookingId);

  console.log("=== Testing PACO Initiation ===");
  const pacoRes = await request('POST', `/payments/paco/initiate`, { 'X-Site-Id': 'pokhara-travels' }, {
    bookingId,
    gateway: 'paco',
    paymentMethod: 'visa',
    successUrl: 'http://localhost:3000/success',
    failureUrl: 'http://localhost:3000/failure'
  });
  console.log("PACO:", pacoRes.status, pacoRes.body);

  console.log("=== Testing Khalti Initiation ===");
  const khaltiRes = await request('POST', `/payments/khalti/initiate`, { 'X-Site-Id': 'pokhara-travels' }, {
    bookingId,
    gateway: 'khalti',
    paymentMethod: 'khalti',
    successUrl: 'http://localhost:3000/success',
    failureUrl: 'http://localhost:3000/failure'
  });
  console.log("KHALTI:", khaltiRes.status, khaltiRes.body);
}

testPayment().catch(console.error);
