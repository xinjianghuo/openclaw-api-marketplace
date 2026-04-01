#!/usr/bin/env node
/**
 * 🖱️ Simple Human Mouse Demo
 *
 * Opens browser and demonstrates human-like movement on a simple page.
 * No external dependencies except Playwright.
 *
 * Usage: node simple-human-demo.js
 */

const { chromium } = require('playwright');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Simplified human movement
async function humanMove(page, toX, toY, fromX = 100, fromY = 100) {
  const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
  const steps = Math.max(20, Math.floor(distance / 5));
  const duration = random(1000, 2000);

  // Control point for curve
  const cx = fromX + (toX - fromX) * random(0.3, 0.7);
  const cy = fromY + (toY - fromY) * random(0.3, 0.7);

  for (let i = 1; i <= steps; i++) {
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

    // Jitter
    const jitter = 1.5;
    const jitterx = x + (Math.random() - 0.5) * jitter;
    const jittery = y + (Math.random() - 0.5) * jitter;

    await page.mouse.move(jitterx, jittery);
    await sleep(duration / steps + random(-20, 30));
  }
}

async function main() {
  console.log('🎭 Simple Human Mouse Demo');
  console.log('Will open a browser and show realistic cursor movement.\n');

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--window-size=1400,900'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });

  // Stealth
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    window.chrome = { runtime: {} };
  });

  const page = await context.newPage();

  // Create a simple test page in the browser
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head><title>Human Mouse Test</title></head>
    <body style="margin:0;padding:50px;font-family:monospace;background:#1a1a2e;color:#fff">
      <h1>Human Mouse Simulation Test</h1>
      <p>Watch the red dot move naturally to each target.</p>
      <div style="margin: 50px 0;">
        <button id="btn1" style="padding:15px 30px;margin:20px;background:#2563eb;color:white;border:none;border-radius:8px;font-size:18px">I want this</button>
        <button id="btn2" style="padding:15px 30px;margin:20px;background:#16a34a;color:white;border:none;border-radius:8px;font-size:18px">Subscribe</button>
        <button id="btn3" style="padding:15px 30px;margin:20px;background:#dc2626;color:white;border:none;border-radius:8px;font-size:18px">Learn More</button>
      </div>
      <div id="log" style="position:fixed;bottom:20px;left:20px;background:rgba(0,0,0,0.8);padding:10px;border-radius:4px;font-family:monospace"></div>
    </body>
    </html>
  `);

  const log = async (msg) => {
    await page.evaluate((m) => {
      const log = document.getElementById('log');
      log.textContent = m;
    }, msg);
  };

  const buttons = await page.$$('button');

  // Position buttons (they're already in DOM, get their boxes)
  console.log('📍 Moving to first button...');

  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    const box = await btn.boundingBox();

    await log(`Moving to button ${i+1} (${box.x + box.width/2}, ${box.y + box.height/2})`);
    console.log(`   Target ${i+1}: ${box.x + box.width/2}, ${box.y + box.height/2}`);

    // Move human-like
    await humanMove(page, box.x + box.width/2, box.y + box.height/2);

    // Pause like human reading button
    await sleep(random(300, 800));

    // Hover effect (visual only)
    await btn.hover();
    await sleep(random(200, 600));
  }

  await log('Demo complete! Closing in 5 seconds...');
  console.log('✅ Demo finished. Browser closes in 5s.');
  await sleep(5000);

  await browser.close();
  console.log('🔒 Browser closed.');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
