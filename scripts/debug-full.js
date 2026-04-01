#!/usr/bin/env node

/**
 * 调试 - 获取页面完整内容，识别正确的选择器
 */

const BrowserAgent = require('./browser-agent.js');

(async () => {
  const agent = new BrowserAgent({ headless: true });
  await agent.start();

  // 测试 Reddit - 增加等待
  console.log('📱 Reddit - 获取页面结构...');
  try {
    await agent.goto('https://www.reddit.com/r/microsaas/hot/', { waitUntil: 'networkidle' });
    await new Promise(r => setTimeout(r, 8000));

    // 保存 HTML 用于分析
    const htmlLength = await agent.eval(() => document.documentElement.outerHTML.length);
    const bodyText = await agent.eval(() => document.body.innerText.substring(0, 2000));
    console.log(`页面大小: ${htmlLength} bytes`);
    console.log('Body 预览:', bodyText.substring(0, 500));

    // 尝试多种选择器
    const selectors = await agent.eval(() => {
      const results = {};
      // 尝试各种可能的选择器
      const tests = [
        '[data-testid*="post"]',
        '[data-click-id*="post"]',
        'div[data-testid]',
        'div[data-click-id]',
        'shreddit-post',
        'div[id*="post-"]',
        '.Post'
      ];
      tests.forEach(sel => {
        results[sel] = document.querySelectorAll(sel).length;
      });
      return results;
    });

    console.log('\n选择器测试:', JSON.stringify(selectors, null, 2));

    // 查找所有包含投票的元素
    const upvotePatterns = await agent.eval(() => {
      const els = document.querySelectorAll('*');
      const upvoteEls = [];
      els.forEach(el => {
        if (el.innerText && /\d+[\.,]?\d*[KM]?/.test(el.innerText) && (el.getAttribute('aria-label')?.includes('upvote') || el.className?.includes('vote'))) {
          upvoteEls.push({
            tag: el.tagName,
            class: el.className?.substring(0, 50),
            text: el.innerText?.substring(0, 30)
          });
        }
      });
      return upvoteEls.slice(0, 5);
    });
    console.log('\n可能的投票元素:', JSON.stringify(upvotePatterns, null, 2));

  } catch (e) {
    console.log('Reddit 失败:', e.message);
  }

  // 截图看一下页面实际渲染
  try {
    await agent.goto('https://www.reddit.com/r/microsaas/hot/', { waitUntil: 'networkidle' });
    await new Promise(r => setTimeout(r, 8000));
    await agent.screenshot('reddit-debug.png');
    console.log('Reddit 截图已保存: reddit-debug.png');
  } catch (e) {}

  // Product Hunt
  console.log('\n🛒 Product Hunt...');
  try {
    await agent.goto('https://www.producthunt.com/posts?registered_before=now', { waitUntil: 'networkidle' });
    await new Promise(r => setTimeout(r, 8000));

    const htmlLength = await agent.eval(() => document.documentElement.outerHTML.length);
    console.log(`PH 页面大小: ${htmlLength} bytes`);

    const selectors = await agent.eval(() => {
      const tests = [
        '[data-testid*="post"]',
        '[data-testid*="card"]',
        'div[data-testid]',
        'a[href*="/posts/"]',
        '[data-testid*="vote"]'
      ];
      const results = {};
      tests.forEach(sel => {
        results[sel] = document.querySelectorAll(sel).length;
      });
      return results;
    });
    console.log('PH 选择器测试:', JSON.stringify(selectors, null, 2));

    await agent.screenshot('ph-debug.png');
    console.log('PH 截图已保存: ph-debug.png');
  } catch (e) {
    console.log('Product Hunt 失败:', e.message);
  }

  // Hacker News
  console.log('\n💡 Hacker News...');
  try {
    await agent.goto('https://news.ycombinator.com/showhn', { waitUntil: 'networkidle' });
    await new Promise(r => setTimeout(r, 8000));

    const selectors = await agent.eval(() => {
      const tests = [
        '.athing',
        '.titleline',
        '.score',
        'span.age',
        'a[href*="item"]'
      ];
      const results = {};
      tests.forEach(sel => {
        results[sel] = document.querySelectorAll(sel).length;
      });
      return results;
    });
    console.log('HN 选择器测试:', JSON.stringify(selectors, null, 2));

    const firstFew = await agent.eval(() => {
      const rows = document.querySelectorAll('.athing');
      return Array.from(rows).slice(0, 3).map(row => {
        const titleLink = row.querySelector('.titleline > a');
        return titleLink ? titleLink.innerText : null;
      });
    });
    console.log('HN 前3条标题:', JSON.stringify(firstFew, null, 2));

  } catch (e) {
    console.log('Hacker News 失败:', e.message);
  }

  await agent.close();
  console.log('\n✅ 调试完成');
})().catch(console.error);