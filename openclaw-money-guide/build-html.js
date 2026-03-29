const fs = require('fs');
const path = require('path');

// 简单的 markdown 转 HTML 函数
function markdownToHtml(md) {
  let html = '';
  let inCode = false;
  
  for (let line of md.split('\n')) {
    // 代码块
    if (line.startsWith('```')) {
      if (inCode) {
        html += '</code></pre>\n';
        inCode = false;
      } else {
        html += '<pre><code>';
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      html += line + '\n';
      continue;
    }
    
    // 水平线
    if (line === '---') {
      html += '<hr>\n';
      continue;
    }
    
    // 标题
    if (line.startsWith('### ')) { html += `<h3>${line.slice(4)}</h3>\n`; continue; }
    if (line.startsWith('## ')) { html += `<h2>${line.slice(3)}</h2>\n`; continue; }
    if (line.startsWith('# ')) { html += `<h1>${line.slice(2)}</h1>\n`; continue; }
    
    // 列表
    if (line.startsWith('- ')) {
      html += `<li>${line.slice(2)}</li>\n`;
      continue;
    }
    if (/^\d+\. /.test(line)) {
      html += `<li>${line.replace(/^\d+\. /, '')}</li>\n`;
      continue;
    }
    
    // 引用
    if (line.startsWith('> ')) {
      html += `<blockquote>${line.slice(2)}</blockquote>\n`;
      continue;
    }
    
    // 段落
    if (line.trim() === '') {
      html += '<br>\n';
    } else {
      // 简单的行内格式化
      let p = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
      html += `<p>${p}</p>\n`;
    }
  }
  
  if (inCode) html += '</code></pre>\n';
  return html;
}

// 读取所有文章
const postsDir = '_posts';
const posts = [];
for (let file of fs.readdirSync(postsDir)) {
  const filePath = path.join(postsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (match) {
    const frontMatter = match[1];
    const body = match[2];
    const title = frontMatter.match(/^title:\s*"?(.*?)"?\s*$/m)?.[1] || 'Untitled';
    const date = frontMatter.match(/^date:\s*(.*?)\s*$/m)?.[1] || '';
    const categories = frontMatter.match(/^categories:\s*\[(.*?)\]$/m)?.[1] || '';
    const tags = frontMatter.match(/^tags:\s*\[(.*?)\]$/m)?.[1] || '';
    posts.push({ title, date, categories, tags, body });
  }
}

// 按日期倒序
posts.sort((a,b) => b.date.localeCompare(a.date));

// 生成完整 HTML
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenClaw 赚钱实战指南</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; background: #fafafa; color: #333; }
    header { margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    h1 { margin: 0; color: #2c3e50; }
    .subtitle { color: #666; font-size: 0.95em; margin-top: 8px; }
    nav { margin-top: 15px; }
    nav a { margin-right: 15px; color: #3498db; text-decoration: none; }
    nav a:hover { text-decoration: underline; }
    .post { margin-bottom: 50px; background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .post-meta { color: #888; font-size: 0.85em; margin-bottom: 15px; }
    .post h2 { margin-top: 0; color: #2c3e50; }
    a { color: #3498db; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; height: auto; border-radius: 4px; }
    pre { background: #282c34; color: #abb2bf; padding: 15px; overflow-x: auto; border-radius: 5px; }
    code { font-family: Consolas, Monaco, "Andale Mono", monospace; background: #f0f0f0; padding: 2px 5px; border-radius: 3px; }
    pre code { background: transparent; padding: 0; }
    blockquote { border-left: 4px solid #3498db; padding-left: 15px; color: #555; margin: 20px 0; font-style: italic; }
    ul, ol { padding-left: 20px; }
    hr { border: none; border-top: 1px solid #eee; margin: 30px 0; }
    footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 0.9em; text-align: center; }
  </style>
</head>
<body>
  <header>
    <h1>OpenClaw 赚钱实战指南</h1>
    <p class="subtitle">真实记录用 OpenClaw 自动化工具赚钱的案例、技术方案和变现策略</p>
    <nav>
      <a href="#">首页</a>
      <a href="https://github.com/yourusername/openclaw-money-guide">GitHub</a>
      <a href="https://vercel.com">Hosted on Vercel</a>
    </nav>
  </header>
  <main>
    ${posts.map(post => `
    <article class="post">
      <div class="post-meta">
        <strong>${post.title}</strong> — ${post.date} · ${post.categories ? '分类: ' + post.categories : ''} · ${post.tags ? '标签: ' + post.tags : ''}
      </div>
      ${markdownToHtml(post.body)}
    </article>
    `).join('\n')}
  </main>
  <footer>
    <p>© ${new Date().getFullYear()} OpenClaw Money Guide. Content under CC BY-NC 4.0.</p>
  </footer>
</body>
</html>`;

fs.writeFileSync('index.html', html);
console.log(`✅ 已生成 index.html，包含 ${posts.length} 篇文章。`);
`;

fs.writeFileSync('build-html.js', content);
console.log('build-html.js created.');
