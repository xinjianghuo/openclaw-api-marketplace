# 2026-03-27 - 全自动赚钱方案深度研究

**研究时长**: 4小时 (16:12-20:12)
**目标**: 找出零客户沟通、零交付维护的被动收入路径
**约束**: 零成本启动 (<$20), 适合中国开发者, 使用 OpenClaw 技能栈

---

## 📊 研究框架

1. API 微服务 + Gumroad 许可证系统 (快速变现)
2. 自动化内容站 + AdSense/Affiliate (长期被动)
3. 浏览器脚本销售 (中等变现)
4. 数据监控服务 (订阅制)
5. Affiliate 内容农场 (混合模式)

---

## 🎯 评估标准

| 方案 | 启动速度 | 被动程度 | 月收入潜力 | 维护需求 | 中国友好度 | 综合分 |
|------|----------|----------|------------|----------|-----------|--------|
| API + Gumroad | 2h | 极高 | $100-500 | 极低 | ⭐⭐⭐⭐⭐ | 9/10 |
| 内容站 | 1d | 高 | $50-200 | 低 | ⭐⭐⭐⭐ | 7/10 |
| 浏览器脚本 | 4h | 中 | $50-300 | 低 | ⭐⭐⭐⭐⭐ | 8/10 |
| 数据监控 | 6h | 中 | $100-500 | 中 | ⭐⭐⭐⭐ | 7/10 |
| Affiliate农场 | 3h | 中 | $30-150 | 低 | ⭐⭐⭐⭐ | 6/10 |

**优先级**: API > 浏览器脚本 > 内容站 > 数据监控 > Affiliate

---

## 📦 方案1: API 微服务 + Gumroad 许可证系统 ⭐⭐⭐⭐⭐

### 核心思路

将 OpenClaw 技能封装为 REST API → 部署到 Vercel (免费) → 在 Gumroad 销售许可证密钥 → 完全自动化

### 为什么是最优

- ✅ **零客户沟通**: API 标准化调用，无需解释
- ✅ **零交付维护**: Gumroad 自动发 key，API 自动验证
- ✅ **零成本**: Vercel 免费托管，Gumroad 免费上架
- ✅ **中国友好**: 收 USDT (加密货币)，无银行限制
- ✅ **边际成本为零**: 每多一用户，成本不增加
- ✅ **可扩展**: 增加新技能 = 增加新产品

### 技术架构

```
客户购买 (Gumroad) → 自动生成 License Key → 存储在 KV (Vercel)
     ↓
客户调用 API (带 key) → Vercel Function 验证 key → 执行技能 → 返回结果
     ↓
每次调用扣次数 → key 失效后需重新购买
```

### 具体实施步骤

#### Day 1: 环境准备 (2h)

1. **注册 Vercel** (vercel.com, 免费)
2. **注册 Gumroad** (gumroad.com, 免费)
3. **创建 USDT 钱包** (OKX/Binance, 用于收款)

#### Day 2: 第一个技能 API (3h)

选择 **Node Connection Doctor** 作为第一个 API 产品。

步骤:

1. **创建 Vercel 项目**
```bash
# 本地初始化
npm init -y
npm install express vercel jsonwebtoken sqlite3
```

2. **编写 API 入口** (`api/index.js`):
```javascript
module.exports = async (req, res) => {
  const { skill, input, licenseKey } = req.body;

  // 1. 验证 license key
  const keyInfo = await verifyLicense(licenseKey);
  if (!keyInfo) return res.status(403).json({ error: 'Invalid license' });

  // 2. 检查剩余次数
  if (keyInfo.remaining <= 0) return res.status(402).json({ error: 'Quota exceeded' });

  // 3. 执行对应技能 (调用 OpenClaw 技能逻辑)
  const result = await runSkill(skill, input);

  // 4. 扣减次数
  await decrementQuota(licenseKey);

  res.json({ result, remaining: keyInfo.remaining - 1 });
};
```

3. **许可证验证** (`lib/license.js`):
- 使用 Vercel KV (Redis) 存储: `key => { remaining, expiresAt }`
- 验证逻辑: 检查 key 存在 + 未过期 + 次数>0

4. **技能执行器** (`lib/skills/node-doctor.js`):
- 复用已有的 `diagnose.js` 核心逻辑
- 去掉 CLI 输出，返回 JSON

5. **Webhook 处理** (Gumroad → Vercel):
- Gumroad → Settings → Webhooks → 添加 `https://your-app.vercel.app/api/gumroad-webhook`
- 事件: `purchase_completed`
- 收到后生成新 license key 并存入 KV

6. **部署到 Vercel**
```bash
vercel --prod
```

7. **测试**:
- 用 Postman 调用 API
- 验证 license key 拦截
- 完成 1 次成功调用

#### Day 3: Gumroad 商品页设置 (1h)

1. **创建商品**:
   - Name: "Node Doctor API - 100 Calls"
   - Price: $9.9
   - Description: 自动诊断 OpenClaw 节点连接问题的 API，100次调用额度
   - Category: Software

2. **设置许可证自动发放**:
   - Product → Settings → License keys
   - Enable: ✅
   - Format: Random (16 chars)
   - Delivery: Automatic

3. **API 文档**:
   - 创建 README (如何调用、参数说明、示例 curl)
   - 附 Postman collection

4. **定价策略**:
   - $9.9 / 100 calls
   - $49 / unlimited monthly
   - $99 / enterprise (SLA)

#### Day 4-7: 优化与发布

- 添加 Dashboard (让用户查看剩余次数)
- 添加 Webhook 失败重试
- 写使用文档
- 在 Reddit r/openclaw 发帖推广
- 收集首批用户反馈

### 收入预期

| 时间 | 付费用户 | ARPU | MRR |
|------|----------|------|-----|
| 第1个月 | 5 | $9.9 | $50 |
| 第2个月 | 12 | $15 (混合套餐) | $180 |
| 第3个月 | 25 | $20 | $500 |
| 第6个月 | 60 | $25 | $1,500 |

**关键**: 每个用户都是自动化，无额外服务成本。

### 风险与缓解

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| Vercel 免费额度超 | 中 | 暂停服务 | 升级 Pro ($20/月) 或迁移 Railway |
| Gumroad 手续费高 | 低 | 利润减少 | 定价已包含5% |
| API 滥用 (刷调用) | 高 | 成本增加 | 每个 key 限流，监控异常 |
| 技能逻辑有 bug | 中 | 客诉 | 提供退款保证，快速修复 |

### 扩展性

- 增加新技能 = 新商品 (Security Audit API, ChurnBuster API)
- 打包销售 ("All APIs Bundle" $99/月)
- 企业定制 (额外收费)

---

## 🖥️ 方案2: 浏览器脚本销售 (Gumroad)

### 核心思路

开发 Playwright/Puppeteer 自动化脚本，解决具体痛点，销售 ZIP 包

### 为什么可行

- ✅ 单次开发，无限销售
- ✅ 无需支持 (文档足够详细)
- ✅ 需求真实，Reddit 每日有求脚本
- ✅ 零成本 (开发+托管)

### 热门需求 (调研结果)

基于 Reddit r/automation, r/webscraping 高频请求:

1. **LinkedIn 自动连接+跟进** - 销售/猎头需求
2. **Amazon 价格追踪+降价提醒** - 个人购物者
3. **Indeed/LinkedIn 自动申请** - 求职者
4. **Instagram 自动点赞/评论** - 社媒运营
5. **YouTube 视频下载+转录** - 内容创作者

定价: $19-49/个

### 实施

Day 1: 选 LinkedIn auto-connect
Day 2: 开发+测试
Day 3: 录制演示视频 (OBS, 免费)
Day 4: Gumroad 上架
Day 5: Reddit 免费推广 (提供限时折扣)

预期: 首月 5-10 销售 → $100-500

---

## 📝 方案3: 自动化内容站 (AdSense + Affiliate)

### 核心思路

用 AI 生成高质量教程/评测内容 → SEO 排名 → 广告+联盟收入

### 选择 Niche

推荐: "OpenClaw Tutorials" 或 "Micro-SaaS Ideas"

理由:
- 新赛道，竞争少
- 我的内容有独特优势 (真实经验)
- 目标受众付费意愿强

### 技术栈

- 生成: OpenAI API ($0.002/1k tokens)
- 部署: GitHub Pages (免费)
- SEO: 长尾关键词优化
- 收入: Google AdSense (需收$100门槛) + Amazon Affiliate

### 速度

- 3个月开始看到流量
- 6个月稳定收入 $50-200/月
- 12个月 $200-500/月

适合长期持有，不应急。

---

## 🎯 立即行动计划 (接下来24小时)

### 优先级 1: API + Gumroad 许可证系统

**今日任务** (16:00-20:00 4小时):

1. **16:00-16:30**: 注册 Vercel + 创建项目脚手架
2. **16:30-18:00**: 实现 Node Doctor API 基础版 (验证+计数)
3. **18:00-18:30**: 部署测试，验证流程
4. **18:30-19:30**: 注册 Gumroad，创建商品页草稿
5. **19:30-20:00**: 撰写 README 和 API 文档

**预期产出**: 一个可工作的 API 端点 (包含许可证验证)，Gumroad 商品页准备就绪，明天可上线测试。

---

**我现在立即开始执行优先级1。**

后续 Phases (内容站、脚本) 等 API 方案验证后再追加。

是否同意这个计划？我直接开干。
