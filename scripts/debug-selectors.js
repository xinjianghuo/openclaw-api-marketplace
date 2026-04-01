#!/usr/bin/env node

/**
 * 诊断工具 - 检查目标网站的 DOM 结构
 * 找出正确的选择器
 */

const BrowserAgent = require('./browser-agent.js');

(async () => {
  const agent = new BrowserAgent({ headless: true });
  await agent.start();

  console.log('🔍 诊断 DOM 结构 - 找出正确的选择器\n');

  // Reddit
  console.log('📱 Reddit r/microsaas');
  try {
    await agent.goto('https://www.reddit.com/r/microsaas/hot/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));

    // 打印当前页面的一些关键元素
    const debug = await agent.eval(() => {
      const containers = document.querySelectorAll('[data-testid*="post"]');
      return {
        totalTestidPosts: containers.length,
        firstTestidClass: containers[0]?.getAttribute('data-testid'),
        hasH3: document.querySelectorAll('h3').length,
        sampleH3: document.querySelector('h3')?.innerText?.substring(0, 60),
        anyLinkWithComments: document.querySelectorAll('a[href*="comments"]').length,
        firstCommentsHref: document.querySelector('a[href*="comments"]')?.href?.substring(0, 80)
      };
    });

    console.log(JSON.stringify(debug, null, 2));

    // 尝试其他选择器策略
    const alternative = await agent.eval(() => {
      // 尝试不同的选择器
      const postDivs = Array.from(document.querySelectorAll('div[data-click-id]'));
      const firstPost = postDivs[0];
      return {
        postDivsCount: postDivs.length,
        firstPostHasTitle: firstPost?.querySelector('h3')?.innerText?.substring(0, 60),
        allH3Count: document.querySelectorAll('h3').length,
        firstH3Text: document.querySelector('h3')?.innerText?.substring(0, 60),
        upvoteSelectors: document.querySelectorAll('[aria-label*="upvote"], [data-click-id*="upvote"]').length
      };
    });

    console.log('替代选择器:', JSON.stringify(alternative, null, 2));
  } catch (e) {
    console.log('Reddit 失败:', e.message);
  }

  // Product Hunt
  console.log('\n🛒 Product Hunt');
  try {
    await agent.goto('https://www.producthunt.com/posts?registered_before=now', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));

    const debug = await agent.eval(() => {
      return {
        testidPostCards: document.querySelectorAll('[data-testid*="post"]').length,
        hasPostCard: document.querySelector('[data-testid*="post"]')?.getAttribute('data-testid'),
        linkPosts: document.querySelectorAll('a[href*="/posts/"]').length,
        firstLinkText: document.querySelector('a[href*="/posts/"]')?.innerText,
        voteCounts: document.querySelectorAll('[data-testid*="vote"]').length
      };
    });

    console.log(JSON.stringify(debug, null, 2));
  } catch (e) {
    console.log('Product Hunt 失败:', e.message);
  }

  // Hacker News
  console.log('\n💡 Hacker News');
  try {
    await agent.goto('https://news.ycombinator.com/showhn', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));

    const debug = await agent.eval(() => {
      return {
        athingCount: document.querySelectorAll('.athing').length,
        titlelineLinks: document.querySelectorAll('.titleline > a').length,
        firstTitle: document.querySelector('.athing .titleline > a')?.innerText?.substring(0, 60),
        scoreEls: document.querySelectorAll('.score').length
      };
    });

    console.log(JSON.stringify(debug, null, 2));
  } catch (e) {
    console.log('Hacker News 失败:', e.message);
  }

  await agent.close();
  console.log('\n✅ 诊断完成');
})().catch(console.error);