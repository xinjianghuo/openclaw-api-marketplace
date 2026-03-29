#!/usr/bin/env node
/**
 * 🎭 LIVE Human Browser Control Demo
 *
 * This will ACTUALLY open a browser and perform human-like operations:
 * 1. Visit API health endpoint
 * 2. Scroll and read like a human
 * 3. Visit Gumroad product page
 * 4. Simulate interest (hover, scroll, maybe click)
 *
 * Usage: node live-human-demo.js
 */

const { chromium } = require('playwright');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const random = (min, max) => Math.random() * (max - min) + min;

// Human-like mouse movement with Bezier curves
async function humanMove(page, fromX, fromY, toX, toY) {
  const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
  const steps = Math.max(30, Math.floor(distance / 4));
  const duration = random(1000, 2500);

  // Random control points for natural arc
  const cx = fromX + (toX - fromX) * random(0.25, 0.75);
  const cy = fromY + (toY - fromY) * random(0.25, 0.75);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    // Cubic Bezier
    const x = Math.pow(1-t, 3) * fromX +
              3 * Math.pow(1-t, 2) * t * cx +
              3 * (1-t) * t * t * toX +
              Math.pow(t, 3) * toX;
    const y = Math.pow(1-t, 3) * fromY +
              3 * Math.pow(1-t, 2) * t * cy +
              3 * (1-t) * t * t * toY +
              Math.pow(t, 3) * toY;

    // Add micro-jitter (hand tremor)
    const jitter = 1.2;
    constjx = x + (Math.random() - 0.5) * jitter;
    const jittery = y + (Math.random() - 0.5) * jitter;

    await page.mouse.move(jitterx, jittery);

    // Variable delay (acceleration/deceleration)
    const ease = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
    const delay = (duration / steps) * (0.8 + Math.random() * 0.4);
    await sleep(delay);
  }
}

// Human typing with errors
async function humanType(element, text) {
  await element.click();
  await sleep(random(100, 300));

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Random pause
    if (Math.random() < 0.08) {
      await sleep(random(50, 200));
    }

    // Punctuation pause
    if ([',', '.', '!', '?'].includes(char)) {
      await sleep(random(100, 300));
    }

    // Typo
    if (Math.random() < 0.015) {
      const typo = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      await element.type(typo);
      await sleep(random(30, 80));
      await element.press('Backspace');
    }

    await element.type(char);

    // WPM 60-100
    const wpm = random(60, 100);
    const interval = (60 / wpm) * 1000 / 5;
    await sleep(interval + random(-20, 30));
  }
}

// Natural scrolling
async function humanScroll(page, targetY, totalDuration = 2000) {
  const startY = await page.evaluate(() => window.scrollY);
  const distance = targetY - startY;
  const steps = Math.min(50, Math.max(15, Math.floor(Math.abs(distance) / 40)));

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ease = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
    const currentY = startY + distance * ease;

    await page.evaluate((y) => window.scrollTo(0, y), currentY);

    // Random pause (reading)
    if (Math.random() < 0.15) {
      await sleep(random(200, 800));
    }

    // Occasional backscroll (re-read)
    if (Math.random() < 0.08) {
      const back = random(30, 100);
      await page.evaluate((amt) => window.scrollBy(0, -amt), back);
      await sleep(random(100, 300));
    }

    await sleep(totalDuration / steps + random(-50, 80));
  }
}

async function main() {
  console.log('🎭 Starting LIVE Human Browser Demo');
  console.log('Watch the browser window - everything is simulated as a real human!\n');

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--user-data-dir=C:\\temp\\chrome-live-' + Date.now(),
      '--profile-directory=Default'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York'
  });

  // Stealth injection
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
    window.chrome = { runtime: {}, loadTimes: () => ({}) };
  });

  const page = await context.newPage();

  try {
    // === SCENE 1: Check API Health ===
    console.log('🌐 [Scene 1] Visiting API health endpoint...');
    await page.goto('https://api-marketplace-pearl.vercel.app/api/health', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await sleep(2000);

    // Simulate reading the JSON response
    const content = await page.textContent('body');
    console.log('   API says:', content.substring(0, 80) + '...');

    // Random scroll on the JSON page
    await page.mouse.wheel(0, random(100, 300));
    await sleep(random(500, 1500));

    console.log('   ✅ Health check completed');

    // === SCENE 2: Visit Product Page (simulate customer) ===
    console.log('\n🛒 [Scene 2] Visiting Gumroad product page as potential buyer...');
    await page.goto('https://huozen5.gumroad.com/l/sligrv', {
      waitUntil: 'domcontentloaded'
    });
    await sleep(3000); // Read the page

    // Human-like scrolling through the product page
    console.log('   📜 Scrolling through product page (human speed)...');
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    await humanScroll(page, pageHeight * 0.7, 5000); // Scroll to 70%

    // Hover over the buy button (without clicking)
    console.log('   👆 Hovering over "I want this" button...');
    const buyButton = await page.$('button[data-testid="buy-button"]');
    if (buyButton) {
      const box = await buyButton.boundingBox();
      await humanMove(page, random(100, 200), random(200, 400), box.x + box.width/2, box.y + box.height/2);
      await sleep(random(500, 1500)); // Pause like human considering
    }

    // Maybe scroll back up a bit
    await page.evaluate(() => window.scrollBy(0, -random(200, 500)));
    await sleep(random(500, 1000));

    console.log('   ✅ Product page interaction complete');

    // === SCENE 3: Check Our Landing Page (if it existed) ===
    console.log('\n🌍 [Scene 3] Would visit marketing site (not live yet)...');
    console.log('   (After GitHub Pages deployment, this would be: https://algea.github.io/node-doctor-api-site/)');

    // Wait a moment
    await sleep(3000);

    console.log('\n✅ Demo complete! Browser shows realistic human behavior.');
    console.log('   Key observations:');
    console.log('   - Mouse moved in curved lines, not straight');
    console.log('   - Variable speed (accelerated/decelerated)');
    console.log('   - Random pauses (reading/thinking)');
    console.log('   - No robotic patterns');
    console.log('\nPress Enter to close browser...');

    // Wait for user
    process.stdin.once('data', () => {});

    await sleep(5000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'human-demo-error.png' });
  } finally {
    await browser.close();
    console.log('\n🔒 Browser closed. Demo finished.');
  }
}

// Run
main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
