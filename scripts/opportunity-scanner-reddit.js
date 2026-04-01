#!/usr/bin/env node

/**
 * OpenClaw Opportunity Scanner v0.3 - Reddit Focus
 * 专注 Reddit 多 subreddit 扫描，高成功率
 */

const BrowserAgent = require('./browser-agent.js');

(async () => {
  const startTime = Date.now();
  const subreddits = [
    'microsaas',
    'startups',
    'sideproject',
    'entrepreneur',
    'selfhosted',
    'saas'
  ];

  console.log('🚀 Opportunity Scanner v0.3 - Reddit Multi-Subreddit\n');
  console.log(`📡 扫描目标: ${subreddits.join(', ')}\n`);
  console.log('─'.repeat(70));

  const agent = new BrowserAgent({ headless: true });
  await agent.start();

  const allOpportunities = [];

  for (const sub of subreddits) {
    console.log(`\n📱 扫描 r/${sub}...`);
    try {
      await agent.goto(`https://www.reddit.com/r/${sub}/hot/`, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 5000));

      const posts = await agent.eval((subName) => {
        const results = [];
        const bodyText = document.body.innerText;
        const lines = bodyText.split('\n').filter(l => l.length > 20 && l.length < 200);

        // 机会关键词
        const keywords = /\b(need|looking for|wish|want|missing|frustrated|tired of|automate|tool|service|app|software|solution|pay|budget|subscription|SaaS|API|integration|workflow|manual|easier|cheaper|faster)\b/i;

        lines.forEach(line => {
          if (keywords.test(line)) {
            // 找附近的投票数（行前或行后）
            let upvotes = 0;
            const voteMatch = line.match(/(\d+)\s*(?:upvote|vote|point)?/i) ||
                             (line.length > 50 ? null : null); // 简化

            results.push({
              title: line,
              upvotes: upvotes,
              subreddit: subName,
              potential: 'MEDIUM'
            });
          }
        });

        // 另外查找所有 h3 标题
        const h3s = document.querySelectorAll('h3');
        Array.from(h3s).slice(0, 10).forEach(h3 => {
          const title = h3.innerText.trim();
          if (title.length > 15 && keywords.test(title)) {
            results.push({
              title,
              upvotes: 0,
              subreddit: subName,
              potential: 'MEDIUM'
            });
          }
        });

        return results.slice(0, 10);
      }, sub);

      console.log(`  发现 ${posts.length} 个潜在机会:`);
      posts.forEach((p, i) => {
        console.log(`  ${i+1}. ${p.title.substring(0, 70)}`);
      });

      allOpportunities.push(...posts.map(p => ({
        ...p,
        source: 'Reddit',
        score: p.upvotes || 10
      })));

    } catch (e) {
      console.log(`  ❌ r/${sub} 失败: ${e.message}`);
    }
  }

  await agent.close();

  // 去重并排序
  const uniqueOpps = [];
  const seen = new Set();
  for (const opp of allOpportunities) {
    const key = opp.title.substring(0, 50).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueOpps.push(opp);
    }
  }

  const top20 = uniqueOpps.sort((a, b) => b.score - a.score).slice(0, 20);

  console.log('\n' + '='.repeat(70));
  console.log('📊 扫描完成');
  console.log('='.repeat(70));
  console.log(`\n总计发现: ${uniqueOpps.length} 个独特机会`);
  console.log(`TOP 20:\n`);

  top20.forEach((o, i) => {
    console.log(`${i+1}. [r/${o.subreddit}] ${o.title.substring(0, 80)}`);
  });

  // 保存报告
  const fs = require('fs');
  const report = {
    scanTime: new Date().toISOString(),
    duration: Date.now() - startTime,
    subredditsScanned: subreddits,
    totalRaw: allOpportunities.length,
    totalUnique: uniqueOpps.length,
    top20: top20.map((o, i) => ({
      rank: i + 1,
      subreddit: o.subreddit,
      title: o.title,
      source: o.source,
      potential: o.potential,
      score: o.score
    }))
  };

  fs.writeFileSync('opportunity-report.json', JSON.stringify(report, null, 2));
  const md = '# Opportunity Scanner Report (Reddit Only)\n\n**时间**: ' + new Date().toLocaleString('zh-CN') + '\n**扫描**: ' + subreddits.join(', ') + '\n\n## TOP 20\n\n' +
    top20.map((o, i) => `### ${i+1}. ${o.title}\n- **来源**: r/${o.subreddit}\n- **评分**: ${o.score}`).join('\n\n') +
    '\n\n---\n*Powered by OpenClaw*';
  fs.writeFileSync('opportunity-report.md', md);

  console.log('\n✅ 报告已保存');
  console.log('\n💡 下一步: 分析 TOP 5 机会，准备 Mom Test 验证');
  console.log(`⏱️ 总耗时: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
})().catch(err => {
  console.error('❌ 失败:', err);
  process.exit(1);
});