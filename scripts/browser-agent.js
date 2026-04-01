#!/usr/bin/env node

/**
 * OpenClaw Browser Agent
 * 封装的浏览器自动化工具
 * 依赖: playwright (已全局安装)
 */

const { chromium } = require('playwright');

class BrowserAgent {
  constructor(options = {}) {
    this.headless = options.headless !== false; // 默认无头模式
    this.browser = null;
    this.page = null;
  }

  /**
   * 启动浏览器（带反检测）
   */
  async start() {
    // 反检测配置
    const args = [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080'
    ];

    this.browser = await chromium.launch({
      headless: this.headless,
      args: this.headless ? args : []
    });

    this.page = await this.browser.newPage({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-US',
      timezoneId: 'Asia/Shanghai'
    });

    // 注入反检测脚本
    await this.page.addInitScript(() => {
      // 隐藏 webdriver
      Object.defineProperty(navigator, 'webdriver', { get: () => false });

      // 隐藏插件
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5].map(() => ({
          0: { type: 'application/x-google-chrome-pdf' },
          description: 'Portable Document Format',
          filename: 'internal-pdf-viewer',
          length: 1,
          name: 'Chrome PDF Plugin'
        }))
      });

      // 隐藏语言
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });

      // 模拟 Chrome
      window.chrome = {
        runtime: {},
        loadTimes: () => ({}),
        csi: () => ({}),
        app: {}
      };

      // 移除 Playwright 特征
      delete window.__playwright;
      delete window.__pw_current_driver__;

      // 模拟权限查询
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
      );
    });

    this.page.setDefaultTimeout(60000);
    return this;
  }

  /**
   * 导航到页面
   * @param {string} url
   * @param {object} options - waitUntil: 'load'|'domcontentloaded'|'networkidle'
   */
  async goto(url, options = { waitUntil: 'networkidle' }) {
    await this.page.goto(url, options);
    return this;
  }

  /**
   * 等待选择器出现
   * @param {string} selector
   * @param {number} timeout
   */
  async waitFor(selector, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout });
    return this;
  }

  /**
   * 点击元素
   * @param {string} selector
   */
  async click(selector) {
    await this.page.click(selector);
    return this;
  }

  /**
   * 填写表单
   * @param {string} selector
   * @param {string} value
   */
  async fill(selector, value) {
    await this.page.fill(selector, value);
    return this;
  }

  /**
   * 获取元素文本
   * @param {string} selector
   */
  async text(selector) {
    return await this.page.textContent(selector);
  }

  /**
   * 获取页面所有文本
   */
  async getAllText() {
    return await this.page.evaluate(() => document.body.innerText);
  }

  /**
   * 截图
   * @param {string} path
   * @param {boolean} fullPage
   */
  async screenshot(path = 'screenshot.png', fullPage = false) {
    await this.page.screenshot({ path, fullPage });
    return this;
  }

  /**
   * 执行 JavaScript
   * @param {string} script
   */
  async eval(script) {
    return await this.page.evaluate(script);
  }

  /**
   * 获取页面标题
   */
  async title() {
    return await this.page.title();
  }

  /**
   * 获取当前 URL
   */
  async url() {
    return this.page.url();
  }

  /**
   * 关闭浏览器
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI 模式: 直接运行脚本执行简单任务
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  (async () => {
    const agent = new BrowserAgent({ headless: true });
    await agent.start();

    try {
      if (command === 'screenshot' && args[1]) {
        await agent.goto(args[1]);
        await agent.screenshot(args[2] || 'screenshot.png');
        console.log('Screenshot saved:', args[2] || 'screenshot.png');
      } else if (command === 'text' && args[1]) {
        await agent.goto(args[1]);
        const text = await agent.getAllText();
        console.log(text);
      } else if (command === 'title' && args[1]) {
        await agent.goto(args[1]);
        console.log(await agent.title());
      } else {
        console.log(`
OpenClaw Browser Agent

Usage:
  node browser-agent.js screenshot <url> [output.png]
  node browser-agent.js text <url>
  node browser-agent.js title <url>

Examples:
  node browser-agent.js screenshot https://example.com page.png
  node browser-agent.js text https://example.com
        `);
      }
    } finally {
      await agent.close();
    }
  })();
}

module.exports = BrowserAgent;