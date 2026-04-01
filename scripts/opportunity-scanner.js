#!/usr/bin/env node

/**
 * OpenClaw Opportunity Scanner v0.1
 * 首次真实扫描 - 抓取并分析赚钱机会
 *
 * 数据源:
 * 1. Reddit r/microsaas - 用户痛点讨论
 * 2. Product Hunt - 新产品趋势
 * 3. Hacker News Show HN - 开发者工具
 *
 * 输出: Top 20 机会列表（按潜力排序）
 */

const BrowserAgent = require('./browser-agent.js');

(async () => {
  const startTime = Date.now();
  console.log('🚀 OpenClaw Opportunity Scanner v0.1 启动\n');
  console.log('📡 数据源: Reddit r/microsaas, Product Hunt, Hacker News Show HN\n');
  console.log('─'.repeat(70));

  const opportunities = [];
  const agent = new BrowserAgent({ headless: true });
  await agent.start();

  // ============================================
  // 1. Reddit r/microsaas 扫描
  // ============================================
  console.log('\n📱 [1/3] 扫描 Reddit r/microsaas - 寻找用户痛点...');
  try {
    await agent.goto('https://www.reddit.com/r/microsaas/hot/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000)); // 等待动态加载

    const posts = await agent.eval(() => {
      const results = [];
      const containers = document.querySelectorAll('[data-testid="post-container"]');

      containers.forEach((container, index) => {
        if (index >= 15) return; // 只检查前15个

        const titleEl = container.querySelector('h3');
        const upvoteEl = container.querySelector('[data-click-id="upvote"]');
        const commentEl = container.querySelector('a[href*="comments"]');
        const linkEl = container.querySelector('a[href*="comments"]')?.parentElement?.querySelector('a[href*="https"]');

        if (!titleEl) return;

        const title = titleEl.innerText.trim();
        const upvotes = parseInt(upvoteEl?.innerText.replace(/[^0-9]/g, '') || '0');
        const comments = parseInt(commentEl?.innerText.replace(/[^0-9]/g, '') || '0');
        const url = linkEl?.href || '';

        // 识别机会关键词
        const opportunityPatterns = [
          /\b(need|looking for|wish|want|missing|lack|frustrated|tired of|pain point)\b/i,
          /\b(manual|automate|simplify|streamline|easier|faster|cheaper)\b/i,
          /\b(tool|service|app|software|solution|platform)\b/i,
          /\b(pay|willing to pay|budget|cost|affordable)\b/i,
          /\b(subscription|monthly|recurring|SaaS)\b/i,
          /\b(integration|API|workflow|connect)\b/i,
          /\b(analytics|dashboard|report|tracking|monitoring)\b/i,
          /\b(AI|automation|AI agent|LLM|GPT)\b/i
        ];

        const matchCount = opportunityPatterns.filter(p => p.test(title)).length;
        const isHighPotential = upvotes >= 20 || comments >= 10 || matchCount >= 3;

        if (matchCount >= 2 || upvotes >= 10) {
          results.push({
            source: 'Reddit',
            title,
            upvotes,
            comments,
            url: url || `https://reddit.com${container.querySelector('a')?.href || ''}`,
            matchCount,
            score: upvotes * 2 + comments + (matchCount * 10),
            potential: isHighPotential ? 'HIGH' : (matchCount >= 2 ? 'MEDIUM' : 'LOW')
          });
        }
      });

      return results.sort((a, b) => b.score - a.score).slice(0, 15);
    });

    console.log(`  发现 ${posts.length} 个潜在机会:`);
    posts.forEach((p, i) => {
      console.log(`  ${i+1}. [${p.potential}] ⬆️${p.upvotes} 💬${p.comments} (匹配:${p.matchCount})`);
      console.log(`     ${p.title.substring(0, 80)}`);
      console.log(`     🔗 ${p.url.substring(0, 60)}...`);
    });

    opportunities.push(...posts);
  } catch (e) {
    console.log(`  ❌ Reddit 扫描失败: ${e.message}`);
  }

  // ============================================
  // 2. Product Hunt 扫描
  // ============================================
  console.log('\n🛒 [2/3] 扫描 Product Hunt - 新产品趋势...');
  try {
    await agent.goto('https://www.producthunt.com/posts?registered_before=now', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));

    const products = await agent.eval(() => {
      const results = [];
      const cards = document.querySelectorAll('[data-testid="post-card"]');

      cards.forEach((card, index) => {
        if (index >= 15) return;

        const nameEl = card.querySelector('a[href*="/posts/"]');
        const descEl = card.querySelector('p');
        const votesEl = card.querySelector('[data-testid="vote-count"]');
        const topicEls = card.querySelectorAll('[data-testid="topics"] a');

        if (!nameEl) return;

        const name = nameEl.innerText.trim();
        const desc = descEl?.innerText.trim() || '';
        const votes = parseInt(votesEl?.innerText.replace(/[^0-9]/g, '') || '0');
        const topics = Array.from(topicEls).map(t => t.innerText.toLowerCase());

        // 识别 SaaS 机会
        const saasKeywords = ['ai', 'automation', 'analytics', 'dashboard', 'api', 'integration',
                              'workflow', 'productivity', 'marketing', 'sales', 'finance',
                              'developer tools', 'collaboration', 'management', 'monitoring'];
        const hasSaaSKeyword = saasKeywords.some(k => topics.includes(k) ||
                                  desc.toLowerCase().includes(k) ||
                                  name.toLowerCase().includes(k));

        const isHighPotential = votes >= 50 || hasSaaSKeyword;

        if (hasSaaSKeyword) {
          results.push({
            source: 'Product Hunt',
            title: name,
            description: desc.substring(0, 200),
            upvotes: votes,
            topics: topics.slice(0, 5),
            url: `https://www.producthunt.com${nameEl.getAttribute('href')}`,
            potential: isHighPotential ? 'HIGH' : 'MEDIUM',
            score: votes + 20
          });
        }
      });

      return results.sort((a, b) => b.score - a.score).slice(0, 15);
    });

    console.log(`  发现 ${products.length} 个相关新品:`);
    products.forEach((p, i) => {
      console.log(`  ${i+1}. [${p.potential}] ⬆️${p.upvotes} ${p.title}`);
      console.log(`     ${p.description.substring(0, 100)}...`);
      console.log(`     🏷️ ${p.topics.join(', ')}`);
    });

    opportunities.push(...products);
  } catch (e) {
    console.log(`  ❌ Product Hunt 扫描失败: ${e.message}`);
  }

  // ============================================
  // 3. Hacker News Show HN 扫描
  // ============================================
  console.log('\n💡 [3/3] 扫描 Hacker News Show HN - 开发者工具...');
  try {
    await agent.goto('https://news.ycombinator.com/showhn', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));

    const hnPosts = await agent.eval(() => {
      const results = [];
      const rows = document.querySelectorAll('.athing');

      rows.forEach((row, index) => {
        if (index >= 20) return;

        const titleLink = row.querySelector('.titleline > a');
        const scoreRow = row.nextElementSibling;
        const scoreEl = scoreRow?.querySelector('.score');
        const commentEl = scoreRow?.querySelector('a[href*="item"]');

        if (!titleLink) return;

        const title = titleLink.innerText.trim();
        const url = titleLink.href;
        const score = parseInt(scoreEl?.innerText.replace(/[^0-9]/g, '') || '0');
        const comments = parseInt(commentEl?.innerText.replace(/[^0-9]/g, '') || '0');

        // 过滤掉招聘和 AMA
        if (title.includes('AMA') || title.includes('interview') || title.includes('Hiring') || title.includes('hire')) {
          return;
        }

        // 识别工具类机会
        const toolKeywords = ['SaaS', 'API', 'CLI', 'bot', 'dashboard', 'analytics', 'monitoring',
                              'deployment', 'testing', 'security', 'backup', 'devops', 'infrastructure',
                              'payment', 'stripe', 'auth', 'database', 'hosting', 'serverless',
                              'automation', 'workflow', 'integration', 'notifications', 'alerts',
                              'AI', 'ML', 'LLM', 'GPT', 'openai', 'embedding'];
        const isTool = toolKeywords.some(k => title.toLowerCase().includes(k) || url.toLowerCase().includes(k));

        if (isTool) {
          const scoreValue = score + (comments * 2);
          results.push({
            source: 'Hacker News',
            title: title,
            url,
            upvotes: score,
            comments,
            potential: score > 30 ? 'HIGH' : 'MEDIUM',
            score: scoreValue
          });
        }
      });

      return results.sort((a, b) => b.score - a.score).slice(0, 15);
    });

    console.log(`  发现 ${hnPosts.length} 个开发者工具:`);
    hnPosts.forEach((p, i) => {
      console.log(`  ${i+1}. [${p.potential}] ⬆️${p.upvotes} 💬${p.comments} ${p.title.substring(0, 70)}`);
      console.log(`     🔗 ${p.url}`);
    });

    opportunities.push(...hnPosts);
  } catch (e) {
    console.log(`  ❌ Hacker News 扫描失败: ${e.message}`);
  }

  // ============================================
  // 4. 生成最终报告
  // ============================================
  await agent.close();

  console.log('\n' + '='.repeat(70));
  console.log('📊 扫描完成 - 统计摘要');
  console.log('='.repeat(70));

  console.log(`\n总计发现机会: ${opportunities.length}`);
  console.log(`  Reddit:      ${opportunities.filter(o => o.source === 'Reddit').length}`);
  console.log(`  Product Hunt: ${opportunities.filter(o => o.source === 'Product Hunt').length}`);
  console.log(`  Hacker News:  ${opportunities.filter(o => o.source === 'Hacker News').length}`);

  console.log(`\n按潜力分布:`);
  console.log(`  HIGH:  ${opportunities.filter(o => o.potential === 'HIGH').length}`);
  console.log(`  MEDIUM: ${opportunities.filter(o => o.potential === 'MEDIUM').length}`);
  console.log(`  LOW:   ${opportunities.filter(o => o.potential === 'LOW').length}`);

  if (opportunities.length > 0) {
    // 按综合评分排序（来源权重: 开发者工具 > SaaS新品 > 用户痛点）
    const weighted = opportunities.map(o => {
      let weight = 1.0;
      if (o.source === 'Hacker News') weight = 1.2;  // 开发者工具变现能力强
      if (o.source === 'Product Hunt') weight = 1.1; // 已验证市场需求
      if (o.source === 'Reddit') weight = 1.0;       // 需要进一步验证
      return { ...o, weightedScore: (o.score || o.upvotes || 0) * weight };
    }).sort((a, b) => b.weightedScore - a.weightedScore);

    const top20 = weighted.slice(0, 20);

    console.log('\n🔥 TOP 20 赚钱机会（已加权排序）:');
    console.log('─'.repeat(70));
    top20.forEach((o, i) => {
      console.log(`\n${i+1}. [${o.source}] [${o.potential}] 综合分: ${Math.round(o.weightedScore)}`);
      console.log(`   ${o.title.substring(0, 90)}`);
      if (o.description) {
        console.log(`   📝 ${o.description.substring(0, 100)}...`);
      }
      console.log(`   ⬆️${o.upvotes || 0} 💬${o.comments || 0}`);
      console.log(`   🔗 ${o.url}`);
    });

    // 保存完整报告
    const fs = require('fs');
    const report = {
      scanTime: new Date().toISOString(),
      duration: Date.now() - startTime,
      totalOpportunities: opportunities.length,
      top20: top20.map(o => ({
        rank: top20.indexOf(o) + 1,
        source: o.source,
        potential: o.potential,
        title: o.title,
        description: o.description || null,
        url: o.url,
        metrics: { upvotes: o.upvotes || 0, comments: o.comments || 0 },
        weightedScore: Math.round(o.weightedScore)
      }))
    };

    fs.writeFileSync('opportunity-report.json', JSON.stringify(report, null, 2));
    console.log('\n✅ 完整报告已保存: opportunity-report.json');

    // 生成 Markdown 报告
    const md = '# Opportunity Scanner Report\n\n**扫描时间**: ' + new Date().toLocaleString('zh-CN') + '\n**数据源**: Reddit r/microsaas, Product Hunt, Hacker News Show HN\n\n## TOP 20 机会列表\n\n' +
      top20.map((o, i) => {
        let item = `### ${i+1}. ` + o.title + '\n- **来源**: ' + o.source +
          '\n- **潜力**: ' + o.potential +
          '\n- **评分**: ' + Math.round(o.weightedScore) +
          '\n- **热度**: ⬆️' + (o.upvotes || 0) + ' 💬' + (o.comments || 0) +
          '\n- **链接**: ' + o.url;
        if (o.description) {
          item += '\n- **描述**: ' + o.description.substring(0, 150) + '...';
        }
        return item;
      }).join('\n\n') + '\n\n---\n*Powered by OpenClaw Opportunity Scanner v0.1*';

    fs.writeFileSync('opportunity-report.md', md);
    console.log('📄 Markdown 报告已保存: opportunity-report.md');

    console.log('\n🎯 下一步建议:');
    console.log('  1. 审查 TOP 5 机会，选择最感兴趣的进入 Mom Test 验证');
    console.log('  2. 或继续运行扫描（每天自动扫描，积累机会池）');
    console.log('  3. 开始第一个 Micro-SaaS MVP 开发（需要 5-10 次用户访谈）');

  } else {
    console.log('\n⚠️ 本次扫描未发现机会（可能需要调整关键词或网络问题）');
  }

  console.log('\n═'.repeat(70));
  console.log(`⏱️  总耗时: ${((Date.now() - startTime) / 1000).toFixed(1)} 秒`);
  console.log('═'.repeat(70));
})().catch(err => {
  console.error('\n❌ 扫描失败:', err);
  process.exit(1);
});