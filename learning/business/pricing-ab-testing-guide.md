# 定价 A/B 测试策略 (微 SaaS 指南)

## 🧠 定价心理学基础

### 锚定效应 (Anchoring)

**原理**: 用户对价格的感知受第一个看到的价格影响

**应用**:
- 展示"原价" $99，然后划掉，显示 $49 (even if never sold at $99)
- 或: 先展示 Enterprise plan $500, then Pro $49 looks cheap

**API Marketplace 示例** (current page):
```
┌─────────────────────────────┐
│       Choose Your Plan       │
├─────────────┬───────────────┤
│  Starter    │  Pro          │
│  $9.9       │  $49          │  ← $9.9 锚定 $49 显得实惠
│  100 calls  │  Unlimited    │
│  90 days    │  Monthly      │
│             │  Priority     │
│  Most       │  support      │  ← "Most Popular" tag
│  Popular    │               │   增加转换
└─────────────┴───────────────┘
```

---

### 价格弹性测试

**目标**: 找到收入最大化的价格点 (不是转化率最大)

**公式**: Revenue = Price × Conversion Rate

**测试策略**:
- 测试 3 个价格档位: $9.9, $19.9, $29.9 (Starter)
- 监控转化率变化
- 计算每个价格点的预期 MRR:
  ```
  MRR = (traffic × CVR) × price
  ```

**If**:
- Price $9.9 → CVR 2% → MRR = $99 per 1k visitors
- Price $19.9 → CVR 1.2% → MRR = $119 per 1k visitors
- Price $29.9 → CVR 0.7% → MRR = $105 per 1k visitors

**结论**: $19.9 是收入最大化点

---

### 支付意愿分层 (Price Discrimination)

**不同用户愿付不同价格** → 需要多版本

**经典三种**:
1. **功能限制** (Freemium → Pro → Enterprise)
2. **用量限制** (100 calls → 1000 calls → unlimited)
3. **时间限制** (90天 → 1年 → lifetime)

**API Marketplace**:
- Starter: 100 calls, 90 days → 低门槛试用
- Pro: unlimited, monthly → 核心收入
- Enterprise: SLA, custom skill → 高价值

**进阶**: Add "Lifetime Deal" for early adopters ($99 one-time) → 快速首付

---

## 🧪 A/B 测试实施

### 实验设计

**变量**:
- 价格 (price point)
- 包装 (plan names, features)
- 社会证明 (testimonials, logos)
- 行动号召 (CTA 文案: "Get Started" vs "Start Free Trial")
- 支付方式 (信用卡 only vs + crypto)

**工具** (零成本):
- Google Optimize (免费, 但需 Google Analytics)
- 或: 自制 split (random cookie → 不同 price)

**自制 split example**:

```js
// In landing page
const variant = Math.random() < 0.5 ? 'A' : 'B';
const price = variant === 'A' ? 9.9 : 19.9;

// Store in cookie for consistent experience
document.cookie = `price_variant=${variant}; path=/; max-age=86400`;

// Render price accordingly
document.getElementById('price').textContent = `$${price}`;
```

**追踪**:
- Google Analytics: track `price_variant` as custom dimension
- Event: `purchase_complete` with price value
- 计算各变体的 CVR 和 revenue per visitor

---

### 统计显著性

**最小样本量** (before deciding winner):
- 每 variants 至少 100 conversions
- 或: 使用 chi-square test, p-value < 0.05

**不要过早停止**:
- 如果 A 领先但不显著 → 继续运行
- 至少 1-2 周 (capture weekday/weekend patterns)

**多变量测试** (MVT):
- 如果流量大 (> 10k visitors/month), 可同时测试 price + CTA + social proof
- 工具: Google Optimize multivariate

---

## 💰 API Marketplace 定价测试计划

### Phase 1: Starter Price Test (Week 1-2)

**Hypothesis**: Price $19.9 converts worse but revenue better than $9.9

**Groups**:
- A: $9.9 (current)
- B: $19.9
- C: $29.9

**Measure**:
- Visitors → Purchases (conversion)
- Revenue per visitor
- Support ticket volume (price sensitivity questions)

**Success**: 确定 Starter 最优价格点

---

### Phase 2: Pro Plan Positioning (Week 3-4)

**Hypothesis**: "Unlimited" resonates more than "1000 calls"

**Groups**:
- A: "Pro: Unlimited" (current)
- B: "Pro: 1000 calls/month"
- C: "Pro: 500 calls/week"

**Measure**:
- Upgrade rate from Starter to Pro
- Pro plan churn
- User feedback on perceived value

**Success**: 找到最吸引人的 Pro 包装

---

### Phase 3: Trial → Paid (Week 5-6)

**Hypothesis**: 7-day trial increases activation but hurts revenue

**Groups**:
- A: Direct purchase (Starter $X one-time)
- B: 7-day free trial → $X
- C: 10 free calls → $X to continue

**Measure**:
- Activation rate (first API call)
- Conversion from trial → paid
- Refund rate (if unhappy)

**Success**: 确定最佳漏斗

---

## 📊 数据追踪实现

### 事件追踪 (Google Analytics 4)

**Events to track**:
1. `view_item` (product page visit)
2. `begin_checkout` (click buy)
3. `purchase` (post-Gumroad redirect)
4. `first_api_call` (user successfully calls API)

**Properties**:
- `price`, `plan_type`, `currency`, `variant_id`

**GA4 设置** (免费):
1. Create property: "API Marketplace"
2. Add measurement ID to site `<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXX"></script>`
3. Configure events in code:
```js
gtag('event', 'purchase', {
  value: 9.9,
  currency: 'USD',
  items: [{item_name: 'Starter', price: 9.9}]
});
```

---

### 自定义仪表板 (Google Data Studio / Looker Studio)

**免费工具**: Looker Studio (原 Data Studio)

**Connector**:
- GA4 data source
- Gumroad sales (CSV export or API via supermetrics)
- Custom KV metrics (export to Google Sheets)

**Dashboard 布局**:

1. **Revenue Overview**:
   - This month revenue (vs last month)
   - Visitors
   - Conversion rate
   - Revenue per visitor

2. **A/B Test Results**:
   - Table: variant | visitors | conversions | CVR | revenue/vistor
   - Statistical significance indicator (manual calc)

3. **User Segments**:
   - Active vs at-risk vs expired
   - Retention curve (cohort analysis)

4. **Top Features Used**:
   - Which skill most called? (from KV stats)

---

### 自动化周报

`projects/api-marketplace/scripts/weekly-report.js`:

```js
async function weeklyReport() {
  // 1. Get GA4 data via API (need GA4 service account)
  // 2. Get Gumroad sales via Gumroad API
  // 3. Get KV metrics
  // 4. Compose email

  const report = `
📈 Weekly Report (${lastWeek})
---------------------------------
Traffic: 1,234 visitors (+15% WoW)
Conversions: 23 purchases (CVR 1.86%, +0.3% WoW)
Revenue: $227.70 (vs $189 last week)
Top variant: $19.9 (CVR 1.5%, Rev/Vis $0.297)

Active users: 45 (7-day)
Avg latency: 142ms

Issues:
- 2x webhook failures (fixed)
- 3 support tickets (all resolved)

Next test: Pro plan positioning (launch Monday)
  `;

  await sendEmail(' weekly-report@yourdomain.com', report);
}
```

**Cron**: Monday 09:00 运行

---

## 🎯 收入目标与里程碑

### Month 1: $100 MRR

假设:
- 50 Starter 用户 ($9.9 each, 90天有效期)
- 2 Pro 用户 ($49/mo)
- Revenue = 50×$9.9 (spread over 3 months) + 2×$49 ≈ $100-150 MRR

**需**: 50 purchases in first 30 days →  traffic ~5k visitors @ 1% CVR

---

### Month 2: $300-500 MRR

- 累积 150 Starter users (some expire)
- 5 Pro users ($245)
- 1 Enterprise ($500 one-time + $100/mo)
- Revenue = ($50× expired + $100× new×$9.9) + $245 + $100 ≈ $400-600

**需**: 100 new purchases MoM, 5 upgrades to Pro

---

### Month 3: $800+ MRR

- 250 total users, 100 active
- 10 Pro users ($490)
- 2 Enterprise ($200)
- 1 lifetime deal ($99 one-time)
- Revenue ≈ $800-1000 MRR

---

## 📉 Churn 预测与应对

**Churn Kickers** (流失原因):
1. Uses all 100 calls in first week → no more value
2. No onboarding → never knew how to use
3. No results → health check too simple

**Mitigation**:
- Email sequence (Day 0-7) → increase activation
- Pro tips (Day 1) → show advanced use cases
- At-risk detection (14d inactive) → re-engagement with free calls
- Annual plan (lifetime deal alternative) → reduce churn

**Churn Rate** (SaaS benchmark):
- Good: < 5% monthly
- Acceptable: 5-7%
- Bad: > 10%

Track with:
```js
// Monthly churn = (expired licenses - new licenses) / total at month start
const expired = await kv.keys('expired:*', { gt: startOfMonth });
const newThisMonth = await kv.keys('created:*', { between: [startOfMonth, now] });
const churnRate = (expired - newThisMonth) / totalAtMonthStart;
```

---

## 🔄 持续优化循环

**每周**:
- Review A/B test results
- Check top exit pages (bounce rate)
- Analyze support tickets (common questions)

**每月**:
- Calculate LTV:CAC ratio
- Review pricing vs comp
- Plan next experiment (price, packaging, funnel)

**每季度**:
- Customer interviews (qualitative)
- Competitive pricing audit
- Price increase evaluation (if LTV > 3× CAC, raise price)

---

## 🚨 常见定价陷阱

1. **过低定价**: 初期吸引 wrong customers (price-sensitive, high churn)
2. **不涨价**: Existing users expect old price, can't raise → eventual shrink
3. **No annual**: Monthly-only leaves money on table (LTV lower)
4. **Free tier too generous**: cannibalizes paid
5. **No enterprise**: leaves high-value customers unserved

---

## 📋 实施检查清单

**Pre-launch**:
- [ ] Set up GA4 + events tracking
- [ ] Implement split testing logic (or Google Optimize)
- [ ] Create Looker Studio dashboard
- [ ] Define success metrics (CVR, Rev/Vis, LTV)
- [ ] Build weekly report script

**Week 1**:
- [ ] Launch Phase 1: Starter price test ($9.9 vs $19.9 vs $29.9)
- [ ] Ensure 100+ visitors per variant
- [ ] Monitor daily, wait for significance

**Week 3**:
- [ ] Launch Phase 2: Pro plan positioning test
- [ ] Analyze Phase 1 results → pick winner

**Week 5**:
- [ ] Launch Phase 3: Trial vs direct purchase
- [ ] Optimize funnel based on data

---

**学习完成**: 掌握定价心理学 + A/B 测试全流程  
**应用时机**: 一旦 Reddit 推广启动 → 同时运行 price test
