#!/usr/bin/env node

/**
 * 智能发布 - 动态检测并填充 ClawHub 表单
 * 策略: 等待表单出现 + 多种触发方式
 */

const BrowserAgent = require('./browser-agent.js');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

(async () => {
  const agent = new BrowserAgent({ headless: false });
  await agent.start();

  console.log('🚀 智能发布到 ClawHub\n');

  const baseDir = 'D:\\OpenClaw\\.openclaw\\workspace';
  const zipPath = path.join(baseDir, 'skills', 'node-connection-doctor.zip');
  const skillDir = path.join(baseDir, 'skills', 'node-connection-doctor');
  const readme = fs.readFileSync(path.join(skillDir, 'README.md'), 'utf8');
  const skillYaml = fs.readFileSync(path.join(skillDir, 'skills.json'), 'utf8');
  const skillJson = yaml.parseAllDocuments(skillYaml)[0].toJSON();

  // 1. 访问
  console.log('1. 访问发布页面');
  await agent.goto('https://clawhub.ai/publish-skill', { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 10000));

  // 2. 登录检查 - 放宽条件，只要不是明显错误页就继续
  console.log('2. 检查登录');
  const pageContent = await agent.eval(() => document.body.innerText);
  const isLoginPage = /sign in|log in/i.test(pageContent) && /github/i.test(pageContent);
  const hasSignInBtn = await agent.eval(() => !!document.querySelector('a[href*="login"], a[href*="signin"]'));

  if (isLoginPage || hasSignInBtn) {
    console.log('⚠️  需要登录！');
    console.log('请在浏览器中点击 "Sign in with GitHub" 完成登录。');
    console.log('脚本将自动检测登录成功，无需手动按键。\n');

    // 等待登录完成（检测页面变化）
    console.log('等待登录...');
    let loginSuccess = false;
    for (let i = 0; i < 60; i++) { // 最多等60秒
      await new Promise(r => setTimeout(r, 1000));
      const afterLogin = await agent.eval(() => {
        const body = document.body.innerText.toLowerCase();
        const hasSignIn = !!document.querySelector('a[href*="login"], a[href*="signin"]');
        const hasForm = document.querySelectorAll('input, textarea, select').length > 5;
        return {
          stillLogin: /sign in|log in/i.test(body) && !hasForm,
          hasForm: hasForm
        };
      });

      if (!afterLogin.stillLogin && afterLogin.hasForm) {
        console.log(`✅ 登录成功！(检测到表单，${i+1}s)`);
        loginSuccess = true;
        break;
      }
      process.stdout.write('.'); // 进度点
    }

    if (!loginSuccess) {
      console.log('\n❌ 登录超时或未检测到表单。请确保登录完成后再运行。');
      await agent.close();
      process.exit(1);
    }

    // 重新加载确保状态
    await agent.goto('https://clawhub.ai/publish-skill', { waitUntil: 'networkidle' });
    await new Promise(r => setTimeout(r, 5000));
    console.log('✅ 页面已刷新，继续流程\n');
  } else {
    console.log('✅ 页面正常，无需登录');
  }

  // 3. 等待表单出现 (最多 30 秒)
  console.log('3. 等待表单出现');
  let formLoaded = false;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const hasForm = await agent.eval(() => {
      // 表单通常有 >5 个输入元素
      const inputs = document.querySelectorAll('input, textarea, select');
      return inputs.length > 5;
    });
    if (hasForm) {
      formLoaded = true;
      console.log(`  ✅ 表单已加载 (${i+1}s)`);
      break;
    } else {
      // 尝试滚动触发
      await agent.eval(() => window.scrollBy(0, 300));
    }
  }

  if (!formLoaded) {
    console.log('  ❌ 表单未加载，可能页面结构已变更');
    await agent.screenshot('clawhub-no-form.png');
    await agent.close();
    process.exit(1);
  }

  // 4. 打印表单元素（调试）
  console.log('\n4. 表单详情');
  const formDetails = await agent.eval(() => {
    const fields = [];
    document.querySelectorAll('input, textarea, select').forEach((el, i) => {
      fields.push({
        index: i,
        tag: el.tagName,
        type: el.type || '',
        name: el.name || '',
        id: el.id || '',
        placeholder: el.placeholder || '',
        value: el.value ? el.value.substring(0, 30) : '',
        visible: el.offsetParent !== null
      });
    });
    return fields;
  });

  console.log(`共 ${formDetails.length} 个表单项:`);
  formDetails.forEach(f => {
    if (f.visible && f.name) {
      console.log(`  [${f.index}] name="${f.name}" type="${f.type}" placeholder="${f.placeholder}"`);
    }
  });

  // 5. 智能映射字段
  console.log('\n5. 智能字段映射');
  const fieldMappings = [
    {patterns: [/^name$/, /^title$/, /skill.*name/i, /display.*name/i], value: skillJson.name || 'Node Connection Doctor'},
    {patterns: [/^id$/, /^skill.*id$/, /identifier/i], value: skillJson.id},
    {patterns: [/^version$/, /^ver$/], value: skillJson.version || '1.0.0'},
    {patterns: [/^category$/, /^type$/], value: skillJson.category || 'troubleshooting'},
    {patterns: [/^desc/, /^about/, /^summary/], value: readme.substring(0, 500) + '...'},
    {patterns: [/^tags$/, /^keywords/], value: (skillJson.tags || []).join(', ')},
    {patterns: [/example/, /yaml/, /usage/], value: skillJson.examples.map(ex => `**${ex.title}**\n\`\`\`yaml\n${ex.yaml}\n\`\`\``).join('\n\n').substring(0, 2000)}
  ];

  for (const map of fieldMappings) {
    try {
      // 查找匹配的元素
      const matchedEls = await agent.eval((patterns) => {
        const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
        return inputs.filter(el => {
          const name = (el.name || el.id || '').toLowerCase();
          return patterns.some(p => p.test(name));
        });
      }, map.patterns);

      if (matchedEls.length > 0) {
        await agent.fill(matchedEls[0], map.value);
        console.log(`  ✅ 映射到: ${matchedEls[0].name || matchedEls[0].id} (value length: ${map.value.length})`);
      }
    } catch (e) {
      console.log(`  ⚠️  映射失败: ${e.message}`);
    }
  }

  await agent.screenshot('clawhub-intelli-filled.png');
  console.log('📸 已截图: clawhub-intelli-filled.png');

  // 6. 尝试文件上传
  console.log('\n6. 文件上传');
  try {
    const fileInput = await agent.eval(() => document.querySelector('input[type="file"]'));
    if (fileInput) {
      await agent.page.setInputFiles(fileInput, zipPath);
      console.log(`  ✅ 已选择文件: ${zipPath}`);
      await new Promise(r => setTimeout(r, 5000));
    } else {
      console.log('  ❌ 未找到文件输入框，可能需要点击"添加文件"按钮');
      // 尝试找"Upload"按钮点击
      const uploadBtn = await agent.eval(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => /upload|add file|choose file/i.test(b.innerText));
      });
      if (uploadBtn) {
        await agent.click(uploadBtn);
        console.log('  ✅ 已点击 Upload 按钮');
        await new Promise(r => setTimeout(r, 3000));
        // 此时系统文件对话框出现，但 Playwright 在非 headless 可能无法处理
        console.log('  ⚠️  需要手动选择文件（或脚本需调整）');
      }
    }
  } catch (e) {
    console.log('  ❌ 文件操作失败:', e.message);
  }

  // 7. 最终提交尝试
  console.log('\n7. 尝试提交');
  await new Promise(r => setTimeout(r, 2000));

  const submitSelectors = [
    'button[type="submit"]',
    'button:contains("Submit")',
    'button:contains("Publish")',
    'button:contains("Create")',
    'button:contains("Post")',
    'input[type="submit"]'
  ];

  let clicked = false;
  for (const sel of submitSelectors) {
    try {
      const btn = await agent.eval((s) => document.querySelector(s), sel);
      if (btn) {
        console.log(`  ✅ 找到按钮: ${sel} -> "${btn.innerText}"`);
        await agent.click(btn);
        console.log('  ✅ 已点击提交');
        clicked = true;
        break;
      }
    } catch (e) {}
  }

  if (!clicked) {
    console.log('  ❌ 标准提交按钮未找到，尝试点击页面底部...');
    await agent.eval(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 2000));
    const lastButton = await agent.eval(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns[btns.length - 1];
    });
    if (lastButton) {
      await agent.click(lastButton);
      console.log(`  ✅ 点击最后一个按钮: "${lastButton.innerText}"`);
    }
  }

  await new Promise(r => setTimeout(r, 5000));

  // 8. 验证结果
  console.log('\n8. 验证结果');
  const resultText = await agent.eval(() => document.body.innerText.substring(0, 1000));
  console.log('页面内容预览:', resultText.substring(0, 300));

  if (/success|submitted|approved|pending|review|thank/i.test(resultText)) {
    console.log('\n✅✅✅ 似乎已成功！请检查邮件和 ClawHub 后台。');
  } else {
    console.log('\n⚠️  未检测到成功，请检查截图和页面。');
  }

  await agent.screenshot('clawhub-smart-final.png');

  console.log('\n📊 流程结束');
  console.log('请确认发布状态，如果需要重试，请修改脚本重运行。');

  await agent.close();
})().catch(err => {
  console.error('\n❌ 错误:', err);
  process.exit(1);
});