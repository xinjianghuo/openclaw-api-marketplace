# 💰 ChurnBuster - ClawHub 主文档

**自动挽回 Stripe 支付失败 - 平均挽回 10% 流失收入**

---

## 🤔 你的业务是否面临这些问题?

- ❌ 每月有 5-15% 的订阅因支付失败而流失
- ❌ 手动跟进耗时,容易出错,跟进率低
- ❌ 现有工具太贵 ($79-99/月) 且功能过剩
- ❌ 不知道实际损失了多少收入

**ChurnBuster** 帮你:
- ✅ 实时检测 Stripe 支付失败
- ✅ 自动智能重试 (1h/6h/24h/3d)
- ✅ 发送一键更新邮件,客户 2 分钟内搞定
- ✅ 仪表板跟踪挽回率、挽回金额
- ✅ **平均在首周收回成本** (rescue 1-2 failed payments)

---

## 🚀 5 分钟快速上手

### 1️⃣ 安装
```bash
openclaw skill install churnbuster
```

### 2️⃣ 配置
```bash
# 设置 Stripe webhook secret (从 Stripe Dashboard 复制)
openclaw skill config churnbuster STRIPE_WEBHOOK_SECRET

# 设置 SendGrid API key (用于发送邮件)
openclaw skill config churnbuster SENDGRID_API_KEY

# 设置通知邮箱 (接收告警和报告)
openclaw skill config churnbuster NOTIFY_EMAIL
```

### 3️⃣ 启动
```bash
# 测试模式 (验证配置)
openclaw skill run churnbuster --test

# 生产模式 (启动 webhook listener)
openclaw skill run churnbuster --port 3000
```

### 4️⃣ 连接 Stripe
在 Stripe Dashboard → Developers → Webhooks:
- 添加 endpoint: `https://your-domain.com/webhooks/churnbuster` (或使用 ngrok 本地测试)
- 订阅事件: `payment_intent.payment_failed`
- 完成! 系统自动运行

---

## 📊 核心功能

| 功能 | 说明 | 价值 |
|------|------|------|
| 🔄 **智能重试** | 根据失败原因调整重试间隔 (1h/6h/24h/3d) | 最大化挽回 |
| 📧 **自动邮件** | 预建模板,含一键更新链接,品牌自定义 | 客户 2 分钟搞定 |
| 📈 **仪表板** | 挽回率、挽回收入、活跃重试、客户趋势 | 实时洞察 |
| 🛡️ **安全可靠** | Stripe 签名验证,数据本地加密存储 | 合规 |
| ⚡ **零服务器成本** | 运行在你现有的 OpenClaw 节点 | 免费基础设施 |

---

## 💰 定价与 ROI

| 计划 | 价格 | 包含 |
|------|------|------|
| **月度订阅** | $49/月 | 完整功能,无限挽回,邮件支持 |
| **年度订阅** | $499/年 | 省 2 个月,优先支持 |

**ROI 举例**:
- 挽回 1 笔 $100 失败订阅 = 覆盖 2 个月费用
- 挽回 2 笔 = 首周回本
- 持续每月挽回 $500+ = 10 倍 ROI

**免费试用**: 7 天 (无需信用卡)

---

## 🔧 技术细节

### 架构
- **Webhook监听**: OpenClaw 内置 server,监听 `/webhooks/churnbuster`
- **重试队列**: 本地 SQLite 存储,持久化,重启不丢
- **邮件引擎**: SendGrid API (可选 SMTP)
- **监控**: 内置 dashboard (`openclaw skill dashboard churnbuster`)

### 支持的支付失败原因
- insufficient_funds (余额不足) → 6h 重试
- expired_card (卡过期) → 24h 重试 + 邮件提醒
- incorrect_cvc (CVC错误) → 3d 重试 + 邮件
- lost_card (卡丢失) → 直接通知客户
- ... (共 15+ 种模式匹配)

### 邮件模板
模板位于 `templates/`:
- `email-recovery.html` - 支付失败,请求更新卡片
- `email-confirmation.html` - 成功更新后确认

可自定义品牌 (logo,颜色,链接).

---

## 📈 预期效果

| 指标 | 目标 |
|------|------|
| 支付失败挽回率 | 15-25% |
| 平均挽回金额 | $50-100/次 |
| 月度挽回总额 (10客户) | $500-2,000 |
| 客户留存提升 | +2-5% |
| 设置时间 | <5 分钟 |

---

## 🎯 目标客户

- **SaaS 订阅服务** (月费 $29-299)
- **数字创作者** (Patreon,会员制)
- **电商订阅盒** (按月订购)
- **小型企业服务** ( billed recurring)

**最适合**: 每月有 50+ 次支付失败的 Stripe 用户.

---

## 🔄 与 OpenClaw 的集成

- 完全本地运行,无第三方依赖 (除 Stripe/SendGrid)
- 使用 OpenClaw secrets 管理敏感配置
- 可通过 `openclaw skill dashboard` 查看报告
- 支持 cron 自动重启 (确保高可用)

---

## 📞 支持

- **文档**: `references/configuration.md`, `references/stripe-webhook-setup.md`
- **GitHub Issues**: https://github.com/your-username/churnbuster/issues
- **Email**: support@yourdomain.com

---

## 🏷️ 标签

`stripe` `payments` `churn` `revenue` `automation` `saas`

---

*Skill ID: churnbuster*  
*Version: 1.0.0*  
*Maintainer: JARVIS (@yourusername)*  
*License: MIT*  
*Price: $49/月 或 $499/年*
