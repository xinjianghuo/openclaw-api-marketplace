/**
 * License verification library
 * Uses Vercel KV (Redis) to store and validate license keys
 */

const jwt = require('jsonwebtoken');

// 配置 - 直接硬编码，绕过 Vercel 环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-this-in-production-12345';
const KV_REST_API_URL = 'https://model-clam-85882.upstash.io';
const KV_REST_API_TOKEN = 'gQAAAAAAAU96AAIncDI0ZmYxYzFhNDg3ZWM0ZmIxYmE5YmFjMGY5NGNmNGJkNHAyODU4ODI';

/**
 * 生成许可证密钥
 * @param {Object} options - { type: 'calls'|'subscription', value: number, expiresIn: '30d' }
 * @returns {string} license key
 */
function generateKey(options) {
  const payload = {
    type: options.type,
    value: options.value, // calls count or 'unlimited'
    createdAt: Date.now(),
    expiresAt: options.expiresIn ? Date.now() + parseDuration(options.expiresIn) : null,
    meta: options.meta || {}
  };

  const key = 'OC-' + jwt.sign(payload, JWT_SECRET);
  return key;
}

/**
 * 解析 JWT token
 */
function decodeKey(key) {
  try {
    // Remove 'OC-' prefix if present
    const token = key.startsWith('OC-') ? key.slice(3) : key;
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

/**
 * 验证许可证是否有效
 * @param {string} key - 许可证密钥
 * @returns {Promise<Object|null>} - { remaining, type, expiresAt } or null
 */
async function verifyLicense(key) {
  const decoded = decodeKey(key);
  if (!decoded) return null;

  // 检查过期
  if (decoded.expiresAt && Date.now() > decoded.expiresAt) {
    return null;
  }

  // 从 KV 获取剩余次数 (持久化)
  const remaining = await getRemainingCalls(key, decoded);

  if (remaining <= 0) return null;

  return {
    remaining,
    type: decoded.type,
    expiresAt: decoded.expiresAt
  };
}

/**
 * 获取剩余调用次数 (从 Redis)
 */
async function getRemainingCalls(key, decoded) {
  if (decoded.type === 'subscription' && decoded.value === 'unlimited') {
    return Infinity;
  }

  // 使用 Vercel KV REST API 查询
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    // 本地开发用内存存储
    const storageKey = `license:${key}`;
    const cached = global.__license_cache?.[storageKey];
    if (cached && cached.expiresAt > Date.now()) {
      return cached.remaining;
    }
    // 初始值
    return decoded.value;
  }

  try {
    const response = await fetch(`${KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
      headers: { 'Authorization': `Bearer ${KV_REST_API_TOKEN}` }
    });
    const data = await response.json();
    return data.result || decoded.value;
  } catch (e) {
    console.error('KV fetch error:', e);
    return decoded.value; // fallback to original value
  }
}

/**
 * 扣减一次调用
 */
async function decrementQuota(key) {
  const decoded = decodeKey(key);
  if (!decoded || decoded.type === 'subscription') return;

  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    // 本地内存
    const storageKey = `license:${key}`;
    if (!global.__license_cache) global.__license_cache = {};
    const current = global.__license_cache[storageKey]?.remaining || decoded.value;
    global.__license_cache[storageKey] = {
      remaining: Math.max(0, current - 1),
      expiresAt: decoded.expiresAt
    };
    return;
  }

  // Redis atomic decrement
  try {
    await fetch(`${KV_REST_API_URL}/decr/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KV_REST_API_TOKEN}` }
    });
  } catch (e) {
    console.error('KV decrement error:', e);
  }
}

/**
 * 初始化许可证 (购买后调用)
 */
async function initializeLicense(key, initialValue) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    global.__license_cache = global.__license_cache || {};
    global.__license_cache[`license:${key}`] = {
      remaining: initialValue,
      expiresAt: null
    };
    return;
  }

  try {
    await fetch(`${KV_REST_API_URL}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value: initialValue })
    });
  } catch (e) {
    console.error('KV set error:', e);
  }
}

function parseDuration(str) {
  const match = str.match(/(\d+)([smhd])/);
  if (!match) return 0;
  const [, num, unit] = match;
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return Number(num) * multipliers[unit];
}

module.exports = {
  generateKey,
  verifyLicense,
  decrementQuota,
  initializeLicense,
  decodeKey,
  parseDuration
};
