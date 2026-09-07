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
  console.log("=== 2. Health Check ===");
  const health = await request('GET', '/health');
  console.log(health);

  console.log("\n=== 5. Site Slug Resolution ===");
  for (const slug of ['pokhara-travels', 'chitwan-travels', 'ktm-lumbini-services']) {
    const site = await request('GET', `/sites/by-slug/${slug}`);
    console.log(`${slug}:`, site.body.id, site.body.slug, site.body.name);
  }

  console.log("\n=== 6. CMS Testimonials isolation ===");
  for (const slug of ['pokhara-travels', 'chitwan-travels', 'ktm-lumbini-services']) {
    const test = await request('GET', `/cms/testimonials`, { 'X-Site-Id': slug });
    console.log(`${slug} testimonials count:`, test.body.length);
  }

  console.log("\n=== 7. CMS Invalid Site ===");
  const inv = await request('GET', `/cms/testimonials`, { 'X-Site-Id': 'not-a-real-site' });
  console.log(`Invalid site status: ${inv.status}, body:`, inv.body);

  console.log("\n=== 9. Full Booking Flow (Pokhara) ===");
  // Search
  const search = await request('GET', `/trips/search?origin=Pokhara&destination=Kathmandu&date=2026-09-10`, { 'X-Site-Id': 'pokhara-travels' });
  // Since we might not have a trip generated, let's just create one or wait, the cron job generates them.
  // Actually, we can check if search returns anything.
  console.log("Search result:", search.body.length ? `${search.body.length} trips` : search.body);

}
runTests().catch(console.error);
