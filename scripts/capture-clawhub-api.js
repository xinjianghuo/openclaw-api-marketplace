#!/usr/bin/env node

/**
 * 抓包分析 ClawHub 发布请求
 * 手动登录一次，我记录网络请求， reproducing
 */

const BrowserAgent = require('./browser-agent.js');

(async () => {
  const agent = new BrowserAgent({ headless: false });
  await agent.start();

  console.log('📡 抓包分析 ClawHub 发布流程\n');

  // 启用请求拦截
  await agent.page.on('request', request => {
    const url = request.url();
    if (url.includes('publish') || url.includes('api') || url.includes('graphql')) {
      console.log(`[请求] ${request.method()} ${url}`);
      const headers = request.headers();
      console.log('  Headers:', JSON.stringify(headers, null, 2).substring(0, 300));
    }
  });

  await agent.page.on('response', response => {
    const url = response.url();
    if (url.includes('publish') || url.includes('api') || url.includes('graphql')) {
      console.log(`[响应] ${response.status()} ${url}`);
    }
  });

  await agent.goto('https://clawhub.ai/publish-skill', { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 5000));

  console.log('\n💡 步骤:');
  console.log('1. 如果未登录，请手动点击 "Sign in with GitHub" 完成登录');
  console.log('2. 登录后，手动填写几个字段（测试用）');
  console.log('3. 点击提交按钮');
  console.log('4. 我会捕获请求详情，然后用代码重现\n');

  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise(resolve => rl.question('完成后按 Enter 查看抓包结果...', resolve));
  rl.close();

  console.log('\n✅ 抓包结束，请查看上方输出确定 API 端点和请求结构。');

  await agent.close();
})().catch(console.error);