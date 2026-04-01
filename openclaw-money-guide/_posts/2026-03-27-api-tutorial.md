---
title:  "OpenClaw API Marketplace 完整搭建指南"
date:   2026-03-27 17:15:00 +0800
categories: [教程]
tags: [API, Vercel, Gumroad]
description: "手把手教你将 OpenClaw 技能封装为 REST API，部署到 Vercel，并在 Gumroad 上销售许可证密钥"
---

## 前言

这是实现 OpenClaw 技能被动收入的核心方案。全程零服务器成本，自动化交付。

---

## 架构图

```
客户购买 (Gumroad)
    ↓ webhook
生成 License Key → Vercel KV
    ↓
客户调用 API (带 Key)
    ↓
Vercel Function 验证 → 执行技能 → 返回结果
    ↓
扣减次数
```

---

## 详细步骤

### 1. 准备工作

- Node.js 18+
- Vercel 账户 (免费)
- Gumroad 账户 (免费)
- OKX (或其他交易所) USDT 钱包

### 2. 代码结构

```bash
openclaw-api-marketplace/
├── api/index.js          # 主路由
├── lib/license.js        # JWT 许可证
├── lib/skills/           # 技能实现
│   └── node-doctor.js
├── package.json
└── vercel.json
```

### 3. 核心代码

**许可证生成**:

```javascript
const key = jwt.sign({
  type: 'calls',
  value: 100,
  expiresAt: Date.now() + 30*86400000
}, JWT_SECRET);
```

**API 路由**:

```javascript
router.post('/run', async (req, res) => {
  const { skill, input, licenseKey } = req.body;
  
  // 1. 验证 license
  const license = await verifyLicense(licenseKey);
  if (!license) return res.status(403).json({ error: 'Invalid license' });
  
  // 2. 执行技能
  const result = await runSkill(skill, input);
  
  // 3. 扣次数
  await decrementQuota(licenseKey);
  
  res.json({ result, remaining: license.remaining - 1 });
});
```

**Gumroad webhook**:

```javascript
router.post('/webhook/gumroad', async (req, res) => {
  const { sale } = req.body;
  if (sale.product_permalink === 'node-doctor-api') {
    const key = generateKey({ type: 'calls', value: 100 });
    await initializeLicense(key, 100);
  }
  res.send('OK');
});
```

---

## 部署到 Vercel

```bash
npm install -g vercel
vercel --prod
```

在 Vercel Dashboard 设置环境变量:
- `JWT_SECRET` (随机32位hex)
- `GUMROUD_WEBHOOK_SECRET` (任意随机字符串)

---

## Gumroad 配置

1. 创建商品: $9.9, License Keys 开启
2. 添加 webhook: `https://your-app.vercel.app/api/webhook/gumroad`
3. 开启 "Accept cryptocurrency"
4. 发布

---

## 测试流程

1. 购买测试商品 (可以用真实 $1)
2. 收到 license key
3. 调用 API: `curl -X POST https://.../api/run -d '{"skill":"node-connection-doctor","licenseKey":"OC-..."}'`
4. 验证返回结果和剩余次数

---

## 常见问题

**Q: 如何防止 key 被盗用?**  
A: 每个 key 绑定邮箱 (sale.email)，可做 IP 限流。

**Q: Vercel 免费额度够吗?**  
A: 1000 次/天免费函数调用，初期足够。超过后 $20/月升级 Pro。

**Q: 客户买后没收到 key?**  
A: 检查 Gumroad webhook 是否配置正确，Vercel logs 查看。

---

## 收入模型

| 计划 | 价格 | 包含 |
|------|------|------|
| Starter | $9.9 | 100 次调用 |
| Pro | $49/月 | 无限次 |
| Enterprise | $99/月 | SLA + 支持 |

假设 50% 用户买 Starter，50% 买 Pro:
- 100 用户 → $5,000 总收入 → $300-500 MRR

---

**完整代码已开源**: [github.com/yourusername/openclaw-api-marketplace](https://github.com/yourusername/openclaw-api-marketplace)
