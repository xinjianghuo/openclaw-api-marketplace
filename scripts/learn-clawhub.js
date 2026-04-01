#!/usr/bin/env node

/**
 * 深入学习 ClawHub 发布流程
 * 目标: 找到正确的元素选择器和提交机制
 */

const BrowserAgent = require('./browser-agent.js');

(async () => {
  const agent = new BrowserAgent({ headless: false });
  await agent.start();

  console.log('🎓 学习 ClawHub 发布页面结构...\n');

  await agent.goto('https://clawhub.ai/publish-skill', { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 8000));

  // 1. 检查是否已登录
  console.log('1️⃣ 检查登录状态');
  const loginStatus = await agent.eval(() => {
    const hasSignInBtn = !!document.querySelector('a[href*="login"], a[href*="signin"]');
    const userMenu = !!document.querySelector('[aria-label*="user"], [aria-label*="profile"]');
    const url = window.location.href;
    return {
      hasSignInBtn,
      hasUserMenu: userMenu,
      url,
      ready: !hasSignInBtn && (userMenu || url.includes('publish'))
    };
  });

  console.log(JSON.stringify(loginStatus, null, 2));

  if (!loginStatus.ready) {
    console.log('\n⚠️  需要登录。请手动登录后重新运行脚本。');
    await agent.close();
    process.exit(0);
  }

  // 2. 详细分析所有输入元素
  console.log('\n2️⃣ 分析所有表单元素');
  const allElements = await agent.eval(() => {
    const elements = [];
    document.querySelectorAll('input, textarea, select, button').forEach((el, i) => {
      if (i >= 50) return;
      const rect = el.getBoundingClientRect();
      elements.push({
        index: i,
        tag: el.tagName.toLowerCase(),
        type: el.type || '',
        name: el.name || '',
        id: el.id || '',
        placeholder: el.placeholder || '',
        className: el.className?.substring(0, 30) || '',
        value: el.value ? el.value.substring(0, 50) : '',
        text: el.innerText?.substring(0, 50) || '',
        visible: rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden'
      });
    });
    return elements;
  });

  console.log(`发现 ${allElements.length} 个元素:`);
  allElements.forEach(el => {
    if (el.visible) {
      console.log(`  ${el.index+1}. <${el.tag}${el.type ? ` type="${el.type}"` : ''} name="${el.name}" id="${el.id}" placeholder="${el.placeholder}" value="${el.value}" text="${el.text}">`);
    }
  });

  // 3. 特别关注文件输入
  console.log('\n3️⃣ 文件输入检查');
  const fileInputs = await agent.eval(() => {
    return Array.from(document.querySelectorAll('input[type="file"]')).map(f => ({
      name: f.name,
      id: f.id,
      accept: f.accept,
      multiple: f.multiple,
      visible: f.offsetParent !== null
    }));
  });
  console.log(JSON.stringify(fileInputs, null, 2));

  // 4. 尝试标准字段填充
  console.log('\n4️⃣ 尝试标准字段填充');
  const skillData = {
    name: 'Node Connection Doctor',
    skillId: 'node-connection-doctor',
    version: '1.0.0',
    category: 'troubleshooting',
    description: 'Automatically diagnose and fix OpenClaw node connection issues...',
    tags: 'node, connection, diagnose, fix, gateway, tailscale'
  };

  for (const [key, value] of Object.entries(skillData)) {
    try {
      // 尝试多种选择器
      const selectors = [
        `[name="${key}"]`,
        `[data-field="${key}"]`,
        `input[placeholder*="${key}"]`,
        `textarea[placeholder*="${key}"]`,
        `#${key}`
      ];

      for (const sel of selectors) {
        const el = await agent.eval((s) => document.querySelector(s), sel);
        if (el) {
          await agent.fill(el, value);
          console.log(`  ✅ ${key} 通过 ${sel} 填写`);
          break;
        }
      }
    } catch (e) {
      console.log(`  ❌ ${key} 填写失败`);
    }
  }

  // 5. 截图
  await agent.screenshot('clawhub-learn-1.png');
  console.log('\n📸 截图: clawhub-learn-1.png');

  // 6. 检查是否有"Next"或"Continue"按钮
  console.log('\n5️⃣ 检查分步表单');
  const navButtons = await agent.eval(() => {
    return Array.from(document.querySelectorAll('button')).filter(b => {
      const text = (b.innerText || '').toLowerCase();
      return text.includes('next') || text.includes('continue') || text.includes('submit') || text.includes('publish');
    }).map(b => b.innerText.trim());
  });
  console.log('导航按钮:', navButtons);

  // 7. 尝试文件上传
  console.log('\n6️⃣ 尝试文件上传');
  try {
    const fileInput = await agent.eval(() => document.querySelector('input[type="file"]'));
    if (fileInput) {
      await agent.page.setInputFiles(fileInput, 'D:\\OpenClaw\\.openclaw\\workspace\\skills\\node-connection-doctor.zip');
      console.log('  ✅ 文件已选择');
      await new Promise(r => setTimeout(r, 5000));
    } else {
      console.log('  ❌ 没找到文件输入框');
    }
  } catch (e) {
    console.log('  ❌ 上传失败:', e.message);
  }

  // 8. 再次截图
  await agent.screenshot('clawhub-learn-2.png');

  // 9. 尝试点击任何看起来像提交的按钮
  console.log('\n7️⃣ 尝试提交');
  try {
    const possibleSubmitButtons = await agent.eval(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.filter(b => {
        const text = (b.innerText || '').toLowerCase();
        return text.includes('submit') || text.includes('publish') || text.includes('create') || text.includes('post') || text.includes('complete');
      }).map(b => b.id || b.className || b.innerText);
    });
    console.log('可能的提交按钮:', possibleSubmitButtons);

    if (possibleSubmitButtons.length > 0) {
      const btnSelector = `button:has-text("${possibleSubmitButtons[0]}")` || `#${possibleSubmitButtons[0]}`;
      await agent.click(btnSelector);
      console.log('  已点击提交按钮');
      await new Promise(r => setTimeout(r, 5000));

      const afterSubmit = await agent.eval(() => document.body.innerText.substring(0, 500));
      console.log('\n📄 提交后页面内容:', afterSubmit);

      if (/success|submitted|approved|pending|review/i.test(afterSubmit)) {
        console.log('\n✅ 发布成功或已提交！');
      }
    }
  } catch (e) {
    console.log('  ❌ 提交尝试失败:', e.message);
  }

  await agent.screenshot('clawhub-learn-final.png');

  console.log('\n📊 学习完成');
  console.log('请检查截图和输出，确定正确的自动化策略。');

  await agent.close();
})().catch(console.error);