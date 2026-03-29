/**
 * Human Browser Demo - 无需 npm，直接运行
 *
 * 使用方法:
 *   1. 确保已安装 Node.js
 *   2. 运行: node human-demo.js
 *
 * 这个脚本会:
 *   1. 启动 Playwright Chromium
 *   2. 注入人类化行为
 *   3. 访问 example.com 并填写表单
 *   4. 展示完全模拟人类的操作
 */

const { chromium } = require('playwright');

// 等待输入的函数
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 随机数
const random = (min, max) => Math.random() * (max - min) + min;

// 人类化鼠标移动 (简化版)
async function humanMove(page, toX, toY, fromX = 0, fromY = 0) {
  const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
  const steps = Math.max(20, Math.floor(distance / 5));
  const duration = random(400, 1200); // ms

  // 贝塞尔曲线控制点
  const cx = fromX + (toX - fromX) * random(0.3, 0.7);
  const cy = fromY + (toY - fromY) * random(0.3, 0.7);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // 贝塞尔公式
    const x = Math.pow(1-t, 3) * fromX +
              3 * Math.pow(1-t, 2) * t * cx +
              3 * (1-t) * t * t * toX +
              Math.pow(t, 3) * toX;
    const y = Math.pow(1-t, 3) * fromY +
              3 * Math.pow(1-t, 2) * t * cy +
              3 * (1-t) * t * t * toY +
              Math.pow(t, 3) * toY;

    // 添加抖动
    const jitter = 1.5;
    constjx = x + random(-jitter, jitter);
    const jittery = y + random(-jitter, jitter);

    await page.mouse.move(jitterx, jittery);

    // 随机停顿
    if (Math.random() < 0.1) {
      await wait(random(20, 80));
    }

    await wait(duration / steps);
  }
}

// 人类化打字
async function humanType(page, element, text) {
  await element.click();

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // 随机停顿
    if (Math.random() < 0.1) {
      await wait(random(50, 300));
    }

    // 标点停顿
    if ([',', '.', '!', '?'].includes(char)) {
      await wait(random(100, 400));
    }

    // 偶尔打错
    if (Math.random() < 0.02) {
      const wrong = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      await page.keyboard.type(wrong);
      await wait(random(30, 100));
      await page.keyboard.press('Backspace');
    }

    await page.keyboard.type(char);

    // 打字间隔 (WPM 80-120)
    const wpm = random(80, 120);
    const interval = (60 / wpm) * 1000 / 5; // 5 chars per word
    await wait(interval + random(-30, 50));
  }
}

// 主函数
async function main() {
  console.log('🚀 Starting Human Browser Demo...');

  const browser = await chromium.launch({
    headless: false, // 必须可见
    args: [
      '--disable-blink-features=AutomationControlled',
      '--user-data-dir=C:\\temp\\chrome-human-' + Date.now()
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    locale: 'en-US'
  });

  // 注入 stealth
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    window.chrome = { runtime: {}, loadTimes: () => ({}) };
  });

  const page = await context.newPage();

  try {
    // 1. 访问 API 健康检查
    console.log('📍 Navigating to API health endpoint...');
    await page.goto('https://api-marketplace-pearl.vercel.app/api/health', {
      waitUntil: 'networkidle'
    });

    // 等待加载
    await wait(2000);

    // 2. 查看响应 (模拟阅读)
    console.log('👀 Reading response (human scroll)...');
    const content = await page.textContent('body');
    console.log('   Health:', content.substring(0, 100) + '...');

    // 3. 访问 Landing page
    console.log('🌐 Navigating to marketing site (would be live after GitHub Pages)...');
    // 由于 site 还没上线，我们访问 Gumroad product page
    await page.goto('https://huozen5.gumroad.com/l/sligrv', {
      waitUntil: 'networkidle'
    });

    await wait(3000); // 阅读页面

    // 4. 模拟点击 "Buy now" 或 scrolling
    console.log('👇 Simulating human scrolling...');
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, random(200, 500));
      await wait(random(500, 1500));
    }

    console.log('✅ Demo completed. Browser will close in 5 seconds...');
    await wait(5000);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('🔒 Browser closed.');
  }
}

// 运行
main().catch(console.error);
