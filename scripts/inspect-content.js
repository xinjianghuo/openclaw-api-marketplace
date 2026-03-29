#!/usr/bin/env node
/**
 * 快速检查各网站的实际内容结构
 */
const BrowserAgent = require('./browser-agent.js');

(async () => {
  const agent = new BrowserAgent({ headless: true });
  await agent.start();

  // Reddit - 保存标题列表
  console.log('Reddit:');
  try {
    await agent.goto('https://www.reddit.com/r/microsaas/hot/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 6000));
    const titles = await agent.eval(() => {
      const allText = document.body.innerText;
      // 找包含关键词的段落
      const lines = allText.split('\n').filter(l => l.length > 30 && l.length < 200);
      return lines.slice(0, 20);
    });
    console.log(titles);
  } catch (e) { console.log('Error:', e.message); }

  // Product Hunt
  console.log('\nProduct Hunt:');
  try {
    await agent.goto('https://www.producthunt.com/posts?registered_before=now', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 8000));
    const titles = await agent.eval(() => {
      // 所有链接中包含 /posts/ 的文本
      const links = Array.from(document.querySelectorAll('a[href*="/posts/"]'));
      return links.slice(0, 20).map(a => a.innerText.trim()).filter(t => t.length > 5);
    });
    console.log(titles);
  } catch (e) { console.log('Error:', e.message); }

  // Hacker News
  console.log('\nHacker News:');
  try {
    await agent.goto('https://news.ycombinator.com/showhn', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 6000));
    const titles = await agent.eval(() => {
      // 获取所有行内文本
      const allText = document.body.innerText;
      const lines = allText.split('\n').filter(l => l.length > 20 && l.length < 150);
      return lines.slice(0, 20);
    });
    console.log(titles);
  } catch (e) { console.log('Error:', e.message); }

  await agent.close();
})().catch(console.error);