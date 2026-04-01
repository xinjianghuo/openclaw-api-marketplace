# 自动化运营: 从购买到交付的全自动化

## 🔄 目标: 零人工干预的被动收入系统

客户购买 → 自动发 license → 客户使用 API → 系统监控 → 自动续费/降级 → 自动支持

---

## 🏗️ 架构组件

```
Customer (browser)
    ↓ Purchase
Gumroad (payment)
    ↓ Webhook (purchase_completed)
[API Server] (verify + deliver)
    ↓ License Key
Customer (API usage)
    ↓ Calls
[Rate Limiter] (track usage)
    ↓ Quota check
Skill Execution (OpenClaw)
    ↓ Result
Customer
```

---

## 1️⃣ Gumroad 配置自动化

### Webhook 处理

Gumroad 发送 Purchase webhook → 你的服务器验证 → 生成 license key → 存入数据库

**已实现** (`api/webhook/gumroad`):
```javascript
// POST /api/webhook/gumroad
{
  "sale": {
    "email": "customer@example.com",
    "product_permalink": "node-doctor-api-100-calls",
    "id": "sale_id"
  }
}
```

**流程**:
1. 验证 webhook signature (防止伪造)
2. 检查 product_permalink
3. 生成 license key (JWT)
4. 存入 KV/Redis: `license_key -> { remaining: 100, expiresAt: ... }`
5. 发送确认邮件 (通过 Gumroad auto-email 或你的 SMTP)

---

## 2️⃣ License 验证自动化

**已实现** (`/api/run`):

```javascript
// 1. 客户调用
POST /api/run
{
  "skill": "node-connection-doctor",
  "input": { "verbose": true },
  "email": "customer@example.com"
}

// 2. 验证购买 (Gumroad API)
GET https://api.gumroad.com/v2/purchases?email=...&product_id=...

// 3. 扣减次数 ( storage decrement)
//    (未来: 用 Upstash Redis atomic decrement)

// 4. 执行技能
// 5. 返回结果
```

---

## 3️⃣ 监控与告警自动化

### 指标收集

| 指标 | 来源 | 用途 |
|------|------|------|
| Request count | Rate limiter | 流量趋势 |
| Error rate | Error handler | 稳定性 |
| Latency (p95) | Vercel analytics | 性能 |
| Revenue | Gumroad reports | 收入 |
| Active users | License usage | 活跃度 |

### 告警规则

```
IF error_rate > 5% for 5min → Slack/Telegram alert
IF revenue drops 50% week-over-week → Email alert
IF license expires in 7 days → Auto-email renewal reminder
```

**工具**:
- Vercel Analytics (内置)
- UptimeRobot (免费监控)
- Better Stack (日志 + 告警)

---

## 4️⃣ 用户生命周期自动化

### 新用户 welcome 流程

```
Day 0: Purchase → License email delivered
Day 1: Email "Getting started guide" + API examples
Day 3: Email "Tips & tricks" + link to docs
Day 7: Email "How's it going?" + offer support
Day 30: If Pro plan, renewal reminder (7 days before)
```

**工具**: ConvertKit (免费 up to 1k subs) 或 MailerLite

---

### 试用转付费

```
Starter用户 (100 calls) → 当 remainingCalls < 10:
  - Auto-email: "Your calls are running low"
  - Offer: Upgrade to Pro unlimited for $49/mo
  - 折扣: 20% off first month (if upgrade within 3 days)
```

---

### 流失预防 (Churn Prevention)

```
订阅用户 → 如果连续 3 天无 API 调用:
  - Email: "We miss you! Here's a 30% off coupon to reactivate"
  - 附: 常见问题解答

取消订阅 → 立即:
  - Email: "Sorry to see you go. Can we improve? (survey link)"
  - 提供: 暂停 subscription 而非取消
```

---

### 重新激活 (Re-engagement)

```
30天未使用用户:
  - Email: "New features released: [list]"
  - 免费 50 calls 额度 (刺激使用)

90天未使用用户:
  - Email: "We're shutting down your license unless you respond"
  - 最终提醒
```

---

## 5️⃣ 支持自动化

### FAQ Chatbot

- **工具**: Botpress (self-hosted) 或 Landbot (no-code)
- **训练**: 用文档 + 常见问题
- **覆盖**: 80% 重复问题 (如何调用、错误码解释、额度查询)

**问题示例**:
- "How to use the API?" → 返回 docs link + curl example
- "What does error 403 mean?" → 解释 license 验证失败
- "How to check remaining calls?" → 解析响应头或提供查询 endpoint

---

### 工单系统

- **工具**: Help Scout (免费 up to 3 users) 或 Zoho Desk
- **规则**: 客户邮件 → 自动创建工单 → 24h SLA → 自动升级 if not responded

---

## 6️⃣ 财务自动化

### 收入追踪

```javascript
// Daily cron job (02:00)
1. Fetch Gumroad sales report (CSV)
2. Parse → store to database (sqlite/Redis)
3. Calculate MRR, churn, LTV
4. Update dashboard (public /admin/metrics)
5. If MRR < target, send alert to self
```

### 税务计算 (未来)

- **Stripe**: 自动 VAT/GST 计算 (欧盟)
- **Lemon Squeezy**: 全包税务
- **Gumroad**: 部分税务处理

---

## 7️⃣ 部署与 CI/CD 自动化

### Vercel Auto-deploy

- GitHub push → Vercel auto-deploy (已实现)
- 生产分支: `main` → Production
- PR 预览: `PR-xx` → Preview URL

### 自动化测试

```
On every PR:
  - Run unit tests (jest)
  - Run integration tests (supertest)
  - Lint (eslint)
  - Type check (if TypeScript)
  
If all pass → auto-merge (if approved)
```

---

## 8️⃣ 备份与灾难恢复自动化

### 数据备份

```
Daily (03:00):
  - Dump Redis/KV data to JSON
  - Upload to S3 / Backblaze B2 ($0.005/GB)
  - Keep last 30 days
  
Weekly:
  - Full database backup
  - Verify restore procedure (monthly)
```

### 故障自愈

```
IF API error rate > 10%:
  - Auto-rollback to previous Vercel deployment
  - Notify via Telegram
  
IF Vercel deployment fails:
  - Rollback automatically (keep last 3 versions)
```

---

## 🛠️ 工具栈总结

| 功能 | 工具 | 成本 |
|------|------|------|
| 支付 | Gumroad / Lemon Squeezy | 5-10% |
| 邮件 | ConvertKit / MailerLite | Free-$29/mo |
| 监控 | UptimeRobot / Better Stack | Free-$20/mo |
| 聊天 | Botpress (self-hosted) | Free |
| 工单 | Help Scout | $20/mo |
| 备份 | Backblaze B2 | $0.005/GB |
| CI/CD | Vercel + GitHub Actions | Free |

**总成本**: <$50/月 (初期) → <$200/月 (规模化)

---

## 📈 实现路线图

**Week 1** (Done):
- ✅ API 部署
- ✅ Gumroad webhook
- ✅ License verification
- ✅ Rate limiting

**Week 2**:
- 🔄 实现 webhook license key generation (Upstash Redis)
- 🔄 设置 email automation (ConvertKit)
- 🔄  Configure monitoring alerts (UptimeRobot)

**Week 3**:
- 🔄  Stripe integration (备选支付)
- 🔄  OpenAPI docs deployment
- 🔄  Customer dashboard (check usage)

**Week 4**:
- 🔄  ChurnBuster API integration
- 🔄  Advanced analytics
- 🔄  First Reddit promotion

---

## 🎯 成功标准

- ✅ 0 manual license key distribution
- ✅ 0 manual email responses (FAQ + chatbot covers 80%)
- ✅ 99% uptime (Vercel SLA)
- ✅ <1小时响应时间 (support ticket SLA)
- ✅ $100+ MRR 持续增长

---

**当前状态**: 核心已实现 (webhook, verification, rate limiting)。待完成: Redis 集成、email automation、monitoring alerts。

---

*Last Updated: 2026-03-28 15:40 by JARVIS*
