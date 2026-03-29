#!/usr/bin/env node
/**
 * 许可证模块单元测试
 */

// ⚠️ 重要: 在 require 之前设置环境变量
process.env.JWT_SECRET = 'test-secret-12345';

const { generateKey, verifyLicense, initializeLicense, decodeKey } = require('./lib/license');

console.log('=== License Module Unit Test ===\n');

// 测试 1: 生成 key
console.log('1. Generate key...');
const key = generateKey({
  type: 'calls',
  value: 100,
  expiresIn: '30d',
  meta: { email: 'test@example.com' }
});
console.log('Generated key:', key.substring(0, 50) + '...');

// 测试 2: 解码 key (内部)
console.log('\n2. Decode key directly...');
const decoded = decodeKey(key);
if (decoded) {
  console.log('Decoded type:', decoded.type);
  console.log('Decoded value:', decoded.value);
} else {
  console.log('decodeKey returned null!');
}

// 测试 3: 初始化并验证 key
(async () => {
  console.log('\n3. Initialize license in storage...');
  await initializeLicense(key, 100);
  console.log('License initialized with 100 calls');

  // 检查缓存
  const storageKey = `license:${key}`;
  console.log('Cache key:', storageKey);
  console.log('Cache content:', global.__license_cache?.[storageKey]);

  // 测试 4: 验证 key
  console.log('\n4. Verify key (async)...');
  const license = await verifyLicense(key);
  console.log('License result:', license);

  if (license) {
    console.log('✅ Validation passed');
    console.log('Remaining calls:', license.remaining);
    console.log('License type:', license.type);
  } else {
    console.log('❌ Validation failed (license is null/undefined)');
  }

  // 测试 5: 扣减 quota (模拟调用)
  console.log('\n5. Simulate decrement...');
  const { decrementQuota } = require('./lib/license');
  await decrementQuota(key);
  const licenseAfter = await verifyLicense(key);
  console.log('After decrement, remaining:', licenseAfter ? licenseAfter.remaining : 'N/A');
})();
