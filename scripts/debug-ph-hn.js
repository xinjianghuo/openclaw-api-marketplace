#!/usr/bin/env node
/**
 * 检查 Product Hunt 和 Hacker News 的实际 DOM
 */
const BrowserAgent = require('./browser-agent.js');

(async () => {
  const agent = new BrowserAgent({ headless: true });
  await agent.start();

  // Product Hunt - 详细检查
  console.log('检查 Product Hunt...');
  try {
    await agent.goto('https://www.producthunt.com/posts?registered_before=now', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 8000));

    const info = await agent.eval(() => {
      return {
        title: document.title,
        allHrefs: Array.from(document.querySelectorAll('a[href*="/posts/"]')).slice(0, 5).map(a => a.href),
        allDivsWithTestid: Array.from(document.querySelectorAll('[data-testid]')).slice(0, 10).map(el => el.getAttribute('data-testid')),
        sampleText: document.body.innerText.substring(0, 1000)
      };
    });

    console.log(JSON.stringify(info, null, 2));
  } catch (e) { console.log(e.message); }

  // Hacker News
  console.log('\n检查 Hacker News...');
  try {
    await agent.goto('https://news.ycombinator.com/showhn', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 6000));

    const info = await agent.eval(() => {
      return {
        title: document.title,
        hasAthing: !!document.querySelector('.athing'),
        athingCount: document.querySelectorAll('.athing').length,
        htmlSnippet: document.documentElement.outerHTML.substring(0, 2000)
      };
    });

    console.log(JSON.stringify(info, null, 2));
  } catch (e) { console.log(e.message); }

  await agent.close();
})().catch(console.error);