#!/usr/bin/env node

/**
 * 自动发布 Node Connection Doctor 到 ClawHub
 * 正确流程: https://clawhub.ai/publish-skill
 */

const BrowserAgent = require('./browser-agent.js');
const fs = require('fs');
const path = require('path');

(async () => {
  const agent = new BrowserAgent({ headless: false });
  await agent.start();

  console.log('🚀 开始自动发布到 ClawHub\n');

  // 1. 访问发布页面
  console.log('📍 访问发布页面: https://clawhub.ai/publish-skill');
  await agent.goto('https://clawhub.ai/publish-skill', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));

  // 2. 检查是否已登录
  console.log('\n🔐 检查登录状态...');
  const isLoggedIn = await agent.eval(() => {
    // 检查是否有登出按钮或用户头像
    const hasProfile = !!document.querySelector('[aria-label*="profile"], [aria-label*="account"]');
    const hasSignOut = Array.from(document.querySelectorAll('button, a')).some(el =>
      /sign out|logout|log out/i.test(el.innerText)
    );
    return hasProfile || hasSignOut;
  });

  if (!isLoggedIn) {
    console.log('⚠️  需要登录！');
    console.log('\n请手动完成以下操作:');
    console.log('1. 在打开的浏览器中点击 "Sign in with GitHub" (或其他方式)');
    console.log('2. 完成登录流程');
    console.log('3. 登录完成后在此窗口按 Enter 键继续...');

    // 等待用户手动登录
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    await new Promise(resolve => rl.question('', resolve));
    rl.close();

    console.log('✅ 继续自动化...');
  } else {
    console.log('✅ 已登录');
  }

  // 3. 读取本地文件内容
  const skillDir = path.join(__dirname, 'skills', 'node-connection-doctor');
  const readme = fs.readFileSync(path.join(skillDir, 'README.md'), 'utf8');
  const skillJson = JSON.parse(fs.readFileSync(path.join(skillDir, 'skills.json'), 'utf8'));
  const zipPath = path.join(__dirname, 'skills', 'node-connection-doctor.zip');

  console.log('\n📦 准备数据:');
  console.log(`   README.md: ${readme.length} 字符`);
  console.log(`   skills.json: ID=${skillJson.id}, 版本=${skillJson.version}`);
  console.log(`   附件: ${zipPath} (${(fs.statSync(zipPath).size / 1024).toFixed(1)} KB)`);

  // 4. 分析表单结构
  console.log('\n📋 分析表单字段...');
  const formFields = await agent.eval(() => {
    const fields = [];
    document.querySelectorAll('input, textarea, select').forEach((el, i) => {
      if (i >= 30) return; // 只检查前30个
      fields.push({
        id: el.id || 'none',
        name: el.name || 'none',
        type: el.type || 'text',
        placeholder: el.placeholder || '',
        label: el.labels?.[0]?.innerText?.trim() || ''
      });
    });
    return fields;
  });

  console.log(`发现 ${formFields.length} 个表单字段:`);
  formFields.forEach(f => {
    if (f.name !== 'none' || f.placeholder) {
      console.log(`  - ${f.name || f.placeholder.substring(0, 40)} (${f.type})`);
    }
  });

  // 5. 截图当前状态
  await agent.screenshot('clawhub-form-before-fill.png');
  console.log('📸 表单初始状态截图: clawhub-form-before-fill.png');

  // 6. 尝试自动填写 (基于常见字段名)
  console.log('\n✍️ 尝试自动填写...');

  const fieldMappings = [
    { selector: '[name="name"], input[name="title"], #name, #title', value: 'Node Connection Doctor' },
    { selector: '[name="description"], textarea[name="desc"], #description', value: readme },
    { selector: '[name="skillId"], input[name="id"], #skillId', value: skillJson.id },
    { selector: '[name="version"], input[name="ver"], #version', value: skillJson.version },
    { selector: '[name="category"], select[name="category"]', value: 'troubleshooting' },
    { selector: 'input[type="file"][name="zip"], input[type="file"][name="file"], input[type="file"]', value: zipPath }
  ];

  for (const mapping of fieldMappings) {
    try {
      // 查找元素 (只使用有效的 CSS 选择器)
      const el = await agent.eval((sel) => {
        const selects = sel.split(',');
        for (const s of selects) {
          try {
            const el = document.querySelector(s.trim());
            if (el) return el;
          } catch (e) {
            continue;
          }
        }
        return null;
      }, mapping.selector);

      if (el) {
        const tagName = el.tagName.toLowerCase();
        if (tagName === 'input' && el.type === 'file') {
          // 文件上传特殊处理
          console.log(`  ⚠️  文件字段需要手动上传: ${mapping.selector.split(',')[0]} -> ${mapping.value}`);
        } else {
          await agent.fill(await agent.eval((sel) => {
            const selects = sel.split(',');
            for (const s of selects) {
              try {
                const el = document.querySelector(s.trim());
                if (el) return el;
              } catch (e) {
                continue;
              }
            }
            return null;
          }, mapping.selector), mapping.value);
          console.log(`  ✅ 填写: ${mapping.selector.split(',')[0]} = "${mapping.value.substring(0, 30)}..."`);
        }
      }
    } catch (e) {
      // 静默失败，某些字段可能不存在
    }
  }

  // 7. 文件上传 (手动步骤说明)
  console.log('\n📎 文件上传说明:');
  console.log('由于浏览器安全限制，自动上传 ZIP 文件较复杂。');
  console.log('请在表单中手动:');
  console.log(`  1. 找到 "Upload ZIP" 或 "Skill Package" 字段`);
  console.log(`  2. 点击并选择: ${path.resolve(zipPath)}`);
  console.log('  3. 等待上传完成');

  // 8. 截图供参考
  await agent.screenshot('clawhub-form-filled.png');
  console.log('\n📸 表单填写后截图: clawhub-form-filled.png');

  // 9. 定价部分手动填写提示
  console.log('\n💰 定价设置 (3个计划):');
  console.log('  Plan 1: Single Diagnostic - $5 (one-time)');
  console.log('  Plan 2: Full Repair Service - $15 (one-time)');
  console.log('  Plan 3: Enterprise API - $50/month');
  console.log('请在定价部分手动添加以上3个计划');

  console.log('\n✅ 自动化部分完成！');
  console.log('请手动检查表单，确认无误后提交。');

  await agent.close();
})().catch(err => {
  console.error('\n❌ 错误:', err.message);
  process.exit(1);
});