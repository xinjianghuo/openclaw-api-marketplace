#!/usr/bin/env node
// GitHub Issues & Discussions Scanner - pain points from devs
// Node 18+: global fetch

const keywords = ['need', 'looking for', 'recommend', 'suggest', 'alternative', 'any tool', 'automate', 'integration', 'connector', 'sync', 'workflow', 'api'];
const topics = ['shopify', 'stripe', 'podcast', 'price monitoring', 'bookkeeping', 'seo', 'ecommerce', 'wordpress'];

(async () => {
  try {
    console.log('🔍 Scanning GitHub issues for pain points...\n');
    
    // Search issues with "help wanted" or "question" in popular repos
    const query = `is:issue is:open ${keywords.map(k => `"${k}"`).join(' OR ')} language:javascript OR language:python stars:>1000`;
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=created&per_page=50`;
    
    const resp = await fetch(url, {
      headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'opportunity-scanner/1.0' }
    });
    const data = await resp.json();
    
    console.log(`GitHub API response: ${data.total_count} total issues (showing first 50)`);
    
    const opportunities = [];
    const painWords = ['hate', 'frustrating', 'annoying', 'tedious', 'pain', 'sucks', 'time-consuming', 'slow', 'boring', 'repetitive', 'manual'];
    
    for (const issue of data.items || []) {
      const text = (issue.title + ' ' + (issue.body || '')).toLowerCase();
      const hasDemand = keywords.some(k => text.includes(k));
      if (!hasDemand) continue;
      
      const painScore = 5 + keywords.filter(k => text.includes(k)).length + painWords.filter(w => text.includes(w)).length;
      if (painScore < 5) continue;
      
      opportunities.push({
        type: 'issue',
        title: issue.title,
        url: issue.html_url,
        repo: issue.repository_url?.split('/').pop(),
        pain_score: painScore,
        comments: issue.comments,
        created: issue.created_at
      });
    }
    
    // Also search repositories that might be solutions
    console.log('\n🔍 Scanning recent repos that might address pain points...');
    const repoQuery = `language:javascript OR language:python stars:>100 pushed:>=${new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]} ${topics.map(t => `"${t}"`).join(' OR ')}`;
    const repoUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(repoQuery)}&sort=stars&per_page=30`;
    
    const repoResp = await fetch(repoUrl, {
      headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'opportunity-scanner/1.0' }
    });
    const repoData = await repoResp.json();
    
    console.log(`Repo search: ${repoData.total_count} repos found`);
    
    for (const repo of repoData.items || []) {
      const text = (repo.description || '').toLowerCase();
      if (!topics.some(t => text.includes(t))) continue;
      
      opportunities.push({
        type: 'repo',
        title: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        pain_score: 6,
        category: topics.find(t => text.includes(t)) || 'general'
      });
    }
    
    if (opportunities.length === 0) {
      console.log('\n❌ No pain points found with current filters.');
      console.log('Try: broadened keywords, longer time window, or manual search.');
      process.exit(0);
    }
    
    console.log(`\n✅ Total opportunities: ${opportunities.length}\n`);
    
    console.log('Top 10 by pain score:\n');
    console.log('| # | Type | Title | Score | Link |');
    console.log('|---|---|---|---|---|');
    opportunities.sort((a,b)=>b.pain_score-a.pain_score).slice(0,10).forEach((o, i) => {
      const title = o.title.length > 40 ? o.title.substring(0,40)+'...' : o.title;
      const type = o.type || 'repo';
      console.log(`| ${i+1} | ${type} | ${title} | ${o.pain_score} | ${o.url} |`);
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`  - Issues: ${opportunities.filter(o=>o.type==='issue').length}`);
    console.log(`  - Repos: ${opportunities.filter(o=>o.type==='repo').length}`);
    console.log(`  - Avg pain: ${(opportunities.reduce((s,o)=>s+o.pain_score,0)/opportunities.length).toFixed(1)}`);
    
    console.log('\n💡 Next: Validate top 3 by reaching out to issue authors or community.');
    
  } catch (e) {
    console.error('❌ Error:', e.message, e.stack);
  }
})();
