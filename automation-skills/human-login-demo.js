/**
 * Demo: Human-Like Login with Advanced Stealth
 *
 * Usage:
 *   npx playwright test human-login.spec.ts
 *   OR
 *   node human-login-demo.js
 */

const { chromium } = require('playwright');
const { HumanMouse, HumanTyper, humanScroll } = require('./human-browser');
const stealthScript = require('./stealth-script');

async function humanLoginDemo() {
  const browser = await chromium.launch({
    headless: false, // Must be visible to see human behavior
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--user-data-dir=C:\\temp\\chrome-human-' + Date.now(),
      '--profile-directory=Default'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }, // Common resolution
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    geolocation: { latitude: 40.7128, longitude: -74.0060 },
    permissions: ['geolocation'],
    colorScheme: 'light'
  });

  // Inject stealth script
  await context.addInitScript(stealthScript);

  const page = await context.newPage();

  // Extra stealth: block headless detection resources
  await page.route('**/detector.js', route => route.abort());
  await page.route('**/bot-detect*', route => route.abort());

  const mouse = new HumanMouse(page);
  const typer = new HumanTyper(page);

  try {
    console.log('🌐 Navigating to login page...');
    await page.goto('https://example.com/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Random scroll (look like reading)
    console.log('📜 Scrolling naturally...');
    await humanScroll(page, 500, 2000);
    await mouse.sleep(random(500, 1500));

    // Fill email
    console.log('👆 Clicking email field...');
    const emailInput = await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    const box = await emailInput.boundingBox();
    await mouse.moveTo(box.x + box.width / 2, box.y + box.height / 2);
    await mouse.click();
    await mouse.sleep(random(200, 600));

    console.log('⌨️  Typing email...');
    const mistakes = await typer.type(emailInput, 'user@example.com');
    console.log(`   (made ${mistakes} typos, corrected)`);

    await mouse.sleep(random(800, 2000)); // Think

    // Fill password
    console.log('👆 Clicking password field...');
    const passwordInput = await page.$('input[type="password"]');
    const pwdBox = await passwordInput.boundingBox();
    await mouse.moveTo(pwdBox.x + pwdBox.width / 2, pwdBox.y + pwdBox.height / 2);
    await mouse.click();
    await mouse.sleep(random(100, 400));

    console.log('⌨️  Typing password...');
    await typer.type(passwordInput, 'MyP@ssw0rd!123');

    await mouse.sleep(random(500, 1500)); // Review

    // Click login
    console.log('👆 Clicking login button...');
    const loginBtn = await page.$('button[type="submit"]');
    const btnBox = await loginBtn.boundingBox();
    await mouse.moveTo(btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2);

    // Slight overshoot simulation
    await mouse.click(btnBox.x + btnBox.width / 2 + random(-3, 3), btnBox.y + btnBox.height / 2 + random(-3, 3));

    console.log('⏳ Waiting for navigation...');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });

    // Check result
    const url = page.url();
    console.log('✅ Login complete. Current URL:', url);

    // Take screenshot
    await page.screenshot({ path: 'human-login-success.png', fullPage: true });
    console.log('📸 Screenshot saved: human-login-success.png');

    // Dashboard interactions (optional)
    if (url.includes('dashboard')) {
      console.log('📊 Interacting with dashboard...');
      await humanScroll(page, 800, 1500);
      await mouse.sleep(random(1000, 3000));
    }

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'human-login-error.png' });
  } finally {
    await browser.close();
    console.log('🔒 Browser closed.');
  }
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Run
humanLoginDemo().catch(console.error);
