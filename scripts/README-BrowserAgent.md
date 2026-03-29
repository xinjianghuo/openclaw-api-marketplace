# OpenClaw 浏览器自动化工具 (Browser Agent)

基于 Playwright 的浏览器操控能力，支持完整的用户交互模拟。

---

## 🚀 快速开始

### 安装依赖

```bash
npm init -y
npm install playwright
npx playwright install chromium
```

### 命令行使用

```bash
# 截图
node browser-agent.js screenshot <URL> [输出文件名]

# 获取页面文本
node browser-agent.js text <URL>

# 获取页面标题
node browser-agent.js title <URL>
```

### 代码中使用

```javascript
const BrowserAgent = require('./browser-agent.js');

(async () => {
  const agent = new BrowserAgent({ headless: true });
  await agent.start();

  await agent.goto('https://example.com');
  await agent.waitFor('h1');
  const title = await agent.title();
  console.log('Title:', title);

  await agent.screenshot('page.png');
  await agent.close();
})();
```

---

## 📋 支持的操作

| 方法 | 说明 | 示例 |
|------|------|------|
| `goto(url, options)` | 导航到页面 | `await agent.goto('https://example.com')` |
| `waitFor(selector, timeout)` | 等待元素出现 | `await agent.waitFor('.btn')` |
| `click(selector)` | 点击元素 | `await agent.click('button.submit')` |
| `fill(selector, value)` | 填写输入框 | `await agent.fill('#email', 'test@test.com')` |
| `text(selector)` | 获取元素文本 | `const t = await agent.text('h1')` |
| `getAllText()` | 获取页面所有文本 | `const body = await agent.getAllText()` |
| `screenshot(path, fullPage)` | 截图 | `await agent.screenshot('page.png')` |
| `eval(script)` | 执行 JavaScript | `const result = await agent.eval('document.title')` |
| `title()` | 获取页面标题 | `const t = await agent.title()` |
| `url()` | 获取当前 URL | `const u = await agent.url()` |
| `close()` | 关闭浏览器 | `await agent.close()` |

---

## 🎯 典型用途

### 1. 自动化登录
```javascript
await agent.goto('https://site.com/login');
await agent.fill('#username', 'myuser');
await agent.fill('#password', 'mypassword');
await agent.click('button[type="submit"]');
```

### 2. 抓取动态内容
```javascript
await agent.goto('https://news.site.com');
await agent.waitFor('.article-list');
const articles = await agent.eval(() => {
  return Array.from(document.querySelectorAll('.article')).map(a => a.innerText);
});
```

### 3. 测试网页功能
```javascript
await agent.goto('https://app.example.com');
await agent.click('#menu-button');
await agent.waitFor('#dropdown');
const isVisible = await agent.eval(() => {
  return document.querySelector('#dropdown').offsetHeight > 0;
});
```

### 4. 生成截图用于报告
```javascript
await agent.goto('https://dashboard.example.com');
await agent.screenshot('dashboard-report.png', true); // fullPage
```

---

## ⚙️ 配置选项

```javascript
const agent = new BrowserAgent({
  headless: false, // false = 显示浏览器窗口（调试用）
});
```

---

## 📦 依赖

- `playwright` (已安装)
- 浏览器: Chromium (首次运行自动下载)

---

## 🔧 故障排除

| 问题 | 解决方案 |
|------|----------|
| "Cannot find module 'playwright'" | 确保在项目目录运行 `npm install playwright` |
| 浏览器未自动下载 | 运行 `npx playwright install chromium` |
| 性能慢 | 使用 `headless: true` 或无头模式 |
| 元素找不到 | 增加 `waitFor` 超时时间，或检查选择器 |

---

*Created: 2026-03-26*
*By: JARVIS for OpenClaw*