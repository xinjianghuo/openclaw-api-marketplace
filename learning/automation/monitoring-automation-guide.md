# 监控与告警系统设计 (零成本方案)

## 🎯 为什么需要监控

- **API 健康**: 用户调用失败 → 声誉受损 + 退款
- **Uptime SLA**: 承诺 99.9%，需要证明
- **性能优化**: 识别慢查询，优化 latency
- **商业洞察**: 多少 active users? revenue trends?

**零成本方案**:
- UptimeRobot (免费 50 monitors, 5min interval)
- Sentry (免费 5k errors/mo)
- Vercel Analytics + Logs (免费 tier)
- Simple custom dashboard (Gumroad sales + API metrics)

---

## 📊 监控指标清单

### 可用性 (Availability)

| 指标 | 目标 | 工具 | 告警阈值 |
|------|------|------|----------|
| API /health 响应 | 200 OK, < 200ms | UptimeRobot | 如果 down > 2min |
| Uptime % | 99.9% (月 downtime < 43min) | UptimeRobot stats | < 99% → 紧急 |
| Region coverage | All regions (via Vercel) | Manual check | - |

### 性能 (Performance)

| 指标 | 目标 | 工具 | 告警阈值 |
|------|------|------|----------|
| Average response time | < 200ms | Vercel Analytics | > 500ms |
| P95 latency | < 1s | Vercel Analytics | > 2s |
| Error rate (5xx) | < 0.1% | Sentry / Vercel logs | > 1%持续5min |
| Rate limit hits | 0 (per license) | Custom KV metrics | Spike > 10% users |

### 业务 (Business)

| 指标 | 目标 | 工具 | 告警阈值 |
|------|------|------|----------|
| Daily Active Users (DAU) | > 10 (Month 1) | Custom KV count | 连续3天下降 >20% |
| Weekly revenue | Growing 10% WoW | Gumroad dashboard | 连续2周 flat/decline |
| License key usage rate | > 80% of purchased calls (active) | KV `calls_used` | < 50% after 30d |
| Support response time | < 2h | Manual tracking | > 4h |

---

## 🛠️ 工具配置指南

### 1. UptimeRobot (免费 50 monitors)

**设置**:
1. 注册 https://uptimerobot.com (free tier)
2. Add New Monitor:
   - Monitor Type: HTTP(s)
   - Friendly Name: `API Marketplace - Health`
   - URL: `https://api-marketplace-ln1v0o44t-algea-foks-projects.vercel.app/api/health`
   - Interval: 5 minutes (free min)
   - Timeout: 30s
   - Alert contacts: Email (your email) + Telegram (optional)
3. Add additional monitors:
   - `/api/run` with test license (smoke test)
   - Gumroad webhook endpoint (if public)
4. Status page (optional): public page showing uptime

**告警规则**:
- 如果 down → 立即 email + Telegram
- 如果 down > 3 consecutive checks → escalate to SMS (paid)
- 恢复通知: enabled

---

### 2. Sentry (免费 5k errors/mo)

**设置**:
1. 注册 https://sentry.io (free tier)
2. 创建 project: `openclaw-api-marketplace` (Node.js)
3. 配置 Vercel:
   - In Vercel dashboard → Project Settings → Integrations → Sentry
   - Add Sentry DSN to env: `SENTRY_DSN=...`
4. Install in API project:
   ```bash
   cd projects/api-marketplace
   npm install @sentry/node @sentry/profiling-node
   ```
5. Instrument code (`projects/api-marketplace/api/index.js`):
   ```js
   const Sentry = require('@sentry/node');
   const { nodeProfilingIntegration } = require('@sentry/profiling-node');

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.VERCEL_ENV || 'production',
     tracesSampleRate: 1.0,
     integrations: [nodeProfilingIntegration()],
   });
   // Before request handlers
   app.use(Sentry.middleware.captureExceptions);
   ```

**告警规则**:
- Error volume spike: > 10 errors in 1h → email
- New error type: first occurrence → Slack notification
- Performance: P95 > 2s →warning

---

### 3. Vercel Analytics + Logs (免费)

**Analytics**:
- Vercel Dashboard → Analytics tab
- Metrics: Requests, Response Time, Data Transfer, Edge Functions
- Real-time: last 24h

**Logs** (Vercel CLI):
```bash
npm install -g vercel
vercel logs https://api-marketplace-ln1v0o44t-algea-foks-projects.vercel.app --since 1h
```

**关键 log patterns** (should grep):
- `"level": 40` (error)
- `remainingCalls: 0` (license exhausted)
- `license verification failed`
- `Gumroad webhook` (success/failure)

---

### 4. Custom Metrics Dashboard (零成本)

**数据源**:
- Vercel KV: `license:*` (count), `usage:*` (count)
- Gumroad sales API (purchase events)
- Vercel logs (analyzed)

**实现方案 A: Simple JSON endpoint** (免费, 无数据库)

`projects/api-marketplace/api/metrics.js`:

```js
module.exports = async (req, res) => {
  // 1. Count total licenses (Starter + Pro)
  const licenseKeys = await kv.keys('license:*');
  const totalLicenses = licenseKeys.length;

  // 2. Count active licenses (last_call within 7 days)
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentKeys = await kv.keys('last_call:*', { gt: oneWeekAgo });
  const activeUsers = recentKeys.length;

  // 3. Revenue estimate (from Gumroad purchases? need API polling)
  // Placeholder for now

  // 4. Top skills usage
  const skillStats = await kv.hgetall('stats:skills'); // {skill: count}

  res.json({
    timestamp: new Date().toISOString(),
    uptime_days: (Date.now() - process.env.START_TIME) / (1000*60*60*24),
    total_licenses: totalLicenses,
    active_users_7d: activeUsers,
    revenue_estimate_usd: 0, // TODO
    skill_usage: skillStats,
    environment: process.env.VERCEL_ENV
  });
};
```

**访问**: `https://your-app.vercel.app/api/metrics` (需 basic auth 或 IP whitelist)

---

### 5. Gumroad Sales + Webhook Monitoring

**Gumroad Dashboard**:
- 销售额、购买数、退款率 (免费查看)
- 设置 email alerts for new sales (Gumroad → Settings → Notifications)

**自制 sales tracker** (替代方案):
- 在 Gumroad webhook 中记录每个 purchase 到 KV:
  ```js
  await kv.set(`sale:${Date.now()}`, {
    email: purchase.email,
    amount: purchase.price,
    product: purchase.product_name,
    timestamp: new Date().toISOString()
  });
  ```
- 每日 cron 汇总 revenue 并 email report

---

## 🚨 告警策略

### 严重度分级

| 级别 | 条件 | 响应时间 | 通知渠道 |
|------|------|----------|----------|
| **P0 Critical** | API down, 5xx error rate > 10% | 即时 (<5min) | SMS + Email + Telegram |
| **P1 High** | Latency P95 > 2s, Error rate > 1% | 15min | Email + Telegram |
| **P2 Medium** | DAU drop > 20% day-over-day | 1h | Email digest (daily) |
| **P3 Low** | License key error spike | 4h | Weekly report |

---

### 告警实现

**UptimeRobot**:
- Already handles P0/P1 availability

**Custom alert (Sentry)**:
- Create alert rules:
  - Issue frequency: > 5 in 5 minutes
  - New issue: first occurrence
  - Performance: Transaction duration P95 > 2s

**Business metrics (cron job)**:

`projects/api-marketplace/scripts/daily-report.js`:

```js
// Run daily at 09:00 Asia/Shanghai (01:00 UTC)
const axios = require('axios');

async function dailyReport() {
  const metrics = await axios.get('https://your-app.vercel.app/api/metrics');
  const data = metrics.data;

  // 计算 revenue (需从 Gumroad API 拉取或 KV)
  const report = `
📊 Daily Report - ${data.timestamp.split('T')[0]}
---------------------------------
Uptime: ${data.uptime_days.toFixed(2)} days
Total licenses: ${data.total_licenses}
Active users (7d): ${data.active_users_7d}
Top skill: ${Object.entries(data.skill_usage).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'N/A'}
  `;

  // 发送到 email 或 Telegram
  await axios.post('https://api.telegram.org/bot<token>/sendMessage', {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text: report
  });
}

dailyReport();
```

**Cron 设置** (Vercel Cron):
```json
// vercel.json
{
  "crons": [
    { "path": "/api/scripts/daily-report", "schedule": "0 1 * * *" }
  ]
}
```

---

## 🔍 故障排查流程

### 当收到 UptimeRobot down 告警:

1. 检查 Vercel dashboard → 是否部署失败?
2. 检查 Sentry → 是否有大量 errors?
3. 检查 Vercel logs:
   ```bash
   vercel logs your-app --since 10m | grep -E "ERROR|FATAL"
   ```
4. 快速回滚 (if recent deploy broke):
   ```bash
   vercel rollback
   ```
5. 如果 Gumroad webhook 失败 → 检查 signature verification

---

### 当收到 "license verification failed" 激增:

1. 检查 Gumroad product settings:
   - License keys enabled? ✓
   - Webhook active? ✓
   - API token valid? ✓
2. 检查 KV store: 是否有 corrupted license data?
3. Check webhook logs: `vercel logs | grep webhook`
4. 可能原因: Gumroad API 配额用尽 → 需要 upgrade Gumroad account (free tier limits?)

---

## 📈 数据驱动优化

**每月复盘**:
- Uptime: 达标 99.9%? If not, investigate incidents
- Latency: P95 是否下降? Identify slow endpoint
- Business: DAU/Revenue 增长 → 确认 product-market fit
- Errors: Top 3 error types → prioritize fixes

**优化目标**:
- Reduce P95 latency by 20% (optimize db queries, cache)
- Increase activation rate from 40% to 60% (improve onboarding email)
- Reduce churn by understanding "at risk" segment behavior

---

## 🆓 零成本监控配置完成度

| 工具 | 成本 | 配置状态 | 用途 |
|------|------|----------|------|
| UptimeRobot | Free (50 monitors) | ✅ 已计划 | 可用性告警 |
| Sentry | Free (5k errors/mo) | ✅ 已计划 | 错误追踪 |
| Vercel Analytics | Free (built-in) | ✅ 内置 | 性能指标 |
| Custom metrics | Free (KV + API) | ⏳ 待实现 | 业务指标 |
| Telegram bot | Free | ✅ 可行 | 告警通知 |

**Total cost**: $0 (within free tiers)

---

**学习完成**: 掌握低成本监控全栈方案  
**下一步**: 实现 `/api/metrics` endpoint + daily report cron
