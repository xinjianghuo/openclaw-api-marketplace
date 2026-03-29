#!/usr/bin/env node
// HN Ask HN Scanner - focused on demand signals
// Node 18+: global fetch

(async () => {
  try {
    // Get recent Ask HN stories (last 7 days)
    const query = 'recommend OR suggest OR alternative OR "any tool" OR "does anyone know"';
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=ask_hn&numericFilters=created_at_i>${Math.floor((Date.now() - 7*24*60*60*1000)/1000)}&hitsPerPage=200`;
    
    console.log('🔍 Scanning Ask HN (last 7 days) for demand signals...');
    const resp = await fetch(url);
    const data = await resp.json();
    
    const demandWords = ['need', 'want', 'looking for', 'recommend', 'suggest', 'alternative', 'any tool', 'is there a', 'does anyone know', 'tool for', 'automate'];
    const painWords = ['hate', 'frustrating', 'annoying', 'tedious', 'pain', 'manual', 'time-consuming', 'slow', 'boring', 'repetitive', 'waste'];
    
    const opportunities = [];
    for (const hit of data.hits) {
      const text = hit.title.toLowerCase();
      const hasDemand = demandWords.some(w => text.includes(w));
      if (!hasDemand) continue;
      
      const painScore = 3 + demandWords.filter(w => text.includes(w)).length * 2 + painWords.filter(w => text.includes(w)).length;
      if (painScore < 5) continue;
      
      opportunities.push({
        title: hit.title,
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        upvotes: hit.points || 0,
        comments: hit.num_comments || 0,
        pain_score: painScore
      });
    }
    
    opportunities.sort((a,b) => b.pain_score - a.pain_score || b.upvotes - a.upvotes);
    
    console.log(`\n✅ Found ${opportunities.length} demand signals (score≥5)\n`);
    
    if (opportunities.length === 0) {
      console.log('No demand signals in Ask HN. Try expanding time window or keywords.');
      console.log('Consider: manual search of r/microsaas (if Reddit access obtained) or direct user interviews.');
    } else {
      console.log('Top opportunities:\n');
      console.log('| # | Title | Score | Upvotes | Comments | Link |');
      console.log('|---|---|---|---|---|---|');
      opportunities.slice(0,10).forEach((o, i) => {
        const title = o.title.length > 50 ? o.title.substring(0,50)+'...' : o.title;
        console.log(`| ${i+1} | ${title} | ${o.pain_score} | ${o.upvotes} | ${o.comments} | ${o.url} |`);
      });
      
      console.log(`\n📊 Total: ${opportunities.length} | Avg score: ${(opportunities.reduce((s,o)=>s+o.pain_score,0)/opportunities.length).toFixed(1)}`);
      console.log('\n🎯 Top 3 for Manual Validation:');
      opportunities.slice(0,3).forEach((o, i) => {
        console.log(`  ${i+1}. ${o.title} (score:${o.pain_score}) - post link: ${o.url}`);
      });
    }
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
})();
