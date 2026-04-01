#!/usr/bin/env node

/**
 * 自动上传 Node Connection Doctor 到 ClawHub
 * 步骤:
 * 1. 访问 clawhub.com/publish
 * 2. 检查是否需要登录
 * 3. 填写表单
 * 4. 上传 zip 文件
 * 5. 提交
 */

const BrowserAgent = require('./browser-agent.js');

(async () => {
  const agent = new BrowserAgent({ headless: false }); // 显示浏览器以便调试
  await agent.start();

  console.log('🚀 开始 ClawHub 发布流程...\n');

  // 1. 访问发布页面
  console.log('📍 访问 ClawHub 发布页面...');
  await agent.goto('https://clawhub.com/publish', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));

  const title = await agent.title();
  console.log('页面标题:', title);

  // 检查登录状态
  const loginNeeded = await agent.eval(() => {
    return !!document.querySelector('a[href*="login"], button:contains("Sign in")');
  });

  if (loginNeeded) {
    console.log('⚠️ 需要登录，但这是自动化流程的障碍');
    console.log('请手动完成以下步骤:');
    console.log('1. 访问 https://clawhub.com/publish');
    console.log('2. 登录你的账户');
    console.log('3. 上传 skills/node-connection-doctor.zip');
    console.log('4. 填写表单 (使用 PUBLISH_READY.md 中的内容)');
    console.log('5. 提交审核');
    await agent.close();
    process.exit(0);
  } else {
    console.log('✅ 已登录状态良好');
  }

  // 2. 检查表单字段
  console.log('\n📝 检查表单字段...');
  const fields = await agent.eval(() => {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    return inputs.map(input => ({
      name: input.name || input.id || 'unnamed',
      type: input.type,
      placeholder: input.placeholder || ''
    }));
  });

  console.log('发现字段:', JSON.stringify(fields, null, 2));

  // 3. 尝试填写
  console.log('\n✍️ 尝试自动填写...');

  // 读取本地文件内容
  const fs = require('fs');
  const readme = fs.readFileSync('skills/node-connection-doctor/README.md', 'utf8');
  const skillsJson = JSON.parse(fs.readFileSync('skills/node-connection-doctor/skills.json', 'utf8'));

  // 填充字段 (根据实际 DOM 调整)
  try {
    await agent.fill('input[name="name"]', 'Node Connection Doctor');
    await agent.fill('textarea[name="description"]', readme);
    await agent.fill('input[name="skillId"]', 'node-connection-doctor');
    await agent.fill('input[name="version"]', '1.0.0');
    console.log('✅ 基本信息填写完成');
  } catch (e) {
    console.log('⚠️ 自动填写失败 (需要手动):', e.message);
  }

  // 4. 上传文件
  console.log('\n📎 准备上传文件...');
  console.log('文件路径: skills/node-connection-doctor.zip');
  console.log('大小:', (fs.statSync('skills/node-connection-doctor.zip').size / 1024).toFixed(1), 'KB');

  // 注意: Playwright 的文件上传需要 input[type=file]
  // 这里给出手动步骤
  console.log('\n⏳ 由于安全限制，文件上传需要手动操作:');
  console.log('请在浏览器中手动:');
  console.log('1. 点击 "Upload" 或 "Choose File"');
  console.log('2. 选择 skills/node-connection-doctor.zip');
  console.log('3. 等待上传完成');

  // 截图供检查
  await agent.screenshot('clawhub-publish-form.png');
  console.log('📸 表单截图已保存: clawhub-publish-form.png');

  console.log('\n✅ 自动化部分完成');
  console.log('请手动完成剩余步骤并提交。');

  await agent.close();
})().catch(err => {
  console.error('❌ 失败:', err);
  process.exit(1);
});