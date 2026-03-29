#!/usr/bin/env node
// Reddit RSS Scanner - Zero API Key Required
// Pure regex parsing, no dependencies

const https = require('https');

// Subreddits with high micro-SaaS demand signals
const subreddits = ['microsaas', 'indiehackers', 'startups', 'ecommerce', 'SaaS'];

// Keywords indicating demand
const demandWords = ['need', 'looking for', 'want', 'recommend', 'suggest', 'alternative', 'any tool', 'is there a', 'does anyone know', 'tool for', 'automate'];
const painWords = ['hate', 'frustrating', 'annoying', 'tedious', 'pain', 'slow', 'manual', 'waste', 'repetitive'];

function parseXML(xmlStr) {
  // Simple regex-based extraction for RSS entries
  const entries = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title>([\s\S]*?)<\/title>/;
  const linkRegex = /<link>([\s\S]*?)<\/link>/;
  const descRegex = /<description>([\s\S]*?)<\/description>/;
  const pubdateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;
  
  let match;
  while ((match = itemRegex.exec(xmlStr)) !== null) {
    const item = match[1];
    const titleMatch = item.match(titleRegex);
    const linkMatch = item.match(linkRegex);
    const descMatch = item.match(descRegex);
    const dateMatch = item.match(pubdateRegex);
    
    if (titleMatch && linkMatch) {
      entries.push({
        title: titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
        link: linkMatch[1].trim(),
        description: descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : '',
        pubDate: dateMatch ? dateMatch[1].trim() : ''
      });
    }
  }
  return entries;
}

function fetchRSS(sub) {
  return new Promise((resolve, reject) => {
    const url = `https://www.reddit.com/r/${sub}/.rss`;
    https.get(url, (resp) => {
      let data = '';
      resp.on('data', chunk => data += chunk);
      resp.on('end', () => resolve(parseXML(data)));
      resp.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('🔍 开始扫描 Reddit RSS（无API）...\n');
  
  let allPosts = [];
  
  for (const sub of subreddits) {
    try {
      const posts = await fetchRSS(sub);
      console.log(`   r/${sub}: ${posts.length} 帖子`);
      allPosts.push(...posts.map(p => ({ ...p, subreddit: sub })));
    } catch (e) {
      console.log(`   r/${sub}: 错误 (${e.message})`);
    }
  }
  
  console.log(`\n📊 总计获取: ${allPosts.length} 帖子`);
  
  // Filter for demand signals
  const opportunities = [];
  for (const post of allPosts) {
    const text = (post.title + ' ' + (post.description || '')).toLowerCase();
    const hasDemand = demandWords.some(w => text.includes(w));
    if (!hasDemand) continue;
    
    const painScore = 4 + demandWords.filter(w => text.includes(w)).length + painWords.filter(w => text.includes(w)).length;
    if (painScore < 5) continue;
    
    opportunities.push({
      title: post.title,
      url: post.link,
      subreddit: post.subreddit,
      pain_score: painScore,
      snippet: (post.description || '').substring(0, 150) + '...'
    });
  }
  
  opportunities.sort((a,b) => b.pain_score - a.pain_score);
  
  console.log(`\n✅ 发现 ${opportunities.length} 个需求信号 (score≥5)\n`);
  
  if (opportunities.length === 0) {
    console.log('未找到高价值需求。建议：');
    console.log('1. 扩大时间窗口（RSS仅返回最近25-100帖子）');
    console.log('2. 直接访问 r/microsaas 手动搜索关键词');
    console.log('3. 等待 Reddit API 申请通过后全面扫描');
  } else {
    console.log('Top 10 机会：\n');
    console.log('| # | 标题 | 分数 | Subreddit | 链接 |');
    console.log('|---|---|---|---|---|');
    opportunities.slice(0,10).forEach((o, i) => {
      const title = o.title.length > 30 ? o.title.substring(0,30)+'...' : o.title;
      console.log(`| ${i+1} | ${title} | ${o.pain_score} | r/${o.subreddit} | ${o.url} |`);
    });
    
    console.log(`\n📈 统计:`);
    console.log(`  - 出现最多 subreddit: N/A`);
    console.log(`  - 平均疼痛分数: ${(opportunities.reduce((s,o)=>s+o.pain_score,0)/opportunities.length).toFixed(1)}`);
    console.log('\n🎯 下一步：');
    console.log('  1. 访问前3个链接，确认用户问题真实性');
    console.log('  2. 用 Mom Test 提问（"这个问题你每周花多少时间？"）');
    console.log('  3. 如 ≥5 人同意付费 → 用 coding-agent 构建 MVP');
  }
}

main().catch(e => {
  console.error('❌ 错误:', e.message);
  console.log('提示：可能需要安装 @xmldom/xmldom。使用 npm install @xmldom/xmldom');
});
