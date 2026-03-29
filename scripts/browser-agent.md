# 浏览器自动化工具集
# 基于 Playwright（已安装）

## 快速开始

```javascript
// 示例1: 打开页面并截图
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
})();
```

## 常见操作

### 打开页面
```javascript
await page.goto('https://example.com', { waitUntil: 'networkidle' });
```

### 等待元素
```javascript
await page.waitForSelector('.my-class', { timeout: 5000 });
```

### 点击按钮
```javascript
await page.click('button.submit');
```

### 填表
```javascript
await page.fill('input[name="email"]', 'test@example.com');
```

### 获取内容
```javascript
const text = await page.textContent('h1');
const html = await page.content();
```

### 截图
```javascript
await page.screenshot({ path: 'page.png', fullPage: true });
```

### 执行 JS
```javascript
const result = await page.evaluate(() => document.title);
```

## 资源
- https://playwright.dev/docs/intro
- 支持 Chromium, Firefox, WebKit