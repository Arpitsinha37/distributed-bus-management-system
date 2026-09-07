const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

async function testPage(page, url, name) {
    console.log(`\n=== Testing ${name} ===`);
    console.log('Navigating to', url);
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    console.log('Stopping backend...');
    execSync('docker-compose stop backend', { cwd: 'd:/distributed bus management system' });
    
    console.log('Refreshing page (backend is down)...');
    try {
        await page.reload({ waitUntil: 'networkidle2', timeout: 15000 });
    } catch(e) { console.log('Reload timeout'); }
    await new Promise(r => setTimeout(r, 2000));
    
    const isError = await page.evaluate(() => {
        return !!document.querySelector('.bg-red-50');
    });
    console.log(`UI ErrorBanner present: ${isError}`);
    
    console.log('Starting backend...');
    execSync('docker-compose start backend', { cwd: 'd:/distributed bus management system' });
    await new Promise(r => setTimeout(r, 10000));
    
    console.log('Refreshing page (backend is up)...');
    try {
        await page.reload({ waitUntil: 'networkidle2', timeout: 15000 });
    } catch(e) { console.log('Reload timeout'); }
    await new Promise(r => setTimeout(r, 2000));
    
    const isErrorUp = await page.evaluate(() => {
        return !!document.querySelector('.bg-red-50');
    });
    console.log(`UI ErrorBanner present after recovery: ${isErrorUp}`);
}

(async () => {
  console.log('Launching...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.setCacheEnabled(false);
  
  page.on('response', res => {
    if (res.url().includes('/api/v1/')) {
      console.log(`[NETWORK] ${res.url()} - status: ${res.status()} - fromCache: ${res.fromCache()}`);
    }
  });

  console.log('Logging in...');
  await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'admin@pokharatravels.com');
  await page.type('input[type="password"]', 'admin@123');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {})
  ]);

  console.log('Current URL:', page.url());
  
  if (page.url().includes('/sites')) {
      console.log('Clicking site card...');
      await page.evaluate(() => {
          const cards = document.querySelectorAll('button');
          for (const c of cards) {
              if (c.innerText.includes('Pokhara')) {
                  c.click();
              }
          }
      });
      await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  }
  
  console.log('URL after login sequence:', page.url());

  await testPage(page, 'http://localhost:3002/dashboard/schedules', 'schedules');

  await browser.close();
  console.log('Done.');
})();
