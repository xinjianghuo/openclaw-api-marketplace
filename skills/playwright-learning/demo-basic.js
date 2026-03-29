#!/usr/bin/env node
/**
 * Playwright 基础演示
 * 打开浏览器，访问网站，演示基本操作
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting Playwright demo...');
  
  // 1. 启动浏览器 (headless: false = 显示窗口)
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100, // 每个操作慢 100ms，便于观察
    args: [
      '--disable-blink-features=AutomationControlled'
    ]
  });
  
  console.log('✅ Browser launched');
  
  // 2. 创建新页面
  const page = await browser.newPage();
  console.log('✅ New page created');
  
  try {
    // 3. 导航到示例网站
    console.log('📍 Navigating to https://example.com...');
    await page.goto('https://example.com', { waitUntil: 'networkidle' });
    
    // 4. 获取页面标题
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // 5. 获取页面文本
    const h1 = await page.textContent('h1');
    console.log(`📝 Main heading: ${h1}`);
    
    // 6. 截图
    await page.screenshot({ path: 'example-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved: example-screenshot.png');
    
    // 7. 演示点击 (如果示例网站有链接)
    const links = await page.$$('a');
    console.log(`🔗 Found ${links.length} links on page`);
    if (links.length > 0) {
      const firstLinkText = await links[0].textContent();
      console.log(`   First link: "${firstLinkText.trim()}"`);
    }
    
    // 8. 等待观察
    console.log('⏳ Waiting 3 seconds before closing...');
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // 9. 关闭浏览器
    await browser.close();
    console.log('✅ Browser closed. Demo completed!');
  }
  
  console.log('\n📚 Next steps:');
  console.log('1. Read PLAYWRIGHT-LEARNING.md');
  console.log('2. Try modifying this script');
  console.log('3. Practice with real website (e.g., Gumroad login)');
  
})();
