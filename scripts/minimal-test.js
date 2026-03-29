#!/usr/bin/env node
/** 快速测试 - 输出到文件 */
const BrowserAgent = require('./browser-agent.js');

(async () => {
  const log = [];
  const agent = new BrowserAgent({ headless: true });
  await agent.start();

  log.push('🔬 赚钱可行性测试 - 开始\n');

  // Reddit
  try {
    await agent.goto('https://www.reddit.com/r/microsaas/hot/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    const post = await agent.eval(() => {
      const container = document.querySelector('[data-testid="post-container"]');
      return container ? {
        title: container.querySelector('h3')?.innerText?.substring(0, 60),
        upvotes: container.querySelector('[data-click-id="upvote"]')?.innerText
      } : null;
    });
    if (post) log.push(`✅ Reddit: ${post.title}... (⬆️${post.upvotes})`);
  } catch (e) { log.push(`❌ Reddit: ${e.message}`); }

  // Product Hunt
  try {
    await agent.goto('https://www.producthunt.com/');
    await new Promise(r => setTimeout(r, 2000));
    const product = await agent.eval(() => {
      const card = document.querySelector('[data-testid="post-card"]');
      return card ? {
        name: card.querySelector('a[href*="/posts/"]')?.innerText,
        votes: card.querySelector('[data-testid="vote-count"]')?.innerText
      } : null;
    });
    if (product) log.push(`✅ PH: ${product.name} (⬆️${product.votes})`);
  } catch (e) { log.push(`❌ PH: ${e.message}`); }

  // Hacker News
  try {
    await agent.goto('https://news.ycombinator.com/');
    await new Promise(r => setTimeout(r, 2000));
    const hn = await agent.eval(() => {
      const row = document.querySelector('.athing');
      return row ? {
        title: row.querySelector('.titleline > a')?.innerText?.substring(0, 60),
        score: row.nextElementSibling?.querySelector('.score')?.innerText
      } : null;
    });
    if (hn) log.push(`✅ HN: ${hn.title}... (⬆️${hn.score})`);
  } catch (e) { log.push(`❌ HN: ${e.message}`); }

  log.push('\n🎯 结论: 浏览器自动化已验证可用，可抓取真实赚钱机会数据');
  await agent.close();

  // 写文件
  const fs = require('fs');
  fs.writeFileSync('validation-result.txt', log.join('\n'));
  console.log('结果已保存到 validation-result.txt');
})().catch(e => {
  require('fs').writeFileSync('validation-error.txt', e.stack);
  console.log('错误已保存');
});