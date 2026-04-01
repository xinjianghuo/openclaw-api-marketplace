#!/usr/bin/env node
/**
 * Quick Opportunity Scanner (No Reddit) - HN + GitHub
 * Zero-cost, immediate execution (Node.js 18+ with native fetch)
 */

// No external dependencies - use global fetch

const DEMAND_KEYWORDS = ['need', 'want', 'looking for', 'searching for', 'where can i find', 'can\'t find', 'missing', 'lack', 'any tool', 'recommend', 'suggest', 'alternative', 'replacement', 'is there a', 'does anyone know', 'tool for', 'automate', 'automation', 'script for'];
const PAIN_WORDS = ['hate', 'frustrating', 'annoying', 'tedious', 'pain', 'sucks', 'time-consuming', 'waste', 'manual', 'every day', 'slow', 'boring', 'repetitive'];

function analyzePainScore(text) {
  text = text.toLowerCase();
  let score = 4; // base

  // Demand signals
  const demandCount = DEMAND_KEYWORDS.filter(k => text.includes(k)).length;
  score += Math.min(demandCount * 3, 9);

  // Pain intensifiers
  score += PAIN_WORDS.filter(k => text.includes(k)).length;

  // Willingness to pay
  if (/would pay|how much|price|budget|affordable/i.test(text)) score += 2;
  if (/recurring|monthly|subscription/i.test(text)) score += 1;

  return Math.max(1, Math.min(10, score));
}

function detectCategory(text) {
  text = text.toLowerCase();
  const map = {
    'ecommerce': ['shopify', 'amazon', 'woocommerce', 'ecommerce', 'dropshipping', 'product', 'inventory', 'order', 'cart'],
    'developer': ['api', 'code', 'github', 'plugin', 'wordpress', 'extension', 'library', 'framework', 'npm', 'docker'],
    'content': ['video', 'podcast', 'blog', 'social media', 'youtube', 'linkedin', 'instagram', 'tiktok', 'content'],
    'finance': ['stripe', 'payment', 'invoice', 'bookkeeping', 'accounting', 'tax', 'payroll', 'receipt'],
    'marketing': ['seo', 'ads', 'email marketing', 'analytics', 'conversion', 'crm', 'campaign'],
    'productivity': ['calendar', 'task', 'todo', 'notes', 'time tracking', 'meeting', 'agenda', 'reminder']
  };
  for (const [cat, keys] of Object.entries(map)) {
    if (keys.some(k => text.includes(k))) return cat;
  }
  return 'general';
}

// 1. Scan Hacker News (Algolia API)
async function scanHN() {
  const results = [];
  try {
    const query = 'need OR looking OR want OR recommend OR suggest OR tool OR alternative';
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&numericFilters=created_at_i>${Math.floor((Date.now() - 7*24*60*60*1000)/1000)}&hitsPerPage=100`;
    const resp = await fetch(url);
    const data = await resp.json();
    
    for (const hit of data.hits) {
      const text = (hit.title + ' ' + (hit._tags?.join(' ') || '')).toLowerCase();
      if (!DEMAND_KEYWORDS.some(k => text.includes(k))) continue;
      
  // Lower thresholds for initial scan
  const painThresh = 4; // lowered from 6
  const minScore = 4; // for filtering

      results.push({
        source: 'Hacker News',
        title: hit.title,
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        upvotes: hit.points || 0,
        comments: hit.num_comments || 0,
        pain_score,
        category: detectCategory(hit.title),
        is_demand: true
      });
    }
  } catch (e) { console.log(`   HN: error ${e.message}`); }
  return results;
}

// 2. Scan GitHub (Trending/Recent repos with pain keywords in description)
async function scanGitHub() {
  const results = [];
  try {
    const keywords = ['automation', 'scraper', 'integration', 'connector', 'sync', 'workflow', 'cli', 'tool'];
    const query = `language:javascript OR language:python OR language:go stars:>100 pushed:>=${new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0]} ${keywords.map(k => `"${k}"`).join(' OR ')}`;
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=30`;
    const resp = await fetch(url, {
      headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'opportunity-scanner/1.0' }
    });
    const data = await resp.json();
    
    for (const repo of data.items) {
      const text = (repo.description || '').toLowerCase();
      if (!DEMAND_KEYWORDS.some(k => text.includes(k)) && !PAIN_WORDS.some(k => text.includes(k))) continue;
      
      results.push({
        source: 'GitHub',
        title: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        pain_score: 7,
        category: detectCategory(repo.name + ' ' + (repo.description || '')),
        is_demand: false // repo indicates existing solution, not direct demand
      });
    }
  } catch (e) { console.log(`   GitHub: error ${e.message}`); }
  return results;
}

// 3. Scan Product Hunt (skip - requires API key)
function scanProductHunt() {
  return [];
}

function generateReport(opportunities) {
  const date = new Date().toISOString().split('T')[0];
  let out = `# 🔍 Zero-Cost Opportunity Report - ${date}\n\n**Cost**: $0 | **Sources**: Hacker News + GitHub (+Product Hunt pending)\n\n`;
  
  out += `## 🎯 Top Demand Signals (Score≥6)\n\n`;
  out += `| # | Problem / Idea | Score | Source | Category | Link |\n|---|----------------|-------|--------|----------|------|\n`;

  const demand = opportunities.filter(o => o.is_demand).sort((a,b) => b.pain_score - a.pain_score).slice(0, 20);
  
  if (demand.length === 0) {
    out += `| - | No demand signals found yet. Try lower score threshold. | - | - | - | - |\n\n`;
  } else {
    demand.forEach((o, i) => {
      const title = o.title.length > 50 ? o.title.substring(0,50)+'...' : o.title;
      out += `| ${i+1} | ${title} | ${o.pain_score}/10 | ${o.source} | ${o.category} | [Link](${o.url}) |\n`;
    });
  }
  
  out += `\n## 📊 Summary\n\n`;
  out += `- Total demand signals: ${demand.length}\n`;
  out += `- Avg pain score: ${demand.length ? (demand.reduce((s,o)=>s+o.pain_score,0)/demand.length).toFixed(1) : 'N/A'}\n`;
  out += `- Top category: ${demand.length ? demand[0].category : 'N/A'}\n`;
  
  out += `\n## 🚀 5-Day Validation Plan ($0)\n\n`;
  out += `1. **Day 1-2**: Create Carrd landing page with problem statement + email capture\n`;
  out += `2. **Day 2-3**: Post in relevant subreddits + Hacker News "Who is hiring?" (as a tool)\n`;
  out += `3. **Day 3-4**: Reach out to 10 people who commented similar pains\n`;
  out += `4. **Day 4-5**: If ≥15 emails and avg pain ≥7 → BUILD MVP with OpenClaw\n`;
  out += `5. **Day 5**: Offer lifetime deal ($49) to first 5 beta users\n`;
  
  out += `\n---\n*Total cost so far: $0*\n`;
  return out;
}

async function run() {
  console.log(`🔍 Starting Zero-Cost Opportunity Scan\n`);
  console.log(`   Sources: Hacker News + GitHub (no Reddit)\n`);

  const hn = await scanHN();
  console.log(`   ✅ HN: ${hn.length} demand posts`);
  
  const gh = await scanGitHub();
  console.log(`   ✅ GitHub: ${gh.length} repos (pain points)`);
  
  const all = [...hn, ...gh];
  all.sort((a,b) => (b.pain_score - a.pain_score) || (b.upvotes||b.stars||0 - (a.upvotes||a.stars||0)));
  
  console.log(`\n📊 Total opportunities: ${all.length}`);
  console.log(`💰 Validation budget: $0\n`);
  
  console.log(generateReport(all));
}

run().catch(console.error);
