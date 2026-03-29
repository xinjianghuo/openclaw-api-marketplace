#!/usr/bin/env node

/**
 * 直接调用 ClawHub API 发布技能
 * 无需浏览器，纯 HTTP
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const yaml = require('yaml');

async function uploadToClawHub() {
  const baseDir = 'D:\\OpenClaw\\.openclaw\\workspace';
  const zipPath = path.join(baseDir, 'skills', 'node-connection-doctor.zip');
  const skillDir = path.join(baseDir, 'skills', 'node-connection-doctor');

  // 读取技能文件
  const readme = fs.readFileSync(path.join(skillDir, 'README.md'), 'utf8');
  const skillYaml = fs.readFileSync(path.join(skillDir, 'skills.json'), 'utf8');
  const skillData = yaml.parseAllDocuments(skillYaml)[0].toJSON();

  // 准备 multipart/form-data
  const boundary = '----ClawHubUpload' + Date.now();
  const zipContent = fs.readFileSync(zipPath);

  // 构建表单字段
  const formFields = [
    { name: 'name', value: skillData.name || 'Node Connection Doctor' },
    { name: 'skillId', value: skillData.id },
    { name: 'version', value: skillData.version || '1.0.0' },
    { name: 'category', value: skillData.category || 'troubleshooting' },
    { name: 'tags', value: (skillData.tags || []).join(', ') },
    { name: 'description', value: readme },
    { name: 'examples', value: JSON.stringify(skillData.examples) },
    { name: 'requirements', value: 'OpenClaw >= v2026.3.23' }
  ];

  // 构建 multipart body
  let body = '';
  for (const field of formFields) {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${field.name}"\r\n\r\n`;
    body += `${field.value}\r\n`;
  }
  // 添加文件
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="file"; filename="node-connection-doctor.zip"\r\n`;
  body += `Content-Type: application/zip\r\n\r\n`;
  body += zipContent;
  body += `\r\n--${boundary}--\r\n`;

  // 需要 Authorization header (从登录的浏览器获取)
  console.log('🔑 需要 ClawHub API Token');
  console.log('请从浏览器获取:');
  console.log('  1. 打开 https://clawhub.ai');
  console.log('  2. F12 → Application → Local Storage → clawhub.ai');
  console.log('  3. 找到 "token" 或 "auth_token" 或 "accessToken"');
  console.log('  4. 复制粘贴给我\n');

  const readline = require('readline');
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const token = await new Promise(resolve => rl.question('Token: ', resolve));
  rl.close();

  if (!token) {
    console.log('❌ 未提供 token');
    process.exit(1);
  }

  // 发送请求
  console.log('\n📤 发送发布请求...');

  const options = {
    hostname: 'clawhub.ai',
    port: 443,
    path: '/api/skills/publish', // 常见路径
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
        console.log(`\n📥 响应状态: ${res.statusCode}`);
        console.log('  响应头:', res.headers);
        console.log('  响应体:', data.substring(0, 500));
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// 执行
uploadToClawHub()
  .then(result => {
    if (result.status === 200 || result.status === 201) {
      console.log('\n✅ 发布成功！');
      console.log('请检查邮箱确认审核状态。');
    } else {
      console.log('\n⚠️  发布失败，可能原因:');
      console.log('  - API 端点不正确 (需要查找正确路径)');
      console.log('  - Token 无效或过期');
      console.log('  - 字段格式错误');
      console.log('\n我将尝试找出正确的 API...');
    }
  })
  .catch(err => {
    console.error('❌ 请求错误:', err.message);
  });