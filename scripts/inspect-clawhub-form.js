#!/usr/bin/env node

/**
 * 检查 ClawHub 发布页面的表单结构
 */

const BrowserAgent = require('./browser-agent.js');

(async () => {
  const agent = new BrowserAgent({ headless: false });
  await agent.start();

  console.log('🔍 检查 ClawHub 发布页面结构...\n');

  await agent.goto('https://clawhub.ai/publish-skill', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 5000));

  // 检查输入框类型
  const inputs = await agent.eval(() => {
    return Array.from(document.querySelectorAll('input, textarea, button, select')).map(el => ({
      tag: el.tagName,
      type: el.type || '',
      name: el.name || '',
      id: el.id || '',
      placeholder: el.placeholder || '',
      className: el.className?.substring(0, 30) || '',
      text: el.innerText?.substring(0, 40) || '',
      value: el.value?.substring(0, 40) || ''
    }));
  });

  console.log('📋 表单元素 (前30):');
  inputs.forEach((inp, i) => {
    if (i >= 30) return;
    console.log(`${i+1}. <${inp.tag.toLowerCase()}${inp.type ? ` type="${inp.type}"` : ''} name="${inp.name}" id="${inp.id}" placeholder="${inp.placeholder}" value="${inp.value}">`);
  });

  // 检查按钮
  const buttons = await agent.eval(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText?.trim(),
      type: b.type,
      className: b.className?.substring(0, 20)
    }));
  });

  console.log('\n🔘 所有按钮:');
  buttons.forEach((b, i) => {
    console.log(`${i+1}. "${b.text}" (${b.type})`);
  });

  // 文件输入
  const fileInputs = await agent.eval(() => {
    return Array.from(document.querySelectorAll('input[type="file"]')).map(f => ({
      name: f.name,
      id: f.id,
      accept: f.accept
    }));
  });

  console.log('\n📎 文件输入:', fileInputs);

  await agent.close();
  console.log('\n✅ 检查完成，请根据输出调整脚本选择器');
})().catch(console.error);