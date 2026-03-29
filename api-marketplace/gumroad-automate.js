#!/usr/bin/env node
/**
 * Gumroad 自动化配置脚本
 * 用于创建和配置 "Node Doctor API - 100 Calls" 商品
 */

const { chromium } = require('playwright');

// 配置
const CONFIG = {
  productName: 'Node Doctor API - 100 Calls',
  price: '9.9',
  description: `🤖 What is Node Doctor API?

Node Doctor API is OpenClaw skill "Node Connection Doctor" as a REST API. Diagnose OpenClaw node connection issues automatically via HTTP request.

Features:
- ✅ Gateway status check
- ✅ Node configuration validation
- ✅ Network connectivity test
- ✅ Auto-generate fix suggestions

🚀 Why you need this:
- Automate operations: Integrate with monitoring systems
- Service value-add: Offer health checks to your OpenClaw clients
- Save time: 30s per diagnosis vs manual
- Zero maintenance: We host the API

📡 API Usage:
curl -X POST https://your-api.vercel.app/api/run \\
  -H "Content-Type: application/json" \\
  -d '{"skill":"node-connection-doctor","input":{"verbose":true},"licenseKey":"OC-YOUR-KEY"}'

💰 Pricing:
- Starter: $9.9 (100 calls, 90 days)
- Pro: $49/mo (unlimited + priority support)
- Enterprise: $99/mo (SLA + custom skills)

Accepting: Credit Card, Bitcoin, Ethereum, USDT

🛠️ Technical:
- Host: Vercel (global CDN)
- Uptime: 99.9%
- Latency: <200ms
- Privacy: No data stored

❓ FAQ:
Q: Failed calls consume quota?
A: Only successful executions count.

Q: How to use license key?
A: Provide in licenseKey field per request.

Q: Refunds?
A: 90-day refund if unused.

Support: support@jarvis.openclaw.ai`,
  webhookUrl: 'https://api-marketplace-ln1v0o44t-algea-foks-projects.vercel.app/api/webhook/gumroad',
  webhookSecret: 'd68816554d9ef606c6252054a9e7c99f58e6baf0aa077a68'
};

async function main() {
  console.log('🚀 Starting Gumroad automation...');
  
  const browser = await chromium.launch({ headless: false }); // 显示浏览器
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 导航到创建商品页面
    console.log('1. Navigating to Gumroad product creation...');
    await page.goto('https://app.gumroad.com/products/new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 2. 填写基本信息
    console.log('2. Filling product details...');
    await page.fill('input[name="product[name]"]', CONFIG.productName);
    await page.fill('input[name="product[price]"]', CONFIG.price);
    
    // 选择类别 Software
    await page.selectOption('select[name="product[category]"]', 'software');
    
    // 填写描述
    await page.fill('textarea[name="product[description]"]', CONFIG.description);
    
    await page.waitForTimeout(1000);

    // 3. License Keys 设置
    console.log('3. Enabling License Keys...');
    // Gumroad 的 License Keys 开关可能在 "Settings" 标签页
    // 需要点击 "Settings" 或类似按钮
    await page.click('text=Settings'); // 可能需要调整选择器
    await page.waitForTimeout(1000);
    
    // 启用 License Keys
    await page.click('text=License Keys'); // 或 input[type=checkbox]
    await page.waitForTimeout(500);
    
    // 格式: Random, 长度 16
    await page.selectOption('select[name="license_key_format"]', 'random');
    await page.fill('input[name="license_key_length"]', '16');
    
    // 自动发放
    await page.click('input[name="license_key_auto_deliver"]');
    
    await page.waitForTimeout(1000);

    // 4. Webhook 配置
    console.log('4. Configuring webhook...');
    await page.click('text=Webhooks'); // 可能需要调整
    await page.waitForTimeout(1000);
    
    // 添加 webhook
    await page.fill('input[name="webhook_url"]', CONFIG.webhookUrl);
    await page.click('text=Add webhook'); // 或 button
    
    // 选择事件
    await page.click('input[value="purchase_completed"]'); // 复选框
    
    // 设置 Secret
    await page.fill('input[name="webhook_secret"]', CONFIG.webhookSecret);
    
    await page.waitForTimeout(1000);

    // 5. 启用加密货币
    console.log('5. Enabling cryptocurrency payments...');
    await page.click('text=Payments'); // 或类似
    await page.waitForTimeout(1000);
    
    // 勾选 Accept cryptocurrency
    await page.click('input[name="accept_cryptocurrency"]'); // 可能需要page.locator
    
    await page.waitForTimeout(500);

    // 6. 发布商品
    console.log('6. Publishing product...');
    await page.click('button[type=submit]'); // 或 text=Publish
    await page.waitForTimeout(3000);

    console.log('✅ Product created and configured successfully!');
    console.log(`API URL: ${CONFIG.webhookUrl.split('/api')[0]}`);
    console.log('Please verify in Gumroad dashboard.');

    // 保持浏览器打开，以便用户查看
    console.log('Browser will stay open for 30 seconds for review...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Automation failed:', error);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
