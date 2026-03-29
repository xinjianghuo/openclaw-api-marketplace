#!/usr/bin/env node

/**
 * 全自动发布到 ClawHub
 * 1. 自动点击 "Sign in with GitHub"
 * 2. 用户手动完成 GitHub 登录（仅一次，在浏览器中）
 * 3. 自动检测登录成功
 * 4. 自动填写表单 + 上传 + 提交
 */

const BrowserAgent = require('./browser-agent.js');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

(async () => {
  const agent = new BrowserAgent({ headless: false });
  await agent.start();

  console.log('🤖 全自动发布到 ClawHub\n');

  const baseDir = 'D:\\OpenClaw\\.openclaw\\workspace';
  const zipPath = path.join(baseDir, 'skills', 'node-connection-doctor.zip');
  const skillDir = path.join(baseDir, 'skills', 'node-connection-doctor');
  const readme = fs.readFileSync(path.join(skillDir, 'README.md'), 'utf8');
  const skillYaml = fs.readFileSync(path.join(skillDir, 'skills.json'), 'utf8');
  const skillData = yaml.parseAllDocuments(skillYaml)[0].toJSON();

  // 1. 访问发布页
  console.log('1️⃣ 访问 https://clawhub.ai/publish-skill');
  await agent.goto('https://clawhub.ai/publish-skill', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));

  // 2. 检查是否需要登录
  console.log('2️⃣ 检查登录状态');
  const needsLogin = await agent.eval(() => {
    const hasSignIn = !!document.querySelector('a[href*="login"], a[href*="signin"]');
    const body = document.body.innerText.toLowerCase();
    return hasSignIn || /sign in|log in/i.test(body);
  });

  if (needsLogin) {
    console.log('   ⚠️  需要登录，尝试自动点击 "Sign in with GitHub"...');

    // 尝试点击登录按钮
    let clicked = false;
    try {
      // 组合选择器：href 包含 login/oauth 的 a 标签，或按钮文本包含 Sign in
      const signInBtn = await agent.eval(() => {
        // 方式1: a 标签
        const a = document.querySelector('a[href*="login"], a[href*="oauth"]');
        if (a) return a;
        // 方式2: 按钮文本
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => /sign in|log in/i.test(b.innerText));
      });
      if (signInBtn) {
        await agent.click(signInBtn);
        console.log('  ✅ 已点击登录按钮');
        clicked = true;
      }
    } catch (e) {
      console.log('  ❌ 自动点击失败:', e.message);
    }

    if (!clicked) {
      console.log('\n请手动点击 "Sign in with GitHub" 按钮，然后等待页面跳转。');
      const readline = require('readline');
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      await new Promise(resolve => rl.question('登录完成后按 Enter...', resolve));
      rl.close();
      await agent.goto('https://clawhub.ai/publish-skill', { waitUntil: 'networkidle' });
      await new Promise(r => setTimeout(r, 5000));
    } else {
      // 等待 GitHub 登录完成（检测 URL 或页面变化）
      console.log('\n⏳ 等待 GitHub 登录完成...');
      let loginDone = false;
      for (let i = 0; i < 120; i++) {
        await new Promise(r => setTimeout(r, 1000));
        try {
          const currentUrl = await agent.url();
          const body = await agent.eval(() => document.body.innerText);
          // 如果 URL 包含 clawhub.ai/publish-skill 且没有 "Sign in" 文本
          if (currentUrl.includes('publish-skill') && !/sign in|log in/i.test(body)) {
            loginDone = true;
            console.log(`\n✅ 登录成功！(${i+1}s)`);
            break;
          }
        } catch (e) {
          // 忽略错误继续等待
        }
        process.stdout.write('.');
      }
      if (!loginDone) {
        console.log('\n❌ 登录超时，可能需要手动干预。');
        const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
        await new Promise(resolve => rl.question('请确保登录完成，然后按 Enter...', resolve));
        rl.close();
        await agent.goto('https://clawhub.ai/publish-skill', { waitUntil: 'networkidle' });
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }

  // 3. 等待表单加载
  console.log('\n3️⃣ 等待表单加载');
  let formReady = false;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const inputCount = await agent.eval(() => document.querySelectorAll('input, textarea, select').length);
    if (inputCount > 5) {
      formReady = true;
      console.log(`  ✅ 表单就绪 (${inputCount} 个输入框)`);
      break;
    }
  }

  if (!formReady) {
    console.log('  ❌ 表单未加载，抓取当前页面信息:');
    const pageInfo = await agent.eval(() => ({
      title: document.title,
      buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()),
      inputs: Array.from(document.querySelectorAll('input')).map(i => i.type)
    }));
    console.log(JSON.stringify(pageInfo, null, 2));
    console.log('❌ 无法继续，请检查页面状态。');
    await agent.close();
    process.exit(1);
  }

  // 4. 智能字段映射
  console.log('\n4️⃣ 自动填写表单');
  const mappings = [
    { name: 'name', value: skillData.name || 'Node Connection Doctor' },
    { name: 'skillId', value: skillData.id },
    { name: 'version', value: skillData.version || '1.0.0' },
    { name: 'category', value: skillData.category || 'troubleshooting' },
    { name: 'tags', value: (skillData.tags || []).join(', ') },
    { name: 'description', value: readme },
    { name: 'example', value: skillData.examples.map(ex => `**${ex.title}**\n\`\`\`yaml\n${ex.yaml}\n\`\`\``).join('\n\n') }
  ];

  for (const m of mappings) {
    try {
      // 尝试多种选择器
      const selectors = [
        `[name="${m.name}"]`,
        `[id="${m.name}"]`,
        `[placeholder*="${m.name}"]`,
        `textarea[placeholder*="${m.name}"]`
      ];
      let filled = false;
      for (const sel of selectors) {
        const el = await agent.eval((s) => document.querySelector(s), sel);
        if (el) {
          await agent.fill(el, m.value);
          console.log(`  ✅ ${m.name} 已填`);
          filled = true;
          break;
        }
      }
      if (!filled) {
        console.log(`  ⚠️  未找到字段: ${m.name}`);
      }
    } catch (e) {
      console.log(`  ❌ ${m.name} 失败: ${e.message}`);
    }
  }

  await agent.screenshot('clawhub-filled.png');

  // 5. 文件上传
  console.log('\n5️⃣ 上传 ZIP 文件');
  try {
    const fileInput = await agent.eval(() => document.querySelector('input[type="file"]'));
    if (fileInput) {
      await agent.page.setInputFiles(fileInput, zipPath);
      console.log(`  ✅ 已选择文件: ${path.basename(zipPath)}`);
      await new Promise(r => setTimeout(r, 5000));
    } else {
      console.log('  ❌ 未找到文件输入框，尝试找 Upload 按钮...');
      const uploadBtn = await agent.eval(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => /upload|add file|choose|browse/i.test(b.innerText));
      });
      if (uploadBtn) {
        await agent.click(uploadBtn);
        console.log('  ✅ 已点击 Upload 按钮');
        await new Promise(r => setTimeout(r, 3000));
        // 此时文件选择器可能弹出，Playwright 在 visible mode 可能会处理
        // 但更保险的是直接设置 input files
      }
    }
  } catch (e) {
    console.log('  ❌ 文件上传失败:', e.message);
  }

  await agent.screenshot('clawhub-with-file.png');

  // 6. 提交
  console.log('\n6️⃣ 查找并点击提交按钮');
  const submitBtn = await agent.eval(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => /submit|publish|create|post|complete/i.test(b.innerText.toLowerCase()));
  });

  if (submitBtn) {
    console.log(`  ✅ 找到按钮: "${submitBtn.innerText.trim()}"`);
    try {
      await agent.click(submitBtn);
      console.log('  ✅ 已点击提交');
      await new Promise(r => setTimeout(r, 7000)); // 等待处理

      const result = await agent.eval(() => document.body.innerText.substring(0, 800));
      if (/success|submitted|approved|pending|review|thank/i.test(result)) {
        console.log('\n✅✅✅ 提交成功或已进入审核！');
      } else {
        console.log('\n⚠️  提交后页面无明确成功标识，请检查。');
      }
    } catch (e) {
      console.log('  ❌ 点击失败:', e.message);
    }
  } else {
    console.log('  ❌ 未找到提交按钮');
    // 尝试滚动到底部
    await agent.eval(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 2000));
    const lastBtn = await agent.eval(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns[btns.length - 1];
    });
    if (lastBtn) {
      await agent.click(lastBtn);
      console.log(`  ✅ 尝试点击最后一个按钮: "${lastBtn.innerText}"`);
    }
  }

  await agent.screenshot('clawhub-final.png');

  console.log('\n📊 流程结束');
  console.log('请检查截图和 ClawHub 个人中心确认发布状态。');

  await agent.close();
})().catch(err => {
  console.error('\n❌ 致命错误:', err);
  process.exit(1);
});