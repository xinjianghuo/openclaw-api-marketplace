#!/usr/bin/env node

/**
 * ClawHub 发布 - 增强版自动提交
 * 策略: 多种方式尝试提交
 */

const BrowserAgent = require('./browser-agent.js');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

(async () => {
  const agent = new BrowserAgent({ headless: false });
  await agent.start();

  console.log('🚀 ClawHub 发布 (增强版)\n');

  const baseDir = 'D:\\OpenClaw\\.openclaw\\workspace';
  const zipPath = path.join(baseDir, 'skills', 'node-connection-doctor.zip');
  const skillDir = path.join(baseDir, 'skills', 'node-connection-doctor');
  const readme = fs.readFileSync(path.join(skillDir, 'README.md'), 'utf8');
  const skillJson = yaml.parseAllDocuments(fs.readFileSync(path.join(skillDir, 'skills.json'), 'utf8'))[0].toJSON();

  await agent.goto('https://clawhub.ai/publish-skill', { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 8000));

  // 确保登录
  const isLoggedIn = await agent.eval(() => !document.querySelector('a[href*="login"]'));
  if (!isLoggedIn) {
    console.log('❌ 未登录，请手动登录后重试');
    await agent.close();
    process.exit(1);
  }

  console.log('✅ 登录确认，开始填表...\n');

  // 填写字段
  const fields = [
    { name: 'name', value: 'Node Connection Doctor' },
    { name: 'skillId', value: skillJson.id },
    { name: 'version', value: skillJson.version },
    { name: 'category', value: skillJson.category },
    { name: 'description', value: readme },
    { name: 'tags', value: skillJson.tags.join(', ') }
  ];

  for (const f of fields) {
    try {
      // 直接用 name 属性查找
      const el = await agent.eval((n) => document.querySelector(`[name="${n}"]`), f.name);
      if (el) {
        await agent.fill(el, f.value);
        console.log(`  ✅ ${f.name} = ${f.value.substring(0, 30)}...`);
      } else {
        console.log(`  ⚠️  未找到字段: ${f.name}`);
      }
    } catch (e) {}
  }

  // 上传文件
  console.log('\n📎 上传 ZIP...');
  try {
    const fileInput = await agent.eval(() => document.querySelector('input[type="file"]'));
    if (fileInput) {
      await agent.page.setInputFiles(fileInput, zipPath);
      console.log('  ✅ ZIP 已选择');
      await new Promise(r => setTimeout(r, 5000));
    } else {
      console.log('  ⚠️  没找到文件输入框');
    }
  } catch (e) {
    console.log('  ❌ 上传失败:', e.message);
  }

  // Examples
  const examplesText = skillJson.examples.map(ex =>
    `**${ex.title}**\n\`\`\`yaml\n${ex.yaml}\n\`\`\``
  ).join('\n\n');

  try {
    const textareas = await agent.eval(() => Array.from(document.querySelectorAll('textarea')));
    if (textareas.length > 0) {
      await agent.fill(textareas[0], examplesText);
      console.log('  ✅ Examples 已填');
    }
  } catch (e) {}

  await agent.screenshot('clawhub-filled.png');

  // 多种方式查找提交
  console.log('\n🔍 查找提交方式...');

  // 方式1: 查找包含 "submit/publish/create" 的按钮
  let btn = await agent.eval(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => /submit|publish|create|post/i.test(b.innerText))?.innerText || null;
  });

  if (btn) {
    console.log(`  方式1 找到按钮: "${btn}"`);
  } else {
    console.log('  方式1 未通过文本找到按钮，尝试点击页面底部...');
    // 方式2: 滚动到底部点击最后一个按钮
    try {
      await agent.eval(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise(r => setTimeout(r, 2000));
      const lastBtn = await agent.eval(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns[btns.length - 1] || null;
      });
      if (lastBtn) {
        console.log(`  方式2 尝试点击最后一个按钮: "${lastBtn.innerText}"`);
        await agent.click(lastBtn);
      }
    } catch (e) {
      console.log('  ❌ 点击失败:', e.message);
    }
  }

  await new Promise(r => setTimeout(r, 5000));

  const result = await agent.eval(() => document.body.innerText.substring(0, 800));
  console.log('\n📄 页面响应:', result.substring(0, 300));

  if (/success|submitted|approved|pending|review|thank/i.test(result)) {
    console.log('\n✅ 可能已成功提交！请检查邮箱和 ClawHub 仪表盘。');
  } else {
    console.log('\n⚠️  未检测到成功，可能需要手动干预。');
  }

  await agent.screenshot('clawhub-final.png');
  console.log('\n📸 截图已保存（check clawhub-final.png）');

  await agent.close();
  console.log('\n✅ 流程结束。');
})().catch(err => {
  console.error('❌ 错误:', err);
  process.exit(1);
});