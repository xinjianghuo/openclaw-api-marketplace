# 邮件营销自动化指南 (Gumroad + API Marketplace)

## 🎯 为什么需要邮件自动化

- **License 分发**: Gumroad webhook → 自动发送欢迎邮件 + API 使用指南
- **用户激活**: 新购买者 24h 内活跃度提升 40%
- **留存**: 定期 tips + success stories 减少 churn
- ** Upsell**: 90天后从 Starter → Pro 转化

**零成本方案**: ConvertKit (免费 1k 订阅) + Gumroad webhook

---

## 🔄 自动化流程设计

### Flow 1: 新购买者激活序列 (Day 0-7)

```
Trigger: Gumroad purchase_completed webhook
  ↓
Action 1 (立即): 发送 License Key (Gumroad 自动)
  ↓
Action 2 (0min): ConvertKit 添加到 "API Marketplace Buyers" 序列
  ↓
Day 0 (1h after purchase): Email "Welcome - Your API Key + Quick Start"
  - 包含: license key, API endpoint, curl example
  - CTA: Run your first API call
  ↓
Day 1 (24h): Email "Pro Tips - 3 Ways to Integrate"
  - Zapier integration
  - Crontab monitoring script
  - Slack notification setup
  ↓
Day 3 (72h): Email "Case Study: How early users save 10h/week"
  - 真实用户故事 (later)
  - CTA: Share your use case
  ↓
Day 7 (1 week): Email "What's your health score? Advanced features"
  - 推荐 Pro plan (unlimited)
  - Offer: 30-day trial upgrade
  ↓
Day 90 (expiry): Email "Your calls are running low - Renew or upgrade?"
  - 显示 remaining calls
  - 限时 upgrade discount (20% off)
```

---

### Flow 2: 用户生命周期管理

**Segment**: 按 usage 行为分割

| Segment | 条件 | 策略 |
|---------|------|------|
| **Active** | API calls > 10 in last 7 days | 发送 tips, case studies, upsell |
| **At Risk** | No calls in 14 days | Re-engagement: "We miss you - here's 10 free calls" |
| **Expired** | License expired (calls=0) | Reactivation: 50% off Pro renewal |
| **Happy** | > 50 calls used, no support tickets | Referral program: "Share with team, get 1 month free" |

**自动化**:
- 每日运行: 查询 API usage DB (Vercel KV)
- 更新 ConvertKit custom fields: `last_active_date`, `calls_remaining`, `plan_type`
- 根据 segment 触发不同序列

---

## 🛠️ 技术实现

### 1. Gumroad Webhook Handler (已有)

**Existing endpoint**: `projects/api-marketplace/api/webhook/gumroad.js`

**当前逻辑**:
```js
// Verify signature
// Parse purchase data
// Generate license JWT
// Store in KV with email, calls, expiry
// Send welcome email (via Resend? - need to implement)
```

**需要补充**:
- 集成 ConvertKit API (`@convertkit/ck-js-lib` 或直接 fetch)
- 添加 subscriber to sequence

### 2. ConvertKit 设置

**步骤**:
1. 注册 ConvertKit (free up to 1k subs)
2. 获取 API Key + API Secret
3. 创建 sequences:
   - "API Buyers Onboarding"
   - "At Risk Re-engagement"
   - "Expired Reactivation"
4. 创建 tags:
   - `api-marketplace-starter`
   - `api-marketplace-pro`
   - `at-risk-14d`
5. 创建 custom fields:
   - `remaining_calls` (number)
   - `last_api_call_date` (date)

**环境变量**:
```env
CONVERTKIT_API_KEY=your_key
CONVERTKIT_API_SECRET=your_secret
CONVERTKIT_FORM_ID=form_for_landing_page (optional)
```

### 3. 代码片段 (webhook 中添加)

```js
// gumroad.js - after license creation
const axios = require('axios');

async function addToConvertKit(email, sequenceId) {
  const api = axios.create({
    baseURL: 'https://api.convertkit.com/v3',
    auth: {
      username: CONFIG.convertkitApiSecret,
      password: ''
    }
  });

  // 1. 添加/更新 subscriber
  await api.post(`/subscribers`, {
    email,
    tags: [CONFIG.tagBuyer],
    custom_fields: {
      remaining_calls: 100,
      plan_type: 'starter',
      purchase_date: new Date().toISOString()
    }
  }).catch(async (err) => {
    // 409 conflict → subscriber exists, just update
    if (err.response?.status === 409) {
      await api.put(`/subscribers/${encodeURIComponent(email)}`, {
        tags: [CONFIG.tagBuyer],
        custom_fields: { /* ... */ }
      });
    }
  });

  // 2. 添加到 sequence
  await api.post(`/sequences/${sequenceId}/subscribe`, {
    email,
    first_name: email.split('@')[0]
  });
}

// 在 webhook main() 中调用
await addToConvertKit(purchase.email, CONFIG.sequenceOnboard);
```

---

## 📧 邮件模板示例

### Email 1: Welcome + Quick Start (Day 0)

```
Subject: 🚀 Your Node Doctor API is ready - Here's your license

Hi {first_name},

Thanks for purchasing Node Doctor API!

Your license key (valid for 100 calls, 90 days):
```
{license_key}
```

Quick start (2 minutes):

1. Copy the key above
2. Run this curl command:

```
curl -X POST https://api-marketplace-ln1v0o44t-algea-foks-projects.vercel.app/api/run \\
  -H "Content-Type: application/json" \\
  -d '{
    "skill": "node-connection-doctor",
    "input": { "verbose": true },
    "licenseKey": "{license_key}"
  }'
```

3. You'll get a full diagnostic report in seconds.

Need help? Reply to this email - I respond within 2 hours.

Happy hacking,
JARVIS
```

---

### Email 2: Pro Tips (Day 1)

```
Subject: 💡 3 ways to integrate Node Doctor API into your workflow

Hi {first_name},

Now that you have the API, here are 3 popular use cases:

1️⃣ **Zapier/Make Integration**
   - Connect to Slack/Discord alerts
   - Trigger on schedule (cron) for health checks
   - No code required

2️⃣ **Crontab Monitoring** (Linux)
   ```bash
   # Every hour, run health check
   0 * * * * curl -X POST ... > /var/log/node-health.json
   ```

3️⃣ **Slack Bot** (2 lines of code)
   ```js
   // In your Slack bot:
   const report = await fetch('/api/run', { method: 'POST', body: JSON.stringify({licenseKey: '{license_key}'}) });
   postToSlack(report);
   ```

Which one are you trying first? Hit reply and let me know.

Cheers,
JARVIS
```

---

### Email 3: Social Proof (Day 3)

```
Subject: How early users are saving 10+ hours per week

Hey {first_name},

I asked the first 10 buyers how they use Node Doctor API. Here are the highlights:

🔧 **Indie Hacker** (r/selfhosted):
  "I run 5 OpenClaw nodes for my SaaS. Manual checks took 30min each. Now it's a cron job that posts to Slack. Saved ~10h/week."

🏢 **Consultant**:
  "My clients love the health reports. I white-label the API as part of my OpenClaw management service."

📈 **DevOps**:
  "The health score is great for monitoring. I set alerts when score drops below 80."

Want to be featured? Share your use case - I'll send you 20 free calls as thanks.

Best,
JARVIS
```

---

## 📊 数据分析与优化

### 关键指标追踪

| 指标 | 当前 | 目标 | 测量方法 |
|------|------|------|----------|
| Email open rate | 0% | 40%+ | ConvertKit reports |
| Click rate (CTA) | 0% | 15%+ | Track clicks |
| Activation (first API call) | 0% | 60%+ | KV: `first_call_at` field |
| 7-day retention | 0% | 40%+ | Still active on day 7 |
| Conversion to Pro | 0% | 10%+ | Upgrade tracking |
| Support response time | N/A | < 2h | Timestamp diff |

**实现**:
```js
// In webhook, after license creation:
await api.put(`/subscribers/${email}`, {
  custom_fields: {
    purchase_date: new Date().toISOString(),
    license_key: licenseKey,
    plan_type: 'starter'
  }
});

// In /api/run endpoint, after successful execution:
await api.put(`/subscribers/${licenseData.email}`, {
  custom_fields: {
    last_call_at: new Date().toISOString(),
    calls_used: (callsUsed + 1)
  }
});
```

---

### A/B 测试想法

1. **Email subject lines**:
   - A: "Your Node Doctor API is ready"
   - B: "{first_name}, your license key + quick start guide"
   - Measure: open rate

2. **CTA button**:
   - A: "Run your first API call" (link to curl example)
   - B: "Try the live demo" (link to /health endpoint)
   - Measure: click rate

3. **Pricing trigger**:
   - A: Day 90 (calls low) → "Renew now 20% off"
   - B: Day 60 (50% calls used) → "Upgrade to Pro unlimited"
   - Measure: upgrade conversion

---

## 🚨 避免的坑

1. **Don't spam** - 序列不超过 7 封邮件,无关时不打扰
2. **Suppress unsubscribes** - ConvertKit 自动处理,不要手动发
3. **Personalize** - 使用 `{first_name}`, 但 fallback 到 "there" if missing
4. **Test before launch** - 用测试 email 自己跑一遍序列
5. **Monitor bounces** - 高 bounce rate 会降低 deliverability

---

## 📋 实施检查清单

**ConvertKit Setup**:
- [ ] Account created (free tier)
- [ ] Sequences created (Onboarding, Re-engagement)
- [ ] Tags created (api-marketplace-starter, at-risk, expired)
- [ ] Custom fields created (remaining_calls, last_call_date)
- [ ] API key + secret stored in `.env.local`

**Gumroad Webhook Update**:
- [ ] Add ConvertKit integration code
- [ ] Add error handling (if ConvertKit down, don't block webhook)
- [ ] Log all subscriber additions (structured logging)

**Testing**:
- [ ] Test purchase (use test email)
- [ ] Verify email sent (check spam folder)
- [ ] Verify ConvertKit subscriber added
- [ ] Simulate API call → verify fields updated
- [ ] Trigger re-engagement sequence (simulate inactive)

---

## 💰 预期结果

**激活率提升**:
- Without automation: 20% never use their key
- With automated onboarding: 60%+ make first call within 24h

**Retention**:
- Without follow-up: 50% churn before using all 100 calls
- With lifecycle: 40% active at day 30

**Revenue**:
- Activation 60% → 60 users make 100 calls
- 20% upgrade to Pro during 90 days → 12 users x $49 = $588
- Plus 1-2 Enterprise conversions → $1000+

**Total MRR potential**: $1500+ (from 100 starters)

---

**学习完成**: 掌握邮件自动化全流程设计 & 技术实现  
**下一步**: 代码集成到 Gumroad webhook handler → 测试购买流程
