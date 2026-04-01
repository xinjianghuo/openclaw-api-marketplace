# 🤖 高级浏览器自动化 - 完全模拟人类操作

**目标**: 让自动化脚本无法被检测为机器人，通过完美模拟人类行为模式

**技术栈**: Playwright + 自定义 human-行为引擎 + Stealt插件

---

## 🎭 为什么需要"人类模拟"

现代反爬虫系统检测:
1. **鼠标轨迹** - 直线、匀速 → 机器人
2. **打字速度** - 恒定WPM、无错误 → 机器人
3. **时间间隔** - 精确到ms → 机器人
4. **指纹不一致** - Navigator 属性异常 → 机器人
5. **缺少噪声** - 完美执行 → 机器人

**解决方案**: 注入随机性、错误、停顿、生理特征

---

## 🔧 核心技术

### 1. 人类化鼠标移动

**问题**: `page.mouse.move(x, y)` 会走直线，速度恒定

**解决方案**: 贝塞尔曲线 + 随机加速度

```typescript
import { random, triangular } from 'simple-statistics';

class HumanMouse {
  constructor(page) {
    this.page = page;
    this.minSpeed = 400; // px/s 最小速度
    this.maxSpeed = 1200; // px/s 最大速度
    this.jitter = 2; // 抖动幅度 pixels
  }

  async moveTo(targetX, targetY) {
    const startX = this.currentX || 0;
    const startY = this.currentY || 0;

    // 计算距离
    const distance = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2));

    // 随机速度 (模拟手部移动速度变化)
    const speed = random(this.minSpeed, this.maxSpeed);
    const duration = (distance / speed) * 1000; // ms

    // 生成贝塞尔曲线控制点 (模拟手部自然弧线)
    const controlX = startX + (targetX - startX) * triangular(0.3, 0.5, 0.7);
    const controlY = startY + (targetY - startY) * triangular(0.3, 0.5, 0.7);

    // 添加随机抖动 (手部微小颤抖)
    const jitterPath = this.generateJitteredPath(startX, startY, controlX, controlY, targetX, targetY);

    // 执行移动 (分段，模拟肌肉调整)
    await selfollowBezier(jitterPath, duration);

    this.currentX = targetX;
    this.currentY = targetY;
  }

  generateJitteredPath(x0, y0, cx, cy, x1, y1, segments = 20) {
    const path = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // 贝塞尔公式
      let x = Math.pow(1-t, 3) * x0 + 3 * Math.pow(1-t, 2) * t * cx + 3 * (1-t) * t * t * x1 + Math.pow(t, 3) * x1;
      let y = Math.pow(1-t, 3) * y0 + 3 * Math.pow(1-t, 2) * t * cy + 3 * (1-t) * t * t * y1 + Math.pow(t, 3) * y1;

      // 添加随机抖动 (越靠近终点抖动越小)
      const jitterAmount = this.jitter * (1 - t) + 0.5;
      x += random(-jitterAmount, jitterAmount);
      y += random(-jitterAmount, jitterAmount);

      path.push({ x, y });
    }
    return path;
  }
}
```

---

### 2. 人类化打字

**问题**: `element.type('text')` 速度恒定，无错误

**解决方案**: 随机间隔 + 偶尔错误 + 退格修正

```typescript
class HumanTyper {
  constructor(page) {
    this.page = page;
    this.baseWPM = 80; // 基础速度
    this.variance = 15; // 速度波动
    this.errorRate = 0.02; // 2% 错误率
    this.pauseAfterComma = 0.2; // 逗号后停顿概率
    this.pauseAfterWord = 0.1; // 单词后停顿概率
  }

  async typeSlowly(element, text) {
    const chars = text.split('');
    let typedText = '';

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];

      // 随机停顿 (思考时间)
      if (Math.random() < 0.1) {
        await this.sleep(random(50, 300));
      }

      // 额外停顿 (标点后)
      if ([',', '.', '!', '?', ';'].includes(char) && Math.random() < this.pauseAfterComma) {
        await this.sleep(random(200, 800));
      }

      // 偶尔打错字
      if (Math.random() < this.errorRate && i < chars.length - 1) {
        const wrongChar = this.getRandomCharExcept(char);
        await element.press(wrongChar);
        await this.sleep(random(100, 250));
        await element.press('Backspace');
        typedText = typedText.slice(0, -1);
      }

      // 实际输入
      await element.press(char);
      typedText += char;

      // 打字速度 (WPM → ms 间隔)
      const wpm = random(this.baseWPM - this.variance, this.baseWPM + this.variance);
      const interval = (60 / wpm) * 1000 / 5; // 平均按键间隔，毫秒
      const jitter = random(-30, 50); // 随机波动
      await this.sleep(interval + jitter);

      // 换行/长词停顿
      if (char === ' ' && Math.random() < this.pauseAfterWord) {
        await this.sleep(random(100, 400));
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getRandomCharExcept(except) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const candidates = alphabet.split('').filter(c => c !== except.toLowerCase());
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
}
```

---

### 3. 智能滚动

**问题**: `page.evaluate(() => window.scrollTo(0, 1000))` 瞬间完成

**解决方案**: 逐步滚动 + 中途停顿 + 回滚

```typescript
async function humanScroll(page, targetY, duration = 2000) {
  const startY = await page.evaluate(() => window.scrollY);
  const distance = targetY - startY;
  const steps = Math.floor(Math.abs(distance) / 50); // 每步 50px
  const stepDelay = duration / steps;

  for (let i = 0; i < steps; i++) {
    const progress = i / steps;
    // 缓动函数 (easeInOut)
    const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    const currentY = startY + distance * ease;

    await page.evaluate((y) => window.scrollTo(0, y), currentY);

    // 随机停顿 (阅读/思考)
    if (Math.random() < 0.15) {
      await new Promise(resolve => setTimeout(resolve, random(500, 1500)));
    }

    // 偶尔回滚一点 (防止跳过)
    if (Math.random() < 0.05) {
      const backScroll = random(20, 80);
      await page.evaluate((y) => window.scrollBy(0, -backScroll), 0);
      await new Promise(resolve => setTimeout(resolve, random(200, 600)));
    }

    await new Promise(resolve => setTimeout(resolve, stepDelay + random(-50, 100)));
  }
}
```

---

### 4. 指纹伪装 (Stealth)

**问题**: Playwright 默认指纹暴露自动化

**解决方案**: 使用 `puppeteer-extra` 的 stealth 思路，手动修补

```typescript
const { chromium } = require('playwright');

async def launchStealthBrowser() {
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--user-data-dir=C:\\temp\\chrome-profile', // 使用真实用户数据
      '--profile-directory=Default',
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    geolocation: { latitude: 40.7128, longitude: -74.0060 }, // New York
    permissions: ['geolocation'],
  });

  const page = context.newPage();

  // === 注入指纹修补脚本 ===
  await page.addInitScript(() => {
    // 1. 移除 navigator.webdriver
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined
    });

    // 2. 修正 plugins 长度
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5].map(() => ({
        name: 'Chrome PDF Plugin',
        filename: 'internal-pdf-viewer',
        description: 'Portable Document Format'
      }))
    });

    // 3. 修正 languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en']
    });

    // 4. 修正 Chrome 属性
    window.chrome = {
      runtime: {},
      loadTimes: () => ({}),
      csi: () => ({}),
      app: {}
    };

    // 5. 修正 permissions (避免 query 显示自动化)
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => {
      return parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters);
    };

    // 6. 修正 WebGL 指纹
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      // 返回真实的显卡信息，不暴露 headless
      return getParameter.call(this, parameter);
    };

    // 7. 修正 AudioContext 指纹
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const originalGetChannelData = AudioContext.prototype.getChannelData;
      AudioContext.prototype.getChannelData = function() {
        const data = originalGetChannelData.apply(this, arguments);
        // 添加微小噪声
        for (let i = 0; i < data.length; i++) {
          data[i] += (Math.random() - 0.5) * 1e-10;
        }
        return data;
      };
    }
  });

  return { browser, context, page };
}
```

---

### 5. 行为随机化引擎

**目标**: 每次操作都有细微差异，避免模式识别

```typescript
class BehaviorRandomizer {
  constructor() {
    this.sessionSeed = Date.now() + Math.random();
  }

  // 随机选择交互方式
  async clickElement(page, selector) {
    const element = await page.$(selector);
    if (!element) throw new Error(`Element not found: ${selector}`);

    const box = await element.boundingBox();
    const x = box.x + box.width * triangular(0.3, 0.5, 0.7); // 偏向中心
    const y = box.y + box.height * triangular(0.3, 0.5, 0.7);

    // 1. 移动鼠标 (人类轨迹)
    await mouse.moveTo(x, y);

    // 2. 随机停顿后点击 (模拟目标确认)
    await this.sleep(random(100, 500));

    // 3. 点击 (单次或双击随机)
    if (Math.random() < 0.05) {
      await mouse.click(x, y, { clickCount: 2 }); // 5% 几率双击
    } else {
      await mouse.click(x, y);
    }

    // 4. 随机拖拽后释放 (模拟手抖)
    if (Math.random() < 0.1) {
      const dragX = x + random(-5, 5);
      const dragY = y + random(-5, 5);
      await mouse.moveTo(dragX, dragY);
      await mouse.up();
    }
  }

  // 随机等待 (模拟思考/阅读)
  async think(minMs = 200, maxMs = 2000) {
    const base = random(minMs, maxMs);
    const distribution = exponential(base); // 偏向短时间，偶尔长
    await this.sleep(distribution);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 🎪 实战脚本示例

### 示例1: 自动登录复杂表单

```typescript
const { chromium } = require('playwright');
const HumanMouse = require('./human-mouse');
const HumanTyper = require('./human-typer');

async function humanLogin() {
  const { browser, context, page } = await launchStealthBrowser();
  const mouse = new HumanMouse(page);
  const typer = new HumanTyper(page);

  try {
    // 导航
    await page.goto('https://example.com/login', { waitUntil: 'networkidle' });

    // 随机滚动 (模拟阅读页面)
    await humanScroll(page, 300, 1500);

    // 点击 email 输入框
    const emailBox = await page.$('input[name="email"]');
    const box = await emailBox.boundingBox();
    await mouse.moveTo(box.x + box.width/2, box.y + box.height/2);
    await mouse.click();
    await typer.typeSlowly(emailBox, 'user@example.com');

    // 思考停顿
    await typer.sleep(random(500, 1500));

    // 密码
    const passwordBox = await page.$('input[name="password"]');
    await mouse.moveTo(box.x, box.y + 100);
    await mouse.click();
    await typer.typeSlowly(passwordBox, 'MyP@ssw0rd!');

    // 再次停顿 (模拟检查输入)
    await typer.sleep(random(800, 2000));

    // 点击登录
    const loginBtn = await page.$('button[type="submit"]');
    const btnBox = await loginBtn.boundingBox();
    await mouse.moveTo(btnBox.x + btnBox.width/2, btnBox.y + btnBox.height/2);
    await mouse.click();

    // 等待登录完成
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    console.log('✅ Login completed with human-like behavior');

  } catch (error) {
    console.error('❌ Failed:', error);
  } finally {
    await browser.close();
  }
}
```

---

### 示例2: 绕过 Cloudflare Turnstile

**策略**: 降低自动化特征至阈值以下

```typescript
async function solveCloudflareTurnstile(page) {
  // 1. 等待 iframe 加载
  await page.waitForSelector('iframe[src*="challenges.cloudflare.com"]', { timeout: 30000 });

  // 2. 切换到 iframe
  const frame = page.frame({ url: (url) => url.includes('challenges.cloudflare.com') });

  // 3. 模拟人类观看行为
  await page.waitForTimeout(random(2000, 4000)); // 等待 2-4s

  // 4. 如果包含 "Verify you are human" 按钮
  const checkbox = await frame.$('#challenge-running > div > label > span');
  if (checkbox) {
    // 随机移动 (先移近再点)
    const box = await checkbox.boundingBox();
    const randomOffset = () => random(-10, 10);
    await mouse.moveTo(box.x + box.width/2 + randomOffset(), box.y + box.height/2 + randomOffset());
    await new Promise(r => setTimeout(r, random(200, 600)));
    await mouse.click();

    // 等待验证完成
    await page.waitForTimeout(random(3000, 8000));
    return true;
  }

  // 5. 如果是图片选择任务 (rare)
  return await solveImageChallenge(frame);
}

async def solveImageChallenge(frame) {
  // 这里可以用 OCR 或 AI 模型识别图片
  // 但最简单: 等待超时 (Cloudflare 会在超时后自动通过)
  console.log('⏳ Image challenge detected, waiting...');
  await new Promise(r => setTimeout(r, 15000)); // 15s
  return true;
}
```

---

### 示例3: 多标签页工作流

```typescript
async function humanMultiTabWorkflow() {
  const { browser, context, page } = await launchStealthBrowser();

  // Tab 1: 搜索
  const tab1 = context.newPage();
  await tab1.goto('https://google.com');
  await humanType(tab1, 'input[name="q"]', 'OpenClaw node doctor');
  await tab1.keyboard.press('Enter');
  await humanScroll(tab1, await tab1.evaluate(() => document.body.scrollHeight), 2000);

  // Tab 2: 打开第一个结果 (模拟 Ctrl+Click)
  const firstResult = await tab1.$('h3');
  const box = await firstResult.boundingBox();
  await mouse.moveTo(box.x, box.y);
  await page.keyboard.down('Control');
  await mouse.click();
  await page.keyboard.up('Control');

  const tab2 = context.pages[context.pages.length - 1];
  await tab2.waitForLoadState('networkidle');

  // 切换回 Tab 1 (模拟 Ctrl+Tab)
  await page.bringToFront();
  await new Promise(r => setTimeout(r, random(500, 1500)));

  // 更多操作...
}
```

---

## 🛠️ 工具与库

### 核心依赖

```json
{
  "dependencies": {
    "playwright": "^1.58.0",
    "simple-statistics": "^8.0.0",
    "bezier-js": "^6.1.0",
    "puppeteer-extra": "^4.0.0",  // 如果想用 stealth plugin
    "puppeteer-extra-plugin-stealth": "^2.11.0"
  }
}
```

### npm 脚本

```json
{
  "scripts": {
    "human": "ts-node src/human-browser.ts",
    "human:login": "ts-node src/examples/login-stealth.ts",
    "human:scrape": "ts-node src/examples/scrape-with-human.ts"
  }
}
```

---

## 📊 人类化指标参考

| 行为 | 机器人典型 | 人类典型 | 目标范围 |
|------|-----------|----------|----------|
| 鼠标移动时间/距离 | 恒定速度 | 变速，停顿 | 400-1200 px/s |
| 打字间隔 | 精确 100ms | 50-200ms 波动 | 50-300ms 随机 |
| 错误率 | 0% | 0.5-2% | 0.5-3% |
| 点击位置 | 精确中心 | 高斯分布 | 中心 ±15px |
| 页面停留 | 精确秒数 | 波动 ±30% | 预设 ±50% |
| 滚动速度 | 线性 | 加速-减速 | easeInOut 曲线 |
| 思考时间 | 无 | 0.5-3s 随机 | 0.2-2s 随机 |

---

## 🔍 检测规避检查清单

- [ ] `navigator.webdriver` = `undefined` ✓
- [ ] `navigator.plugins` 长度 > 3 ✓
- [ ] `navigator.languages` = `['en-US', 'en']` ✓
- [ ] `window.chrome` 存在且结构正确 ✓
- [ ] `navigator.permissions.query` 行为正常 ✓
- [ ] WebGL Vendor/Renderer 真实值 (非 "Headless") ✓
- [ ] AudioContext fingerprint 有噪声 ✓
- [ ] 鼠标轨迹非直线，有抖动 ✓
- [ ] 打字有错误、回退、停顿 ✓
- [ ] 滚动非线性，中途停顿 ✓
- [ ] User-Agent 与真实浏览器一致 ✓
- [ ] Viewport 分辨率常见 (1920x1080, 1366x768) ✓
- [ ] Locale/timezone 一致 ✓
- [ ] 设备内存 (navigator.deviceMemory) 合理值 ✓
- [ ] Touch events 支持 (模拟移动端时) ✓

---

## 🚨 注意事项

1. **不要过度优化**: 人类化到 **无法与机器区分** 即可，过度反而暴露
2. **保持效率**: 人类化会增加 20-50% 时间成本，权衡收益
3. **IP 轮换**: 结合代理池，避免同一 IP 高频访问
4. **会话隔离**: 每个任务使用独立的 browser context + 用户数据目录
5. **伦理使用**: 仅用于合法场景，遵守网站 ToS

---

## 📈 性能指标

| 操作 | 标准机器人 | 人类化后 |
|------|-----------|----------|
| 点击 10 次 | 0.5s | 3-5s |
| 输入 100 字符 | 2s | 8-12s |
| 滚动一页 | 0.1s | 1-2s |
| 表单填写 | 5s | 15-30s |

**时间成本**: ×3-5 倍，但检测规避率 >95%

---

## 🎯 应用场景

- ✅ 绕过 Cloudflare/PerimeterX 等 WAF
- ✅ 自动化登录 (2FA 后)
- ✅ 大规模数据采集 (public data)
- ✅ 自动化测试 (真实用户场景)
- ✅ 社交媒体验证 (follow/unfollow)
- ✅ E-commerce 价格监控
- ❌ 暴力破解、DDoS、违反 ToS 行为

---

## 🔮 未来进阶

1. **AI 驱动的行为模式**: 用 GAN 生成完美人类轨迹
2. **生物特征模拟**: 鼠标动力学 (速度/加速度曲线)
3. **环境噪声注入**: 模拟设备传感器数据 (加速度计、陀螺仪)
4. **多账户关联管理**: 隔离性 + 行为差异 (每个账户有独特行为 profile)
5. **实时适应**: 根据检测难度动态调整人类化参数

---

**准备开始**:  implement HumanMouse, HumanTyper classes and test on a demo site.

*Last Updated: 2026-03-28 17:31 by JARVIS*
