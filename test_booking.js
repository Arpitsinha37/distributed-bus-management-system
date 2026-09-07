const http = require('http');

const request = (method, path, headers = {}, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/v1${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    const req = http.request(options, (res) => {
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

async function runTests() {
  console.log("=== 9. Full Booking Flow ===");
  const search = await request('GET', `/trips/search?origin=Pokhara&destination=Kathmandu&date=2026-09-10`, { 'X-Site-Id': 'pokhara-travels' });
  const tripId = search.body[0].id;
  
  // Hold
  const hold = await request('POST', `/bookings/hold`, { 'X-Site-Id': 'pokhara-travels' }, {
    tripId,
    customerName: 'Test User',
    customerPhone: '9800000001',
    customerEmail: 'test@example.com',
    boardingPoint: 'Pokhara',
    droppingPoint: 'Kathmandu',
    seats: ['A1', 'A2']
  });
  console.log("Hold response:", hold.status, hold.body.id);
  const bookingId = hold.body.id;
  const expectedFare = hold.body.totalFare;

  // Mock Pay mismatch
  const payBad = await request('POST', `/bookings/${bookingId}/mock-pay`, {}, { expectedFare: 9999999 });
  console.log("Pay mismatch:", payBad.status, payBad.body.message);

  // Mock Pay success
  const payOk = await request('POST', `/bookings/${bookingId}/mock-pay`, {}, { expectedFare: Number(expectedFare) });
  console.log("Pay success:", payOk.status, payOk.body.status);

  console.log("\n=== 10. Mock-pay Rate Limit ===");
  for (let i = 0; i < 6; i++) {
    const res = await request('POST', `/bookings/${bookingId}/mock-pay`, {}, { expectedFare: Number(expectedFare) });
    console.log(`Attempt ${i+1}: ${res.status} ${res.body?.message || res.body?.status}`);
  }
}
runTests().catch(console.error);
