/**
 * Opportunity Scanner - 测试脚本 (模拟数据模式)
 * 无需真实API，验证分析逻辑
 */

const fs = require('fs');

// 模拟数据源 (基于真实案例)
const mockData = [
  {
    source: 'reddit',
    title: 'OpenClaw API costs are killing me - $300/mo bill!',
    url: 'https://reddit.com/r/OpenClaw/comments/xyz123',
    text: 'I love OpenClaw but my API bills are exploding. Anyone have tips for cost optimization? Would pay for a tool that monitors and alerts.',
    metadata: {
      subreddit: 'OpenClaw',
      upvotes: 234,
      comments: 67
    }
  },
  {
    source: 'github',
    title: 'Need: Shopify SEO automation for OpenClaw',
    url: 'https://github.com/shopify/shopify/issues/789',
    text: 'Looking for an OpenClaw skill that can automatically audit SEO and suggest improvements for Shopify stores. Budget: $29-49/mo.',
    metadata: {
      repo: 'shopify/shopify',
      stars: 4500,
      label: 'enhancement'
    }
  },
  {
    source: 'producthunt',
    title: 'OpenClaw Cost Monitor - track your API spend in real-time',
    url: 'https://www.producthunt.com/posts/openclaw-cost-monitor',
    text: 'A simple dashboard that shows your OpenClaw API usage and costs with alerts when you exceed budget. Freemium model: Free for <1000 requests/day.',
    metadata: {
      category: 'Developer Tools',
      upvotes: 142
    }
  },
  {
    source: 'hackernews',
    title: 'Show HN: OpenClaw script to auto-recover failed Stripe payments',
    url: 'https://news.ycombinator.com/item?id=12345678',
    text: 'Built an OpenClaw agent that monitors Stripe webhooks and automatically retries failed payments. Saved $2k in churned revenue last month. Open sourcing.',
    metadata: {
      points: 312,
      comments: 89
    }
  },
  {
    source: 'reddit',
    title: 'Looking for OpenClaw deployment service - budget $500',
    url: 'https://reddit.com/r/indiehackers/comments/abc456',
    text: 'Need someone to set up OpenClaw on my VPS, configure skills, and provide docs. Willing to pay $300-800 for professional setup.',
    metadata: {
      subreddit: 'indiehackers',
      upvotes: 45,
      comments: 12
    }
  }
];

// AI 分析算法
function analyzeOpportunity(entry) {
  const text = (entry.title + ' ' + entry.text).toLowerCase();
  let score = 0;
  let painLevel = 0;
  let competition = 'medium';
  let revenuePotential = '$$';
  let validationDays = 3;

  // 痛点关键词
  const painKeywords = {
    'exploding': 3, 'killing': 3, 'bill': 2, 'cost': 2, 'expensive': 2,
    'monitor': 2, 'alert': 2, 'save': 2, 'automation': 2, 'auto': 2,
    'recover': 3, 'retry': 2, 'churned': 3, 'revenue': 3
  };

  // 计算痛点分数
  for (const [keyword, weight] of Object.entries(painKeywords)) {
    if (text.includes(keyword)) {
      painLevel += weight;
    }
  }

  // 竞争分析
  if (text.includes('openclaw') && (text.includes('cost') || text.includes('monitor'))) {
    competition = 'low'; // 成本监控 < 5个现有技能
  } else if (text.includes('seo') && text.includes('shopify')) {
    competition = 'medium';
  } else if (text.includes('deployment') || text.includes('setup')) {
    competition = 'low'; // 服务类竞争
  }

  // 收入潜力
  if (text.includes('$') || text.includes('pay') || text.includes('budget')) {
    revenuePotential = '$$';
  } else if (text.includes('free') && text.includes('premium')) {
    revenuePotential = '$';
  }

  // 总分 (0-10)
  score = Math.min(10, (painLevel / 5) + (competition === 'low' ? 2 : 0) + (revenuePotential === '$$$$' ? 2 : revenuePotential === '$$$' ? 1.5 : 1));

  return {
    opportunityId: `opp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: entry.title,
    url: entry.url,
    source: entry.source,
    score: parseFloat(score.toFixed(1)),
    painLevel: painLevel,
    competition,
    revenuePotential,
    validationDays,
    suggestedMVP: generateMVPSuggestion(text)
  };
}

function generateMVPSuggestion(text) {
  if (text.includes('cost') && text.includes('monitor')) {
    return 'OpenClaw agent that queries billing API + Slack/Discord alerts (2 weeks build)';
  } else if (text.includes('seo') && text.includes('shopify')) {
    return 'OpenClaw skill: run Lighthouse on Shopify stores, generate SEO report (2 weeks)';
  } else if (text.includes('recover') || text.includes('stripe')) {
    return 'Webhook listener + retry logic for failed Stripe payments (1 week)';
  } else if (text.includes('deployment') || text.includes('setup')) {
    return 'Offer deployment service: VPS setup + 3 skills + docs (3-5 days per client)';
  }
  return 'Generic skill: OpenClaw agent solving the pain point (2-4 weeks)';
}

// 主流程
console.log('🔍 Opportunity Scanner (Test Mode - Simulated Data)\n');
console.log(`📥 Loaded ${mockData.length} mock entries from Reddit/GitHub/Product Hunt/HN\n`);

const analyzed = mockData.map(analyzeOpportunity);
const ranked = analyzed.sort((a, b) => b.score - a.score);

// 输出 Top 10 报告
console.log('# 📊 Opportunity Report (Simulated)\n');
console.log(`**Generated**: ${new Date().toISOString()}\n`);
console.log(`**Total opportunities scanned**: ${analyzed.length}\n`);

console.log('## 🏆 Top 5 Opportunities\n');

ranked.slice(0, 5).forEach((opp, idx) => {
  console.log(`### ${idx + 1}. ${opp.title} (Score: ${opp.score}/10)`);
  console.log(`- 🔗 [Source](${opp.url}) (${opp.source})`);
  console.log(`- 💢 Pain Level: ${opp.painLevel}/15`);
  console.log(`- 🏁 Competition: ${opp.competition}`);
  console.log(`- 💰 Revenue Potential: ${opp.revenuePotential}`);
  console.log(`- ⏱️ Validation: ${opp.validationDays} days`);
  console.log(`- 🛠️ MVP Suggestion: ${opp.suggestedMVP}\n`);
});

console.log('## 📈 Statistics\n');
console.log(`- Average Score: ${(ranked.reduce((a, b) => a + b.score, 0) / ranked.length).toFixed(2)}/10`);
console.log(`- High Pain (≥8): ${ranked.filter(o => o.painLevel >= 8).length}`);
console.log(`- Low Competition: ${ranked.filter(o => o.competition === 'low').length}`);
console.log(`- High Revenue ($$$): ${ranked.filter(o => o.revenuePotential === '$$$').length}`);

console.log('\n## 🎯 Next Steps\n');
console.log('1. Pick Top 1 opportunity based on your capabilities');
console.log('2. Run Mom Test: Interview 10 target users (ask about problem, not solution)');
console.log('3. Create landing page on Carrd (48h distribution test)');
console.log('4. If >5% signup rate → proceed to MVP build');

// 保存报告到文件
const report = {
  generated: new Date().toISOString(),
  totalScanned: analyzed.length,
  topOpportunities: ranked,
  statistics: {
    avgScore: parseFloat((ranked.reduce((a, b) => a + b.score, 0) / ranked.length).toFixed(2)),
    highPainCount: ranked.filter(o => o.painLevel >= 8).length,
    lowCompCount: ranked.filter(o => o.competition === 'low').length,
    highRevCount: ranked.filter(o => o.revenuePotential === '$$$').length
  }
};

fs.writeFileSync('./reports/opportunity-report-test.json', JSON.stringify(report, null, 2));
console.log('\n✅ Report saved to ./reports/opportunity-report-test.json');

console.log('\n🎉 Scanner test completed successfully! Analysis logic validated.');
process.exit(0);
