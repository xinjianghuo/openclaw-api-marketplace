#!/usr/bin/env node
// Quick Opportunity Scanner - Hacker News only (initial test)
// Node 18+: global fetch available

const query = 'tool OR automation OR integration OR workflow OR scraping OR "i need" OR "looking for" OR recommendations';
const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&numericFilters=created_at_i>${Math.floor((Date.now() - 14*24*60*60*1000)/1000)}&hitsPerPage=200`;

(async () => {
  try {
    console.log('🔍 Fetching Hacker News stories (last 14 days)...');
    const resp = await fetch(url);
    const data = await resp.json();
    
    const opportunities = [];
    const demandWords = ['need', 'looking for', 'want', 'recommend', 'suggest', 'alternative', 'any tool', 'is there a', 'does anyone know'];
    const painWords = ['hate', 'frustrating', 'annoying', 'tedious', 'manual', 'time-consuming', 'slow', 'boring'];
    
    for (const hit of data.hits) {
      const text = (hit.title + ' ' + (hit._tags?.join(' ') || '')).toLowerCase();
      const hasDemand = demandWords.some(w => text.includes(w));
      if (!hasDemand) continue;
      
      const painScore = 4 + demandWords.filter(w => text.includes(w)).length * 2 + painWords.filter(w => text.includes(w)).length;
      if (painScore < 4) continue;
      
      opportunities.push({
        title: hit.title,
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        upvotes: hit.points || 0,
        pain_score: painScore,
        comments: hit.num_comments || 0
      });
    }
    
    opportunities.sort((a,b) => b.pain_score - a.pain_score || b.upvotes - a.upvotes);
    
    console.log(`\n✅ Found ${opportunities.length} demand signals (score≥4)\n`);
    
    if (opportunities.length === 0) {
      console.log('No opportunities found. Try broader keywords or longer time window.');
    } else {
      console.log('Top 15 opportunities:\n');
      console.log('| # | Title | Score | Upvotes | Link |');
      console.log('|---|---|---|---|---|');
      opportunities.slice(0,15).forEach((o, i) => {
        const title = o.title.length > 60 ? o.title.substring(0,60)+'...' : o.title;
        console.log(`| ${i+1} | ${title} | ${o.pain_score} | ${o.upvotes} | ${o.url} |`);
      });
      
      console.log(`\n📊 Total: ${opportunities.length} | Avg score: ${(opportunities.reduce((s,o)=>s+o.pain_score,0)/opportunities.length).toFixed(1)}`);
      console.log('\n💰 Next: Build MVP with OpenClaw if pain score ≥6 and ≥10 upvotes');
    }
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
})();
