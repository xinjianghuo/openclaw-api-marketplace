#!/usr/bin/env node

/**
 * OpenClaw Opportunity Scanner v0.2
 * 使用反检测浏览器，真实抓取赚钱机会
 */

const BrowserAgent = require('./browser-agent.js');

(async () => {
  const startTime = Date.now();
  console.log('🚀 OpenClaw Opportunity Scanner v0.2 (Stealth Mode)\n');

  const opportunities = [];
  const agent = new BrowserAgent({ headless: true });
  await agent.start();

  // ========== 1. Reddit r/microsaas ==========
  console.log('📱 [1/3] 扫描 Reddit r/microsaas...');
  try {
    await agent.goto('https://www.reddit.com/r/microsaas/hot/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 6000)); // 充足等待

    const posts = await agent.eval(() => {
      const results = [];
      // 多种选择器兼容
      const selectors = [
        '[data-testid="post-container"]',
        'div[data-click-id]',
        'shreddit-post',
        'div[data-shreddit-post]',
        'div[data-post-hash]',
        'div.Post'
      ];

      let elements = [];
      selectors.forEach(sel => {
        elements = Array.from(document.querySelectorAll(sel));
        if (elements.length > 0) return;
      });

      elements.slice(0, 15).forEach(el => {
        const titleEl = el.querySelector('h3, a[href*="comments"] h3, [data-click-id="title"]');
        if (!titleEl) return;

        const title = titleEl.innerText.trim();
        if (title.length < 10) return;

        // 找投票数
        let upvotes = 0;
        const voteEl = el.querySelector('[data-click-id="upvote"] span, [aria-label*="upvote"], .vote');
        if (voteEl) {
          upvotes = parseInt(voteEl.innerText.replace(/[^0-9]/g, '')) || 0;
        }

        // 找评论数
        let comments = 0;
        const commentEl = el.querySelector('a[href*="comments"]');
        if (commentEl) {
          const match = commentEl.innerText.match(/(\d+)\s+comments?/i);
          if (match) comments = parseInt(match[1]);
        }

        // 机会关键词匹配
        const keywords = /\b(need|looking for|wish|want|missing|frustrated|automate|tool|service|pay|budget|SaaS|API|subscription)\b/i;
        const isOpportunity = keywords.test(title);

        if (isOpportunity || upvotes >= 10) {
          results.push({
            source: 'Reddit',
            title,
            upvotes,
            comments,
            potential: upvotes >= 50 || comments >= 20 ? 'HIGH' : (upvotes >= 20 ? 'MEDIUM' : 'LOW')
          });
        }
      });

      return results;
    });

    console.log(`  发现 ${posts.length} 个潜在机会:`);
    posts.forEach((p, i) => {
      console.log(`  ${i+1}. [${p.potential}] ⬆️${p.upvotes} 💬${p.comments}`);
      console.log(`     ${p.title.substring(0, 75)}`);
    });

    opportunities.push(...posts.map(p => ({ ...p, score: p.upvotes * 2 + p.comments })));
  } catch (e) {
    console.log(`  ❌ Reddit 失败: ${e.message}`);
  }

  // ========== 2. Product Hunt ==========
  console.log('\n🛒 [2/3] 扫描 Product Hunt...');
  try {
    await agent.goto('https://www.producthunt.com/posts?registered_before=now', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 8000));

    const products = await agent.eval(() => {
      const results = [];
      const selectors = [
        '[data-testid="post-card"]',
        '[data-testid*="product"]',
        'div[data-testid]',
        'a[href*="/posts/"]'
      ];

      let cards = [];
      selectors.forEach(sel => {
        cards = Array.from(document.querySelectorAll(sel)).filter(el => el.closest('a[href*="/posts/"]'));
        if (cards.length > 0) return;
      });

      cards.slice(0, 10).forEach(card => {
        const nameEl = card.querySelector('a[href*="/posts/"] h3, a[href*="/posts/"] span, [data-testid="product-name"]');
        const descEl = card.querySelector('[data-testid="product-tagline"], p, [data-testid="description"]');
        const voteEl = card.querySelector('[data-testid="vote-count"], [data-testid*="vote"]');

        if (!nameEl) return;

        const name = nameEl.innerText.trim();
        const desc = descEl?.innerText?.trim() || '';
        const votes = voteEl ? parseInt(voteEl.innerText.replace(/[^0-9]/g, '')) : 0;

        results.push({
          source: 'Product Hunt',
          title: name,
          description: desc,
          upvotes: votes,
          potential: votes >= 30 ? 'HIGH' : 'MEDIUM',
          score: votes
        });
      });

      return results;
    });

    console.log(`  发现 ${products.length} 个新品:`);
    products.forEach((p, i) => {
      console.log(`  ${i+1}. [${p.potential}] ⬆️${p.upvotes} ${p.title}`);
      console.log(`     ${p.description.substring(0, 80)}...`);
    });

    opportunities.push(...products);
  } catch (e) {
    console.log(`  ❌ Product Hunt 失败: ${e.message}`);
  }

  // ========== 3. Hacker News Show HN ==========
  console.log('\n💡 [3/3] 扫描 Hacker News Show HN...');
  try {
    await agent.goto('https://news.ycombinator.com/showhn', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 6000));

    const hnPosts = await agent.eval(() => {
      const results = [];
      const rows = document.querySelectorAll('.athing');

      rows.slice(0, 20).forEach(row => {
        const titleLink = row.querySelector('.titleline > a');
        if (!titleLink) return;

        const title = titleLink.innerText.trim();
        const url = titleLink.href;

        // 过滤
        if (title.includes('AMA') || title.includes('interview') || title.includes('Hiring') || title.includes('hire')) return;

        // 识别工具类
        const toolKeywords = ['SaaS', 'API', 'CLI', 'bot', 'dashboard', 'analytics', 'monitoring',
                              'deployment', 'testing', 'security', 'backup', 'devops', 'infrastructure',
                              'payment', 'auth', 'database', 'hosting', 'serverless', 'automation',
                              'workflow', 'integration', 'AI', 'LLM', 'GPT', 'openai'];
        const isTool = toolKeywords.some(k => title.toLowerCase().includes(k) || url.toLowerCase().includes(k));

        if (!isTool) return;

        const scoreRow = row.nextElementSibling;
        const scoreEl = scoreRow?.querySelector('.score');
        const score = scoreEl ? parseInt(scoreEl.innerText.replace(/[^0-9]/g, '')) : 0;
        const comments = scoreRow ? parseInt(scoreRow.innerText.match(/(\d+)\s+comment/)?.[1] || '0') : 0;

        results.push({
          source: 'Hacker News',
          title,
          url,
          upvotes: score,
          comments,
          potential: score > 30 ? 'HIGH' : 'MEDIUM',
          score: score + comments * 2
        });
      });

      return results.sort((a, b) => b.score - a.score).slice(0, 15);
    });

    console.log(`  发现 ${hnPosts.length} 个开发者工具:`);
    hnPosts.forEach((p, i) => {
      console.log(`  ${i+1}. [${p.potential}] ⬆️${p.upvotes} 💬${p.comments}`);
      console.log(`     ${p.title.substring(0, 70)}`);
    });

    opportunities.push(...hnPosts);
  } catch (e) {
    console.log(`  ❌ Hacker News 失败: ${e.message}`);
  }

  await agent.close();

  // ========== 生成报告 ==========
  console.log('\n' + '='.repeat(70));
  console.log('📊 扫描完成');
  console.log('='.repeat(70));

  console.log(`\n总计: ${opportunities.length} 个机会`);
  console.log(`  Reddit:      ${opportunities.filter(o => o.source === 'Reddit').length}`);
  console.log(`  Product Hunt: ${opportunities.filter(o => o.source === 'Product Hunt').length}`);
  console.log(`  Hacker News:  ${opportunities.filter(o => o.source === 'Hacker News').length}`);

  if (opportunities.length > 0) {
    const top20 = opportunities.sort((a, b) => b.score - a.score).slice(0, 20);

    console.log('\n🔥 TOP 20 机会:');
    top20.forEach((o, i) => {
      console.log(`\n${i+1}. [${o.source}] [${o.potential}]`);
      console.log(`   ${o.title}`);
      if (o.description) console.log(`   📝 ${o.description.substring(0, 100)}...`);
      console.log(`   ⬆️${o.upvotes} 💬${o.comments} 综合: ${o.score}`);
      if (o.url) console.log(`   🔗 ${o.url}`);
    });

    // 保存
    const fs = require('fs');
    const report = {
      scanTime: new Date().toISOString(),
      duration: Date.now() - startTime,
      total: opportunities.length,
      top20: top20.map((o, i) => ({
        rank: i + 1,
        source: o.source,
        potential: o.potential,
        title: o.title,
        description: o.description,
        url: o.url,
        metrics: { upvotes: o.upvotes, comments: o.comments },
        score: o.score
      }))
    };

    fs.writeFileSync('opportunity-report.json', JSON.stringify(report, null, 2));
    const md = '# Opportunity Scanner Report\n\n**时间**: ' + new Date().toLocaleString('zh-CN') + '\n\n## TOP 20\n\n' +
      top20.map((o, i) => `### ${i+1}. ${o.title}\n- **来源**: ${o.source}\n- **潜力**: ${o.potential}\n- **热度**: ⬆️${o.upvotes} 💬${o.comments}\n- **链接**: ${o.url}`).join('\n\n') +
      '\n\n---\n*Powered by OpenClaw*';
    fs.writeFileSync('opportunity-report.md', md);

    console.log('\n✅ 报告已保存: opportunity-report.json + .md');
    console.log('\n🎯 建议: 查看 report.json 中的 TOP 5，准备 Mom Test 验证');
  } else {
    console.log('\n⚠️ 未发现机会（可能需要调整关键词或网站结构已变更）');
  }

  console.log(`\n⏱️ 耗时: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  console.log('═'.repeat(70));
})().catch(err => {
  console.error('\n❌ 扫描失败:', err.message);
  process.exit(1);
});