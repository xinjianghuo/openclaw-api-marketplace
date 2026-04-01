# Playwright 自动化学习笔记

## 📚 学习目标

- 掌握浏览器自动化基础
- 能够编写稳定的自动化脚本
- 学会绕过反检测机制
- 应用于实际项目 (Gumroad 配置、数据抓取等)

---

## 1. 基础概念

### 1.1 什么是 Playwright?

- Microsoft 开发的浏览器自动化工具
- 支持: Chrome, Firefox, Safari (WebKit)
- 跨平台: Windows, macOS, Linux
- 特点: 速度快、稳定性高、API 友好

### 1.2 安装

```bash
npm init -y
npm install playwright
# 或
npm install -D @playwright/test
```

### 1.3 快速开始

```javascript
const { chromium } = require('playwright');

(async () => {
  // 启动浏览器
  const browser = await chromium.launch({ headless: false });
  
  // 创建页面
  const page = await browser.newPage();
  
  // 导航
  await page.goto('https://example.com');
  
  // 点击
  await page.click('text=Login');
  
  // 填表
  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('input[name="password"]', 'password123');
  
  // 提交
  await page.click('button[type="submit"]');
  
  // 等待
  await page.waitForSelector('.dashboard');
  
  // 截图
  await page.screenshot({ path: 'screenshot.png' });
  
  // 关闭
  await browser.close();
})();
```

---

## 2. 选择器 (Selectors)

### 2.1 CSS 选择器

```javascript
await page.click('#submit');           // id
await page.click('.button');          // class
await page.click('input[type="text"]'); // attribute
await page.click('div > a');          // 子元素
```

### 2.2 文本选择器

```javascript
await page.click('text=Login');       // 精确文本
await page.click('text=Log in');      // 部分匹配
await page.click('text=Submit');      
```

### 2.3 角色选择器 (ARIA)

```javascript
await page.click('[role="button"]');
await page.fill('[placeholder="Email"]', 'user@example.com');
```

### 2.4 XPath

```javascript
await page.click('//button[contains(text(),"Submit")]');
```

---

## 3. 等待机制

### 3.1 固定等待 (不推荐)

```javascript
await page.waitForTimeout(1000); // 1秒
```

### 3.2 条件等待 (推荐)

```javascript
// 等待元素出现
await page.waitForSelector('.dashboard');

// 等待元素消失
await page.waitForSelector('.loading', { state: 'hidden' });

// 等待文本出现
await page.waitForFunction(() => document.querySelector('.status').textContent === 'Ready');

// 等待导航完成
await page.waitForURL('**/dashboard');
```

---

## 4. 输入与交互

```javascript
// 填充输入框
await page.fill('input[name="email"]', 'user@example.com');

// 清除并输入
await page.clear('input[name="q"]');
await page.type('input[name="q"]', 'hello world', { delay: 100 }); // 模拟打字

// 选择下拉框
await page.selectOption('select#country', 'US');

// 点击复选框/单选框
await page.check('input[name="agree"]');
await page.uncheck('input[name="subscribe"]');

// 拖拽
await page.dragAndDrop('#source', '#target');

// 文件上传
await page.setInputFiles('input[type="file"]', 'path/to/file.txt');
```

---

## 5. 处理弹窗

```javascript
// 监听弹窗
const dialog = await page.waitForEvent('dialog');
console.log(dialog.message());
await dialog.accept();  // 确定
// await dialog.dismiss(); // 取消

// 确认/取消框
const [confirm] = await Promise.all([
  page.waitForEvent('confirm'),
  page.click('button:has-text("Delete")')
]);
await confirm.accept();
```

---

## 6. 上下文 (Context) 与页面 (Page)

```javascript
// 创建新上下文 (类似新浏览器窗口)
const context = await browser.newContext();

// 使用上下文创建页面
const page = await context.newPage();

// 多个页面
const page1 = await context.newPage();
const page2 = await context.newPage();

// 关闭上下文 (关闭所有页面)
await context.close();
```

---

## 7. 浏览器启动选项

```javascript
const browser = await chromium.launch({
  headless: false,            // false = 看得到浏览器窗口
  slowMo: 50,                 // 每个操作慢 50ms (便于调试)
  args: [
    '--disable-blink-features=AutomationControlled', // 反检测
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ]
});
```

---

## 8. 使用真实用户数据 (绕过登录)

```javascript
const userDataDir = 'C:\\Users\\YourName\\AppData\\Local\\Google\\Chrome\\User Data\\Default';

const browser = await chromium.launchPersistentContext(userDataDir, {
  headless: false
});

const page = await browser.newPage();
// 现在 page 已经使用你的 Chrome 配置，包括登录状态
await page.goto('https://gumroad.com');
// 应该已经登录了
```

---

## 9. 常见问题与解决

### 9.1 被检测为自动化

**现象**: "This browser or app may not be secure"

**解决**:
- 使用 `launchPersistentContext` + 真实用户数据
- 添加反检测参数:
  ```javascript
  args: [
    '--disable-blink-features=AutomationControlled',
    '--disable-web-security',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...'
  ]
  ```
- 隐藏 `webdriver` 属性 (Playwright v1.40+ 默认已处理)

### 9.2 元素找不到

**检查**:
- 页面是否加载完成? (`await page.waitForLoadState()`)
- 元素是否在 iframe 中? (需要 `frame = page.frame(...)`)
- 选择器是否正确? (用 F12 复制 selector)
- 元素是否被遮挡? (使用 `{ force: true }` 参数)

### 9.3 稳定等待

不要用 `waitForTimeout`，用 `waitForSelector` 或 `waitForFunction`。

---

## 10. 完整示例: 登录并操作

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launchPersistentContext(
    'C:\\Users\\YourName\\AppData\\Local\\Google\\Chrome\\User Data\\Default',
    { headless: false }
  );
  
  const page = await browser.newPage();
  
  // 去登录页
  await page.goto('https://app.gumroad.com/login');
  await page.waitForLoadState('networkidle');
  
  // 填表
  await page.fill('input[name="email"]', 'your@email.com');
  await page.fill('input[name="password"]', 'yourpassword');
  
  // 点击登录
  await page.click('button[type="submit"]');
  
  // 等待登录完成
  await page.waitForURL('**/dashboard');
  
  console.log('Login successful!');
  
  // 继续其他操作...
  
  await browser.close();
})();
```

---

## 11. 最佳实践

- ✅ **始终等待**元素出现或导航完成再操作
- ✅ **使用 slowMo** 调试 (100ms)
- ✅ **截图记录**失败时的状态 (`page.screenshot()`)
- ✅ **清理资源** (关闭 browser/context)
- ✅ **避免硬编码等待** (`waitForTimeout` 仅用于调试)
- ✅ **处理异常** (try/catch + finally close)

---

## 12. 进阶主题 (后续学习)

- 网络请求拦截 (`page.route()`)
- 自定义上下文 (修改 geolocation, permissions)
- 视频录制 (`videoPath` 选项)
- 测试框架集成 (`@playwright/test`)
- Docker 容器化运行

---

## 🎯 下一步实战

**项目**: 自动配置 Gumroad 产品

1. 登录 Gumroad
2. 导航到产品编辑页
3. 添加 License Key 模块
4. 配置参数
5. 发布

---

**完成时间**: 1-2 小时

---

*Last Updated: 2026-03-28 13:15 by JARVIS*
