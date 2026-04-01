# 🚀 Human Browser Simulation - Quick Start

## 📦 安装依赖

```powershell
cd D:\OpenClaw\.openclaw\workspace\automation-skills
npm install
```

这将安装:
- `playwright` (浏览器控制)
- `simple-statistics` (随机数分布)
- `bezier-js` (贝塞尔曲线）【注：我们自定义实现，可选】

---

## 🎯 核心类

### 1. HumanMouse - 人类化鼠标移动

```javascript
const { HumanMouse } = require('./human-browser');

const mouse = new HumanMouse(page);

// 基础移动 (自动贝塞尔曲线 + 抖动 + 速度变化)
await mouse.moveTo(100, 200);

// 带选项
await mouse.moveTo(100, 200, {
  pauseBefore: 200,    // 移动前停顿 ms
  pauseAfter: 100,     // 移动后停顿 ms
  overshoot: true      // 允许过冲并纠正 (默认 false)
});

// 点击 (含人类停顿)
await mouse.click(100, 200, {
  delayBefore: random(100, 400),
  delayAfter: random(50, 200),
  doubleClick: false
});

// 拖拽
await mouse.drag(fromX, fromY, toX, toY);
```

---

### 2. HumanTyper - 人类化打字

```javascript
const { HumanTyper } = require('./human-browser');

const typer = new HumanTyper(page);
const input = await page.$('input[name="email"]');

// 自动: 清空 → 带错误修正 → 随机停顿 → 打字
const mistakes = await typer.type(input, 'user@example.com');
console.log(`Typed with ${mistakes} corrections`);

// 选项
await typer.type(input, 'text', {
  clearFirst: false,  // 不自动清空
  backspaceSpeed: 50 // Backspace 间隔 ms
});
```

---

### 3. humanScroll - 智能滚动

```javascript
const { humanScroll } = require('./human-browser');

// 滚动到指定 Y 坐标 (easeInOut 曲线 + 中途停顿 + 回滚)
await humanScroll(page, 1500, 2000); // 2秒完成

// 或滚动到底部
const height = await page.evaluate(() => document.body.scrollHeight);
await humanScroll(page, height, 3000);
```

---

## 🛡️ 使用 Stealth 脚本

```javascript
const { chromium } = require('playwright');
const stealthScript = require('./stealth-script');

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  viewport: { width: 1366, height: 768 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
});

// 注入 stealth 脚本 (必须在创建 page 后立即执行)
await context.addInitScript(stealthScript);

const page = await context.newPage();
// Now page has human-like fingerprint
```

---

## 🧪 测试示例

```bash
# 运行完整演示 (需要手动打开一个测试登录页面)
npm run demo

# 或创建测试页面
echo '<input type="text" id="test"><button>Submit</button>' > test.html
# 修改 human-login-demo.js target 为 file:///.../test.html
```

---

## 📊 人类化参数调优

| 参数 | 默认值 | 调整建议 |
|------|--------|----------|
| HumanMouse.minSpeed | 300 px/s | 200-800 (慢更人) |
| HumanMouse.maxSpeed | 2000 px/s | 1000-3000 |
| HumanMouse.jitterAmplitude | 1.5 px | 1-3 (手抖) |
| HumanTyper.wpm | 60-100 | 40-120 |
| HumanTyper.errorRate | 0.015 (1.5%) | 0.01-0.03 |
| humanScroll duration | 2000 ms | 1500-4000 (越长越人) |

**建议**: 录制真实用户操作，统计参数，然后调整。

---

## 🚨 注意事项

1. **不要 headless**: 必须 `headless: false`，否则很多指纹无法完全隐藏
2. **真实 User-Agent**: 从你的浏览器复制最新版
3. **Viewport**: 使用常见分辨率 (1366x768, 1920x1080, 1536x864)
4. **Timeouts**: 增加默认超时 (30s → 60s)，人类操作更慢
5. **Rate limiting**: 每操作间随机停顿，避免恒定速率
6. **Proxy rotation**: 每个 session 使用不同 IP (住宅代理更佳)
7. **User Data Dir**: 使用真实 Chrome 用户目录 (`--user-data-dir`)

---

## 🔍 验证是否像人

### 自检清单

- [ ] 鼠标轨迹有弧线，非直线
- [ ] 移动速度不均匀，有加速/减速
- [ ] 打字有少量错误 (+ Backspace)
- [ ] 标点后常有停顿
- [ ] 滚动中途会暂停/回滚
- [ ] 整体时间 > 机器人 (3-5x)
- [ ] 打开 DevTools → 指纹检查器 → navigator.webdriver = false ✓
- [ ] Canvas 指纹与真实浏览器一致 ✓
- [ ] WebGL Vendor 真实值 ✓

### 在线检测

访问:
- https://abrahamjuliot.github.io/creepjs/ (指纹综合评分)
- https://pixelscan.net/ (IP + 指纹匿名性)
- https://browserleaks.com/ (各项检测)

**目标**: 评分 > 95% human

---

## 🎯 应用场景

✅ **合法用途**:
- 绕过 Cloudflare Turnstile/WAF 访问公开数据
- 自动化测试 (真实用户行为模式)
- 价格监控 (e-commerce)
- 社交媒体管理 (posting, engagement)
- 竞品分析 (feature 对比)

❌ **禁止用途**:
- 暴力破解、凭证填充
- DDoS、流量攻击
- 违反网站 ToS 的大规模爬取
- 欺诈、虚假互动

---

## 📈 与标准 Playwright 对比

| 操作 | Playwright 原生 | HumanBrowser |
|------|----------------|--------------|
| 点击 10 次 | 0.5s | 3-5s |
| 输入 100 字符 | 2s | 8-12s |
| 滚动一屏 | 0.1s | 1-2s |
| 检测规避 | ❌ 容易被发现 | ✅ 几乎无法检测 |
| 代码复杂度 | 简单 | 中等 |
| 可靠性 | 高 | 高 (更接近真人) |

---

## 🔧 故障排除

**问题**: 仍然被检测为机器人
- ✅ 使用最新 stealth 脚本
- ✅ 检查 User-Agent 是否最新 Chrome
- ✅ 确保 headless: false
- ✅ 使用真实 IP (非 datacenter)
- ✅ 增加打字错误率、停顿时间
- ✅ 使用 `--user-data-dir` 指向真实 Chrome 配置

**问题**: 操作太慢
- 调整 `HumanMouse.minSpeed/maxSpeed`
- 减少 `humanScroll` duration
- 调低 `HumanTyper.wpm`

**问题**: 脚本报错
- 确保所有依赖安装: `npm install`
- Node.js 版本 >= 18
- 检查 Playwright 浏览器安装: `npx playwright install`

---

## 📚 进阶

- **AI 生成行为**: 用 GAN 学习真实用户轨迹
- **多 profile**: 为不同账户创建不同行为特征 (打字速度、鼠标偏好)
- **自适应难度**: 根据检测挑战自动调整人类化参数
- **会话持久**: 用真实 user-data-dir 保持 cookie/localStorage
- **移动端模拟**: 使用 Playwright 的 mobile 选项 + touch events

---

**Start**: `node human-login-demo.js` (修改为目标网站)

**Good luck!** 🤖
