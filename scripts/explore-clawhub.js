#!/usr/bin/env node

/**
 * 探索 ClawHub 网站结构，找到正确的发布流程
 */

const BrowserAgent = require('./browser-agent.js');

(async () => {
  const agent = new BrowserAgent({ headless: false });
  await agent.start();

  console.log('🔍 探索 ClawHub 网站...\n');

  // 1. 访问主页
  console.log('1. 访问主页 https://clawhub.com');
  await agent.goto('https://clawhub.com', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));

  const title = await agent.title();
  console.log('   页面标题:', title);

  // 2. 截图
  await agent.screenshot('clawhub-home.png');
  console.log('   📸 截图已保存: clawhub-home.png');

  // 3. 寻找导航链接
  const navLinks = await agent.eval(() => {
    const links = Array.from(document.querySelectorAll('a'));
    return links.slice(0, 20).map(a => ({
      text: a.innerText.trim().substring(0, 30),
      href: a.href
    }));
  });

  console.log('\n2. 导航链接 (前20):');
  navLinks.forEach(link => {
    if (link.text) console.log(`   "${link.text}" -> ${link.href}`);
  });

  // 4. 寻找 "Sign in" 或 "Login"
  const authLinks = await agent.eval(() => {
    const links = Array.from(document.querySelectorAll('a'));
    return links.filter(a => /login|sign in|signin/i.test(a.innerText || a.href));
  });

  console.log('\n3. 登录相关链接:', authLinks.length);
  authLinks.forEach(link => {
    console.log(`   ${link.innerText} -> ${link.href}`);
  });

  // 5. 寻找发布按钮
  const publishButtons = await agent.eval(() => {
    const btns = Array.from(document.querySelectorAll('button, a[role="button"]'));
    return btns.filter(b => /publish|create|new skill|add skill/i.test(b.innerText || ''));
  });

  console.log('\n4. 发布相关按钮:', publishButtons.length);
  publishButtons.forEach(btn => {
    console.log(`   "${btn.innerText}"`);
  });

  // 6. 尝试访问常见发布路径
  console.log('\n5. 测试可能的发布路径...');
  const paths = ['/publish', '/skills/new', '/skills/create', '/dashboard/publish', '/upload', '/skill/new'];
  for (const path of paths) {
    try {
      const url = `https://clawhub.com${path}`;
      await agent.goto(url, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 2000));
      const status = await agent.eval(() => document.body.innerText.substring(0, 100));
      console.log(`   ${path}: ${status.substring(0, 50)}...`);
    } catch (e) {
      console.log(`   ${path}: 失败 - ${e.message}`);
    }
  }

  console.log('\n✅ 探索完成，请检查截图和输出确定正确流程');
  await agent.close();
})().catch(console.error);