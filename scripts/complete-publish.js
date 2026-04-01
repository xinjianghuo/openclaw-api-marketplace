#!/usr/bin/env node

/**
 * 完成 ClawHub 自动发布 (B方案)
 */

const BrowserAgent = require('./browser-agent.js');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

(async () => {
  const agent = new BrowserAgent({ headless: false });
  await agent.start();

  console.log('🚀 继续 ClawHub 自动发布流程...\n');

  const baseDir = 'D:\\OpenClaw\\.openclaw\\workspace';
  const zipPath = path.join(baseDir, 'skills', 'node-connection-doctor.zip');
  const skillDir = path.join(baseDir, 'skills', 'node-connection-doctor');
  const readme = fs.readFileSync(path.join(skillDir, 'README.md'), 'utf8');
  const skillYaml = fs.readFileSync(path.join(skillDir, 'skills.json'), 'utf8');
  // 处理多文档 YAML (有 --- 分隔)
  const documents = yaml.parseAllDocuments(skillYaml);
  const skillJson = documents[0].toJSON(); // 取第一个文档

  // 1. 访问发布页面
  console.log('📍 访问发布页面...');
  await agent.goto('https://clawhub.ai/publish-skill', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));

  // 2. 检查登录状态
  console.log('\n🔐 检查登录状态...');
  let isLoggedIn = false;

  try {
    isLoggedIn = await agent.eval(() => {
      const url = window.location.href;
      const hasLoginBtn = !!document.querySelector('a[href*="login"], a[href*="signin"]');
      const hasUserMenu = !!document.querySelector('[aria-label*="profile"], [aria-label*="user"], [aria-label*="account"]');
      const isPublishPage = url.includes('publish') && !hasLoginBtn;
      return isPublishPage || hasUserMenu;
    });
  } catch (e) {
    console.log('  检查失败，假设需要登录');
  }

  if (!isLoggedIn) {
    console.log('\n⚠️  需要先登录！');
    console.log('请在浏览器中点击 "Sign in with GitHub" 或其他登录方式。');
    console.log('登录成功后，页面可能会刷新。');

    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    await new Promise(resolve => rl.question('登录完成后按 Enter 继续...', resolve));
    rl.close();

    console.log('✅ 继续...');
    await agent.goto('https://clawhub.ai/publish-skill', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 3000));
  }

  // 3. 截图
  console.log('\n📸 截图: 表单初始状态');
  await agent.screenshot('clawhub-publish-initial.png');

  // 4. 自动填写字段
  console.log('\n✍️ 自动填写表单...');

  const fieldsToFill = [
    { selector: '[name="name"], input[name="title"], #name, #title, input[placeholder*="name"], input[placeholder*="title"]', value: 'Node Connection Doctor' },
    { selector: '[name="skillId"], input[name="id"], #skillId, input[placeholder*="skill"]', value: skillJson.id },
    { selector: '[name="version"], input[name="ver"], #version, input[placeholder*="version"]', value: skillJson.version },
    { selector: '[name="category"], select[name="category"], #category', value: skillJson.category },
    { selector: 'textarea[name="description"], #description, textarea[placeholder*="description"]', value: readme },
    { selector: 'input[name="tags"], [name="tag"], #tags', value: skillJson.tags.join(', ') }
  ];

  for (const field of fieldsToFill) {
    try {
      const element = await agent.eval((sel) => {
        const selectors = sel.split(',');
        for (const s of selectors) {
          try {
            const el = document.querySelector(s.trim());
            if (el) return el;
          } catch (e) { continue; }
        }
        return null;
      }, field.selector);

      if (element) {
        await agent.fill(element, field.value);
        console.log(`  ✅ 填写: ${field.selector.split(',')[0].trim()} = "${field.value.substring(0, 40)}..."`);
      }
    } catch (e) {}
  }

  // 5. 文件上传
  console.log('\n📎 处理文件上传...');
  console.log('ZIP 文件:', zipPath);

  try {
    const fileInput = await agent.eval(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="file"]'));
      return inputs[0] || null;
    });

    if (fileInput) {
      await agent.page.setInputFiles(fileInput, zipPath);
      console.log('  ✅ 已选择 ZIP 文件，等待上传完成...');
      await new Promise(r => setTimeout(r, 5000));
    } else {
      console.log('  ⚠️  没找到文件输入框');
    }
  } catch (e) {
    console.log('  ⚠️  文件上传异常:', e.message);
  }

  // 6. Examples
  console.log('\n📝 填写示例...');
  const examplesText = skillJson.examples.map(ex =>
    `**${ex.title}**\n\`\`\`yaml\n${ex.yaml}\n\`\`\``
  ).join('\n\n');

  try {
    const examplesArea = await agent.eval(() => {
      const textareas = Array.from(document.querySelectorAll('textarea'));
      return textareas.find(t => /example|yaml/i.test(t.placeholder || (t.labels && t.labels[0]?.innerText) || '')) || textareas[textareas.length - 1];
    });

    if (examplesArea) {
      await agent.fill(examplesArea, examplesText);
      console.log('  ✅ 已填写示例部分');
    }
  } catch (e) {
    console.log('  ⚠️  示例填写失败:', e.message);
  }

  // 7. 截图
  await agent.screenshot('clawhub-publish-filled.png');
  console.log('📸 截图已保存: clawhub-publish-filled.png');

  // 8. 提交
  console.log('\n🔸 查找提交按钮...');
  try {
    const submitBtn = await agent.eval(() => {
      const btns = Array.from(document.querySelectorAll('button, input[type="submit"]'));
      return btns.find(b => /submit|publish|create/i.test(b.innerText || b.value)) || btns[btns.length - 1];
    });

    if (submitBtn) {
      console.log(`  找到按钮: "${submitBtn.innerText || submitBtn.value}"`);
      console.log('  准备点击提交...');

      const readline = require('readline');
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const confirm = await new Promise(resolve => rl.question('确认提交？(y/n): ', resolve));
      rl.close();

      if (confirm.toLowerCase() === 'y') {
        await agent.click(submitBtn);
        console.log('  ✅ 已点击提交！');
        await new Promise(r => setTimeout(r, 5000));

        const resultText = await agent.eval(() => document.body.innerText.substring(0, 800));
        console.log('\n📋 页面响应:');
        console.log(resultText);

        if (/success|submitted|approved|pending|review/i.test(resultText)) {
          console.log('\n✅ 发布成功或已提交审核！');
        } else {
          console.log('\n⚠️  请检查页面是否有错误提示');
        }
      } else {
        console.log('  ❌ 取消提交');
      }
    } else {
      console.log('  ⚠️  未找到提交按钮，请手动点击');
    }
  } catch (e) {
    console.log('  ❌ 提交失败:', e.message);
  }

  await agent.screenshot('clawhub-publish-final.png');
  console.log('\n📸 最终截图: clawhub-publish-final.png');
  console.log('\n✅ 自动化流程结束！');

  await agent.close();
})().catch(err => {
  console.error('\n❌ 错误:', err.message);
  process.exit(1);
});