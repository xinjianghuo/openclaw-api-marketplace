#!/usr/bin/env node

/**
 * 全自动 ClawHub 发布 - 重构版
 * 所有 DOM 操作在 page context 内完成
 */

const BrowserAgent = require('./browser-agent.js');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

(async () => {
  const agent = new BrowserAgent({ headless: false });
  await agent.start();

  console.log('🤖 全自动发布 (重构版)\n');

  const baseDir = 'D:\\OpenClaw\\.openclaw\\workspace';
  const zipPath = path.join(baseDir, 'skills', 'node-connection-doctor.zip');
  const skillDir = path.join(baseDir, 'skills', 'node-connection-doctor');
  const readme = fs.readFileSync(path.join(skillDir, 'README.md'), 'utf8');
  const skillYaml = fs.readFileSync(path.join(skillDir, 'skills.json'), 'utf8');
  const skillData = yaml.parseAllDocuments(skillYaml)[0].toJSON();

  // 1. 访问
  await agent.goto('https://clawhub.ai/publish-skill', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));

  // 2. 检测并点击登录
  console.log('2️⃣ 登录处理');
  await agent.eval(() => {
    // 检查是否需要登录
    const needsLogin = document.querySelector('a[href*="login"], a[href*="oauth"]') ||
                       /sign in|log in/i.test(document.body.innerText);
    if (needsLogin) {
      console.log('   [page] 需要登录，点击 Sign in');
      const a = document.querySelector('a[href*="login"], a[href*="oauth"]');
      const btn = Array.from(document.querySelectorAll('button')).find(b => /sign in|log in/i.test(b.innerText));
      (a || btn)?.click();
    } else {
      console.log('   [page] 已登录');
    }
  });

  // 等待登录完成（检测表单出现）
  console.log('⏳ 等待登录完成...');
  let loggedIn = false;
  for (let i = 0; i < 120; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const hasForm = await agent.eval(() => document.querySelectorAll('input, textarea, select').length > 5);
    if (hasForm) {
      loggedIn = true;
      console.log(`✅ 登录完成 (${i+1}s)`);
      break;
    }
  }

  if (!loggedIn) {
    console.log('❌ 未检测到登录成功，可能需要手动登录');
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    await new Promise(resolve => rl.question('请手动完成登录后按 Enter...', resolve));
    rl.close();
    await agent.goto('https://clawhub.ai/publish-skill', { waitUntil: 'networkidle' });
    await new Promise(r => setTimeout(r, 5000));
  }

  // 3. 等待表单
  console.log('\n3️⃣ 等待表单加载');
  await agent.eval(() => new Promise(resolve => {
    if (document.querySelectorAll('input, textarea, select').length > 5) resolve();
    else {
      window.addEventListener('load', resolve);
      setTimeout(resolve, 10000);
    }
  }));
  await new Promise(r => setTimeout(r, 2000));

  // 4. 页面内填表（一次执行多个操作）
  console.log('4️⃣ 填充表单');
  await agent.eval((data) => {
    // 辅助函数：填字段
    const fillField = (name, value) => {
      const selectors = [
        `[name="${name}"]`,
        `[id="${name}"]`,
        `[placeholder*="${name}"]`,
        `textarea[placeholder*="${name}"]`
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          el.focus();
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          console.log(`[page] 填充 ${name}`);
          return true;
        }
      }
      console.log(`[page] 未找到 ${name}`);
      return false;
    };

    fillField('name', data.name);
    fillField('skillId', data.id);
    fillField('version', data.version || '1.0.0');
    fillField('category', data.category || 'troubleshooting');
    fillField('tags', (data.tags || []).join(', '));
    fillField('description', data.description);
    // Examples 通常是一个 textarea
    const textareas = Array.from(document.querySelectorAll('textarea'));
    if (textareas.length > 0) {
      const examplesMarkdown = data.examples.map(ex =>
        `**${ex.title}**\n\`\`\`yaml\n${ex.yaml}\n\`\`\``
      ).join('\n\n');
      textareas[0].value = examplesMarkdown;
      console.log('[page] 填充 examples');
    }
  }, { ...skillData, description: readme });

  await new Promise(r => setTimeout(r, 2000));
  await agent.screenshot('filled.png');

  // 5. 文件上传
  console.log('5️⃣ 上传 ZIP');
  try {
    const fileInput = await agent.eval(() => document.querySelector('input[type="file"]'));
    if (fileInput) {
      await agent.page.setInputFiles(fileInput, zipPath);
      console.log(`✅ 已选择文件: ${path.basename(zipPath)}`);
      await new Promise(r => setTimeout(r, 5000));
    } else {
      console.log('⚠️  未找到文件输入框');
    }
  } catch (e) {
    console.log('❌ 文件上传失败:', e.message);
  }

  await agent.screenshot('withfile.png');

  // 6. 提交
  console.log('6️⃣ 提交');
  await agent.eval(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submit = btns.find(b => /submit|publish|create|post/i.test(b.innerText.toLowerCase()));
    if (submit) {
      console.log(`[page] 点击提交按钮: "${submit.innerText.trim()}"`);
      submit.click();
    } else {
      console.log('[page] 未找到提交按钮');
    }
  });

  await new Promise(r => setTimeout(r, 7000));

  // 7. 验证
  const result = await agent.eval(() => document.body.innerText.substring(0, 800));
  await agent.screenshot('final.png');

  if (/success|submitted|approved|pending|review|thank/i.test(result)) {
    console.log('\n✅✅✅ 发布成功或已提交审核！');
  } else {
    console.log('\n⚠️  请检查截图确认状态');
  }

  console.log('\n📊 完成');
  await agent.close();
})().catch(err => {
  console.error('❌ 错误:', err);
  process.exit(1);
});