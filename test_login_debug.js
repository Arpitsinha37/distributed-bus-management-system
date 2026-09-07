const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:3002/');
  await page.type('input[type="email"]', 'admin@pokharatravels.com');
  await page.type('input[type="password"]', 'admin@123');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {})
  ]);
  
  if (page.url().includes('/sites')) {
    await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
            if (btn.innerText.includes('Pokhara')) {
                btn.click();
            }
        }
    });
    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  }
  
  console.log('Navigating to schedules...');
  await page.goto('http://localhost:3002/dashboard/schedules', { waitUntil: 'networkidle2' });
  
  console.log('Stopping backend...');
  execSync('docker-compose stop backend', { cwd: 'd:/distributed bus management system' });
  
  console.log('Reloading...');
  await page.reload({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 3000));
  
  const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('TEXT:', text);
  const errorBanner = await page.evaluate(() => document.querySelector('.bg-red-50')?.innerHTML);
  console.log('ErrorBanner HTML:', errorBanner);
  
  console.log('Starting backend...');
  execSync('docker-compose start backend', { cwd: 'd:/distributed bus management system' });
  await browser.close();
})();
