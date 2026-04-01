#!/usr/bin/env node

/**
 * 快速可行性测试 - 5分钟验证机会扫描
 */

const BrowserAgent = require('./browser-agent.js');

(async () => {
  const results = {
    reddit: null,
    producthunt: null,
    hackernews: null,
    success: false
  };

  const agent = new BrowserAgent({ headless: true });
  await agent.start();

  try {
    // 测试1: Reddit r/microsaas
    console.log('正在测试 Reddit 访问...');
    await agent.goto('https://www.reddit.com/r/microsaas/', { waitUntil: 'domcontentloaded' });
    results.reddit = '✅ 访问成功';
    console.log('✅ Reddit 访问成功');

    // 测试2: Product Hunt
    console.log('正在测试 Product Hunt 访问...');
    await agent.goto('https://www.producthunt.com/posts', { waitUntil: 'domcontentloaded' });
    results.producthunt = '✅ 访问成功';
    console.log('✅ Product Hunt 访问成功');

    // 测试3: Hacker News
    console.log('正在测试 Hacker News 访问...');
    await agent.goto('https://news.ycombinator.com/', { waitUntil: 'domcontentloaded' });
    results.hackernews = '✅ 访问成功';
    console.log('✅ Hacker News 访问成功');

    results.success = true;

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    results.error = error.message;
  } finally {
    await agent.close();
  }

  console.log('\n=== 测试结果 ===');
  console.log(JSON.stringify(results, null, 2));
  console.log('\n🎯 结论: 浏览器自动化工具已就绪，可以用于 opportunity-scanner');
})().catch(console.error);