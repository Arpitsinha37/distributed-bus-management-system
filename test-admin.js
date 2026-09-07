const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

const URLs = [
  'http://localhost:3002/dashboard/schedules',
  'http://localhost:3002/dashboard/marketing/coupons',
  'http://localhost:3002/dashboard/analytics',
  'http://localhost:3002/dashboard/campaigns'
];

async function runTest() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Disable cache to ensure fetch failures happen when backend is down
  await page.setCacheEnabled(false);

  // ── Step 1: Login ──────────────────────────────────────────
  console.log('Navigating to login page (root /)...');
  await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2', timeout: 30000 });

  await page.waitForSelector('input[type="email"]', { timeout: 15000 });
  console.log('Login form found. Filling credentials...');
  await page.type('input[type="email"]', 'admin@pokharatravels.com');
  await page.type('input[type="password"]', 'admin@123');
  
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {})
  ]);

  console.log('Logged in/Navigated. Current URL:', page.url());

  // Wait for site cards to render if we are on /sites
  if (page.url().includes('/sites')) {
    await new Promise(r => setTimeout(r, 3000));

    // ── Step 2: Select the first site ──────────────────────────
    console.log('Clicking the Pokhara Travels site...');
    await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
            if (btn.innerText.includes('Pokhara')) {
                btn.click();
                return;
            }
        }
        if (btns.length > 0) btns[0].click();
    });
    
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  }

  // ── Step 3: Test Batch 2 Pages ─────────────────────────────
  for (const url of URLs) {
    const pageName = url.split('/').pop();
    console.log(`\n========== Testing: ${pageName} ==========`);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    } catch (err) {
      console.log('  - Initial goto timed out, continuing...');
    }
    await new Promise(r => setTimeout(r, 2000));
    
    // 3a. Screenshot of normal state
    await page.screenshot({ path: `screenshot_${pageName}_normal.png` });
    console.log(`  ✓ Page loaded. Screenshot saved.`);

    // 3b. Stop the backend
    console.log(`  - Stopping backend...`);
    execSync('docker-compose stop backend', { cwd: 'd:/distributed bus management system' });
    console.log(`  - Backend stopped.`);

    // 3c. Refresh the page (backend is down)
    console.log(`  - Refreshing page with backend down...`);
    try {
      await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });
    } catch(err) {
      console.log('  - Reload timed out, proceeding anyway...');
    }
    await new Promise(r => setTimeout(r, 2000));

    // 3d. Check for ErrorBanner
    const errorCheck = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return {
        hasFailedToLoad: bodyText.includes('Failed to load'),
        hasFailedToFetch: bodyText.includes('Failed to fetch') || bodyText.includes('Network'),
        hasRedBanner: !!document.querySelector('.bg-red-50'),
        bodySnippet: bodyText.substring(0, 500)
      };
    });

    const hasError = errorCheck.hasFailedToLoad || errorCheck.hasFailedToFetch || errorCheck.hasRedBanner;
    console.log(`  - ErrorBanner present: ${hasError}`);
    if (!hasError) {
      console.log(`    Details:`, JSON.stringify(errorCheck, null, 2));
    }

    // 3e. Screenshot of error state
    await page.screenshot({ path: `screenshot_${pageName}_error.png` });
    console.log(`  ✓ Error state screenshot saved.`);

    // 3f. Restart the backend
    console.log(`  - Starting backend...`);
    execSync('docker-compose start backend', { cwd: 'd:/distributed bus management system' });

    // Wait for backend to fully start
    console.log(`  - Waiting 15s for backend startup...`);
    await new Promise(r => setTimeout(r, 15000));

    // 3g. Refresh again, confirm recovery
    console.log(`  - Refreshing page after backend restart...`);
    try {
      await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });
    } catch(err) {
      console.log('  - Reload timed out, proceeding anyway...');
    }
    await new Promise(r => setTimeout(r, 3000));

    const recoveryCheck = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return {
        hasFailedToLoad: bodyText.includes('Failed to load'),
        hasFailedToFetch: bodyText.includes('Failed to fetch') || bodyText.includes('Network'),
        hasRedBanner: !!document.querySelector('.bg-red-50'),
        bodySnippet: bodyText.substring(0, 500)
      };
    });

    const recovered = !recoveryCheck.hasFailedToLoad && !recoveryCheck.hasFailedToFetch && !recoveryCheck.hasRedBanner;
    console.log(`  - Recovered (no error banner): ${recovered}`);
    if (!recovered) {
      console.log(`    Recovery details:`, JSON.stringify(recoveryCheck, null, 2));
    }

    // 3h. Final screenshot
    await page.screenshot({ path: `screenshot_${pageName}_recovered.png` });
    console.log(`  ✓ Recovered screenshot saved.`);

    if (hasError && recovered) {
      console.log(`  RESULT: ✅ PASS`);
    } else {
      console.log(`  RESULT: ❌ FAIL — error shown: ${hasError}, recovered: ${recovered}`);
    }
  }

  await browser.close();
  console.log('\nAll tests complete.');
}

runTest().catch(console.error);
