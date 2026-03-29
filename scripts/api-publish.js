#!/usr/bin/env node

/**
 * 通过 API 发布技能到 ClawHub
 * 步骤:
 * 1. 获取 authentication token (从已登录的浏览器)
 * 2. 直接 POST 技能包到 ClawHub API
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 从浏览器 cookie 或 localStorage 获取 auth token
// 通常 ClawHub 使用 GitHub OAuth，token 可能在 localStorage 或 cookie 中

async function getAuthToken() {
  // 方法1: 从浏览器 localStorage 读取 (需要 Playwright)
  // 方法2: 用户手动提供
  // 方法3: 使用 openclaw config 中可能保存的 token

  console.log('🔑 需要 ClawHub API token...');
  console.log('请提供以下任一方式:');
  console.log('1. 从浏览器开发者工具复制 localStorage 中的 token');
  console.log('2. 提供 ClawHub API token (如果有)');
  console.log('3. 退出手动模式，回到浏览器交互');

  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const token = await new Promise(resolve => rl.question('\nToken: ', resolve));
  rl.close();

  return token.trim();
}

async function uploadSkill(zipPath, skillId, token) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(zipPath);

    const options = {
      hostname: 'clawhub.ai',
      port: 443,
      path: '/api/skills/publish', // 常见 API 路径，需要验证
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/zip',
        'Content-Length': fileContent.length,
        'X-Skill-ID': skillId
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n📥 响应状态: ${res.statusCode}`);
        console.log('  响应体:', data.substring(0, 500));
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', reject);
    req.write(fileContent);
    req.end();
  });
}

// 主流程
(async () => {
  const zipPath = path.join(__dirname, 'skills', 'node-connection-doctor.zip');
  const skillId = 'node-connection-doctor';

  if (!fs.existsSync(zipPath)) {
    console.error('❌ 文件不存在:', zipPath);
    process.exit(1);
  }

  console.log('🚀 准备通过 API 发布技能...\n');
  console.log('文件:', zipPath);
  console.log('Skill ID:', skillId);

  const token = await getAuthToken();
  if (!token) {
    console.log('❌ 未提供 token');
    process.exit(1);
  }

  console.log('\n📤 尝试上传...');
  try {
    const result = await uploadSkill(zipPath, skillId, token);
    if (result.status === 200 || result.status === 201) {
      console.log('\n✅ 上传成功！');
      console.log('请检查邮件或 ClawHub 仪表盘确认审核状态。');
    } else {
      console.log('\n⚠️  上传失败，可能需要检查:');
      console.log('  - API 端点是否正确');
      console.log('  - Token 是否有效');
      console.log('  - 文件格式是否正确');
    }
  } catch (e) {
    console.error('❌ 请求错误:', e.message);
  }
})().catch(console.error);