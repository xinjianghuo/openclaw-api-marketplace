#!/usr/bin/env node
/**
 * opportunity-scanner CLI - Zero Cost Edition (Final)
 */

const axios = require('axios');

const CONFIG = {
  reddit: {
    subreddits: ['microsaas', 'indiehackers', 'SaaS', 'selfhosted', 'startups', 'Entrepreneur', 'ecommerce', 'dropship', 'podcasting'],
    endpoint: (sub) => `https://www.reddit.com/r/${sub}/hot.json?limit=50`
  },
  github: {
    query: 'language:javascript stars:>100 pushed:>=' + new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0],
    per_page: 30
  }
};

const DEMAND_KEYWORDS = ['need', 'want', 'looking for', 'searching for', 'where can i find', 'can\'t find', 'missing', 'lack', 'any tool', 'recommend', 'suggest', 'alternative', 'replacement', 'is there a', 'does anyone know'];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { sources: ['reddit', 'github'], minScore: 6, format: 'markdown', dryRun: false, maxResults: 50 };
  args.forEach(arg => {
    if (arg.startsWith('--min-score=')) options.minScore = parseInt(arg.split('=')[1]);
    if (arg.startsWith('--format=')) options.format = arg.split('=')[1];
    if (arg === '--dry-run') options.dryRun = true;
  });
  return options;
}

function analyzePainScore(title, selftext) {
  const text = (title + ' ' + (selftext || '')).toLowerCase();
  let score = 5;
  
  // Demand signal (+2 each, max +6)
  const demandCount = DEMAND_KEYWORDS.filter(k => text.includes(k)).length;
  score += Math.min(demandCount * 2, 6);
  
  // Pain words (+1 each, max +3)
  const painWords = ['hate', 'frustrating', 'annoying', 'tedious', 'pain', 'sucks', 'time-consuming', 'waste', 'manual', 'every day'];
  score += Math.min(painWords.filter(k => text.includes(k)).length, 3);
  
  // Meta patterns (-2 each)
  const metaPatterns = ['how i', 'built', 'revenue', 'stopped doing', 'walked away', 'lesson learned', 'got my', 'first users', 'shipped', 'i tested'];
  score -= metaPatterns.filter(k => text.includes(k)).length * 2;
  
  // Workaround (+1)
  if (text.includes('workaround') || text.includes('hack') || text.includes('manually')) score += 1;
  
  // Willingness to pay (+2)
  if (text.includes('would pay') || (text.includes('$') && text.includes('month'))) score += 2;
  
  return Math.max(1, Math.min(10, score));
}

function isDemandPost(title, selftext) {
  const text = (title + ' ' + (selftext || '')).toLowerCase();
  return DEMAND_KEYWORDS.some(k => text.includes(k));
}

function detectCategory(title, selftext) {
  const text = (title + ' ' + (selftext || '')).toLowerCase();
  const cats = {
    'ecommerce': ['shopify', 'amazon', 'ecommerce', 'dropshipping', 'product', 'inventory', 'order'],
    'developer': ['api', 'code', 'github', 'plugin', 'wordpress', 'extension', 'library', 'framework'],
    'content': ['video', 'podcast', 'blog', 'social media', 'youtube', 'linkedin'],
    'finance': ['stripe', 'payment', 'invoice', 'bookkeeping', 'accounting'],
    'marketing': ['seo', 'ads', 'email marketing', 'analytics'],
    'productivity': ['calendar', 'task', 'todo', 'notes', 'time tracking']
  };
  for (const [cat, keys] of Object.entries(cats)) {
    if (keys.some(k => text.includes(k))) return cat;
  }
  return 'general';
}

async function scanReddit() {
  const results = [];
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  for (const sub of CONFIG.reddit.subreddits) {
    try {
      const resp = await axios.get(CONFIG.reddit.endpoint(sub), {
        headers: { 
          'User-Agent': userAgent,
          'Accept': 'application/json'
        },
        timeout: 15000
      });
      if (!resp.data?.data?.children) continue;
      
      const posts = resp.data.data.children
        .filter(c => c.data.score > 5 && c.data.num_comments > 2 && c.data.title.length > 10)
        .map(c => {
          const d = c.data;
          return {
            source: 'reddit',
            subreddit: sub,
            title: d.title,
            url: `https://reddit.com${d.permalink}`,
            upvotes: d.score,
            comment_count: d.num_comments,
            selftext_preview: (d.selftext || '').substring(0, 300),
            pain_score: analyzePainScore(d.title, d.selftext),
            category: detectCategory(d.title, d.selftext),
            is_demand: isDemandPost(d.title, d.selftext)
          };
        });
      results.push(...posts);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.message;
      console.log(`  r/${sub}: error${status ? ` (${status})` : ''} - ${msg}`);
      results.push({ source: 'reddit', subreddit: sub, error: true, status, message: msg });
    }
  }
  return results;
}

async function scanGitHub() {
  try {
    const resp = await axios.get(`https://api.github.com/search/repositories?q=${encodeURIComponent(CONFIG.github.query)}&sort=stars&per_page=${CONFIG.github.per_page}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }, timeout: 10000
    });
    return resp.data.items.map(repo => ({
      source: 'github',
      name: repo.full_name,
      url: repo.html_url,
      description: repo.description || '',
      stars: repo.stargazers_count,
      pain_score: 6,
      category: detectCategory(repo.name, repo.description)
    }));
  } catch (e) { return []; }
}

function estimateMRR(opp) {
  const audience = opp.source === 'reddit' ? opp.upvotes * 100 : opp.stars * 10;
  return Math.round(audience * 0.001 * 29);
}

function generateReport(opportunities, options) {
  const date = new Date().toISOString().split('T')[0];
  let out = `# 🔍 Zero-Cost Opportunity Report - ${date}\n\n**Cost**: $0 | **Method**: Reddit+GitHub scanning\n\n## Top Demand Signals (Score≥${options.minScore})\n\n| # | Problem | Score | Source | Category |\n|---|---------|-------|--------|----------|\n`;
  
  const demand = opportunities.filter(o => o.is_demand && o.pain_score >= options.minScore);
  if (demand.length === 0) {
    out += `| - | No demand signals found. Try lower --min-score or review manual. | | | |\n\n`;
  } else {
    demand.slice(0, 15).forEach((o, i) => {
      out += `| ${i+1} | ${o.title.substring(0, 50)}${o.title.length>50?'...':''} | ${o.pain_score}/10 | ${o.source} | ${o.category} |\n`;
    });
  }
  
  out += `\n## Validation (5 days, $0)\n\n`;
  out += `1. GitHub Pages landing (Carrd alternative)\n`;
  out += `2. Post in 3 relevant subreddits/Discords\n`;
  out += `3. Collect ≥15 emails in 48h\n`;
  out += `4. If avg pain ≥7 → BUILD with coding-agent\n\n`;
  out += `---\n*Total cost so far: $0*\n`;
  
  return out;
}

async function run() {
  const opts = parseArgs();
  console.log(`🔍 Scanning (cost: $0)...`);
  
  let all = [];
  if (opts.dryRun) {
    all = [{ title: 'I need a simple competitor price tracker', pain_score: 8, is_demand: true, source: 'reddit', category: 'ecommerce', upvotes: 200 }];
  } else {
    console.log('   Reddit...');
    const reddit = await scanReddit();
    console.log(`   → ${reddit.length} Reddit posts`);
    console.log('   GitHub...');
    const github = await scanGitHub();
    console.log(`   → ${github.length} GitHub repos`);
    all = [...reddit, ...github];
  }
  
  // Sort: demand first, then by score
  all.sort((a, b) => (b.is_demand - a.is_demand) || (b.pain_score - a.pain_score));
  
  // Filter by score
  const filtered = all.filter(o => o.pain_score >= opts.minScore).slice(0, opts.maxResults);
  
  console.log(`✅ Found ${filtered.filter(f=>f.is_demand).length} demand signals (score≥${opts.minScore})`);
  console.log(`💰 Validation cost: $0`);
  
  if (opts.format === 'json') {
    console.log(JSON.stringify(filtered, null, 2));
  } else {
    console.log(generateReport(filtered, opts));
  }
}

run().catch(console.error);
