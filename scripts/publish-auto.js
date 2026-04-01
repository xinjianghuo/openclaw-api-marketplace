#!/usr/bin/env node

/**
 * 自动发布到 ClawHub（无交互版）
 * 自动填写 + 自动上传 + 自动提交
 */

const BrowserAgent = require('./browser-agent.js');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

(async () => {
  const agent = new BrowserAgent({ headless: false });
  await agent.start();

  console.log('🚀 自动发布到 ClawHub（无交互）\n');

  const baseDir = 'D:\\OpenClaw\\.openclaw\\workspace';
  const zipPath = path.join(baseDir, 'skills', 'node-connection-doctor.zip');
  const skillDir = path.join(baseDir, 'skills', 'node-connection-doctor');
  const readme = fs.readFileSync(path.join(skillDir, 'README.md'), 'utf8');
  const skillYaml = fs.readFileSync(path.join(skillDir, 'skills.json'), 'utf8');
  const skillJson = yaml.parseAllDocuments(skillYaml)[0].toJSON();

  // 1. 访问
  await agent.goto('https://clawhub.ai/publish-skill', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));

  // 2. 登录检查
  const isLoggedIn = await agent.eval(() => {
    const url = window.location.href;
    const hasLoginBtn = !!document.querySelector('a[href*="login"], a[href*="signin"]');
    return url.includes('publish') && !hasLoginBtn;
  });

  if (!isLoggedIn) {
    console.log('⚠️  需要登录！请手动登录后重新运行脚本。');
    await agent.close();
    process.exit(1);
  }

  console.log('✅ 已登录，开始填写表单...');

  // 3. 填写字段
  const fields = [
    { selector: 'input[name="name"], input[name="title"], #name, #title', value: 'Node Connection Doctor' },
    { selector: 'input[name="skillId"], input[name="id"], #skillId', value: skillJson.id },
    { selector: 'input[name="version"], input[name="ver"], #version', value: skillJson.version },
    { selector: 'select[name="category"], #category', value: skillJson.category },
    { selector: 'textarea[name="description"], #description', value: readme },
    { selector: 'input[name="tags"], #tags', value: skillJson.tags.join(', ') }
  ];

  for (const f of fields) {
    try {
      const el = await agent.eval((sel) => document.querySelector(sel), f.selector);
      if (el) {
        await agent.fill(el, f.value);
        console.log(`  ✅ ${f.selector} 已填写`);
      }
    } catch (e) {}
  }

  // 4. 上传 ZIP
  console.log('\n📎 上传 ZIP 文件...');
  try {
    const fileInput = await agent.eval(() => document.querySelector('input[type="file"]'));
    if (fileInput) {
      await agent.page.setInputFiles(fileInput, zipPath);
      console.log('  ✅ ZIP 已选择，等待上传...');
      await new Promise(r => setTimeout(r, 8000));
    }
  } catch (e) {
    console.log('  ❌ 文件上传失败:', e.message);
  }

  // 5. Examples
  const examplesText = skillJson.examples.map(ex =>
    `**${ex.title}**\n\`\`\`yaml\n${ex.yaml}\n\`\`\``
  ).join('\n\n');

  try {
    const textarea = await agent.eval(() => {
      const areas = Array.from(document.querySelectorAll('textarea'));
      return areas.find(a => /example|yaml/i.test(a.placeholder || '')) || areas[areas.length - 1];
    });
    if (textarea) {
      await agent.fill(textarea, examplesText);
      console.log('  ✅ Examples 已填写');
    }
  } catch (e) {}

  // 截图
  await agent.screenshot('clawhub-filled.png');

  // 6. 自动提交（无确认）
  console.log('\n🔘 查找提交按钮...');
  try {
    const btn = await agent.eval(() => {
      const btns = Array.from(document.querySelectorAll('button, input[type="submit"]'));
      return btns.find(b => /submit|publish|create/i.test(b.innerText || b.value));
    });

    if (btn) {
      console.log(`  找到按钮: "${btn.innerText || btn.value}"`);
      console.log('  点击提交...');
      await agent.click(btn);
      await new Promise(r => setTimeout(r, 5000));

      const result = await agent.eval(() => document.body.innerText.substring(0, 500));
      console.log('\n📄 结果:', result);

      if (/success|submitted|approved|pending|review/i.test(result)) {
        console.log('\n✅ 提交成功！等待审核。');
      } else {
        console.log('\n⚠️  可能有问题，请检查页面。');
      }
    } else {
      console.log('  ❌ 未找到提交按钮');
    }
  } catch (e) {
    console.log('  ❌ 提交失败:', e.message);
  }

  await agent.screenshot('clawhub-result.png');
  console.log('\n📸 截图已保存');
  console.log('✅ 流程结束');

  await agent.close();
})().catch(err => {
  console.error('❌ 错误:', err);
  process.exit(1);
});