#!/usr/bin/env node

/**
 * 从浏览器获取 ClawHub authentication token
 * 然后用 API 直接发布
 */

const BrowserAgent = require('./browser-agent.js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const yaml = require('yaml');

(async () => {
  const agent = new BrowserAgent({ headless: false });
  await agent.start();

  console.log('🔑 从浏览器获取 ClawHub auth token...\n');

  // 访问 clawhub.ai
  await agent.goto('https://clawhub.ai', { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 3000));

  // 检查是否已登录（查看 LocalStorage）
  console.log('检查 LocalStorage...');
  const tokenInfo = await agent.eval(() => {
    try {
      // 常见 key 名称
      const possibleKeys = ['token', 'auth_token', 'accessToken', 'clawhub_token', 'session'];
      const found = {};
      possibleKeys.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) found[key] = val.substring(0, 50) + '...';
      });
      return { found, count: Object.keys(found).length };
    } catch (e) {
      return { error: e.message };
    }
  });

  console.log('LocalStorage 内容:', JSON.stringify(tokenInfo, null, 2));

  // 检查 cookies
  console.log('\n检查 Cookies...');
  const cookies = await agent.eval(() => document.cookie.split(';').map(c => c.trim()));
  console.log('Cookies:', cookies);

  // 尝试从 network requests 找 Authorization header (访问 graphql 或 api)
  console.log('\n尝试访问可能需要在登录后才能访问的页面...');
  await agent.goto('https://clawhub.ai/publish-skill', { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 5000));

  // 如果看到 "Sign in"，则需要登录
  const pageText = await agent.eval(() => document.body.innerText);
  if (/sign in|log in/i.test(pageText)) {
    console.log('\n❌ 需要登录！');
    console.log('请在浏览器中点击 "Sign in with GitHub" 完成登录。');
    console.log('登录完成后，我会自动抓取 token。\n');

    // 等待登录完成
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    await new Promise(resolve => rl.question('登录完成后按 Enter 继续...', resolve));
    rl.close();

    // 登录后重新获取
    await agent.goto('https://clawhub.ai', { waitUntil: 'networkidle' });
    await new Promise(r => setTimeout(r, 3000));
  }

  // 再次检查 LocalStorage
  const afterLogin = await agent.eval(() => {
    const keys = Object.keys(localStorage);
    const tokens = {};
    keys.forEach(k => {
      try {
        const v = localStorage.getItem(k);
        if (v && (k.includes('token') || k.includes('auth') || v.length > 50)) {
          tokens[k] = v;
        }
      } catch (e) {}
    });
    return tokens;
  });

  console.log('\n登录后 LocalStorage tokens:', Object.keys(afterLogin));
  if (Object.keys(afterLogin).length > 0) {
    console.log('找到可能的 token，尝试 API 发布...\n');
    // 直接尝试 API
    await tryAPIPublish(agent, afterLogin);
  } else {
    console.log('\n⚠️  未找到 token，可能需要检查或使用其他方法。');
  }

  await agent.close();
})().catch(console.error);

async function tryAPIPublish(agent, tokens) {
  const baseDir = 'D:\\OpenClaw\\.openclaw\\workspace';
  const zipPath = path.join(baseDir, 'skills', 'node-connection-doctor.zip');
  const skillDir = path.join(baseDir, 'skills', 'node-connection-doctor');
  const readme = fs.readFileSync(path.join(skillDir, 'README.md'), 'utf8');
  const skillYaml = fs.readFileSync(path.join(skillDir, 'skills.json'), 'utf8');
  const skillData = yaml.parseAllDocuments(skillYaml)[0].toJSON();

  // 尝试多种可能的 API 端点
  const endpoints = [
    '/api/skills/publish',
    '/api/v1/skills',
    '/api/skills',
    '/skills/api/publish',
    '/graphql'  // 如果是 GraphQL
  ];

  // 取第一个 token 值
  const token = tokens[Object.keys(tokens)[0]];
  console.log('使用 Token:', token.substring(0, 30) + '...');

  console.log('\n📝 准备发布数据:');
  console.log(`  Name: ${skillData.name}`);
  console.log(`  ID: ${skillData.id}`);
  console.log(`  ZIP: ${zipPath} (${(fs.statSync(zipPath).size / 1024).toFixed(1)} KB)`);

  // 让用户选择或直接尝试
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const choice = await new Promise(resolve => rl.question('\n尝试哪个端点? (1-4 或 q 退出): ', resolve));
  rl.close();

  if (choice === 'q') return;

  const endpoint = endpoints[parseInt(choice) - 1];
  if (!endpoint) {
    console.log('无效选择');
    return;
  }

  console.log(`\n📤 尝试 POST ${endpoint}`);

  // 构建 multipart body (简化版，实际应使用 form-data 库)
  const boundary = '----Boundary' + Date.now();
  const zipContent = fs.readFileSync(zipPath);

  let body = '';
  const fields = [
    { name: 'name', value: skillData.name },
    { name: 'skillId', value: skillData.id },
    { name: 'version', value: skillData.version || '1.0.0' },
    { name: 'category', value: skillData.category || 'troubleshooting' },
    { name: 'tags', value: (skillData.tags || []).join(', ') },
    { name: 'description', value: readme },
    { name: 'examples', value: JSON.stringify(skillData.examples) }
  ];

  fields.forEach(f => {
    body += `--${boundary}\r\nContent-Disposition: form-data; name="${f.name}"\r\n\r\n${f.value}\r\n`;
  });
  body += `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="skill.zip"\r\nContent-Type: application/zip\r\n\r\n`;
  body += zipContent;
  body += `\r\n--${boundary}--\r\n`;

  const options = {
    hostname: 'clawhub.ai',
    port: 443,
    path: endpoint,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(body)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n状态: ${res.statusCode}`);
        console.log('响应:', data.substring(0, 500));
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}