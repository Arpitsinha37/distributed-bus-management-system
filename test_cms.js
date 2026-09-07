const http = require('http');

const request = (method, path, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/v1${path}`,
      method,
      headers
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
};

async function runTests() {
  console.log("=== 1. Test invalid site slug ===");
  const invalid = await request('GET', `/cms/testimonials`, { 'X-Site-Id': 'not-a-real-site' });
  console.log(`Status: ${invalid.status}`);
  console.log(`Body: ${invalid.body}`);

  console.log("\n=== 2. Test valid site slugs ===");
  for (const slug of ['pokhara-travels', 'chitwan-travels', 'ktm-lumbini-services']) {
    const valid = await request('GET', `/cms/testimonials`, { 'X-Site-Id': slug });
    console.log(`${slug} status: ${valid.status}, items: ${JSON.parse(valid.body).length ?? JSON.parse(valid.body).message}`);
  }
}

runTests().catch(console.error);
