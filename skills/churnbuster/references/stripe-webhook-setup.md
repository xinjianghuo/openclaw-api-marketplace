# Stripe Webhook 设置指南

## 概述

ChurnBuster 通过 Stripe webhook 实时检测支付失败事件。你需要配置 Stripe 将 `payment_intent.payment_failed` 事件发送到你的 ChurnBuster endpoint.

---

## 步骤

### 1. 获取 Webhook Endpoint URL

你的 ChurnBuster endpoint URL:
```
https://your-domain.com/webhooks/churnbuster
```

**本地测试**: 使用 ngrok 将本地端口暴露为公网 URL:
```bash
ngrok http 3000
# 输出类似: https://abc123.ngrok.io/webhooks/churnbuster
```

### 2. 在 Stripe Dashboard 添加 Webhook Endpoint

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com)
2. 左侧菜单 → Developers → Webhooks
3. 点击 "Add endpoint"
4. Endpoint URL: 填入你的 URL (如: `https://abc123.ngrok.io/webhooks/churnbuster`)
5. 选择事件:
   - `payment_intent.payment_failed`
   - (可选) `invoice.payment_failed`
6. 点击 "Add endpoint"
7. 复制 **Signing secret** (形如: `whsec_xxxx`)

### 3. 配置 ChurnBuster

```bash
# 设置 webhook secret
openclaw skill config churnbuster STRIPE_WEBHOOK_SECRET whsec_xxxx

# (可选) 设置监听端口
openclaw skill config churnbuster PORT 3000
```

### 4. 测试 Webhook

使用 Stripe CLI 发送测试事件:
```bash
# 安装 Stripe CLI (https://stripe.com/docs/stripe-cli)
stripe login

# 触发测试失败事件
stripe trigger payment_intent.payment_failed

# 查看 ChurnBuster 日志
openclaw skill logs churnbuster --tail
```

预期输出:
```
[Webhook] Received payment_intent.payment_failed event
[Webhook] Customer: cus_12345, Amount: $29.00
[Retry] Scheduled retry #1 at 2026-03-27T08:35:00Z
[Email] Recovery email queued for customer@example.com
```

---

## 生产环境部署

### 使用真实域名
- 购买域名并指向你的服务器
- 配置 HTTPS (Let's Encrypt 免费证书)
- endpoint URL: `https://yourdomain.com/webhooks/churnbuster`

### 高可用配置
```bash
# 使用 OpenClaw cron 确保服务常驻
openclaw cron add "@reboot" "openclaw skill run churnbuster --port 3000"
openclaw cron add "*/5 * * * *" "openclaw skill run churnbuster --health-check"
```

### 监控
```bash
# 查看仪表板
openclaw skill dashboard churnbuster

# 查看实时日志
openclaw skill logs churnbuster --tail

# 检查队列状态
openclaw skill run churnbuster --status
```

---

## 故障排除

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| Webhook 404 | endpoint 路径错误 | 确认 URL 为 `/webhooks/churnbuster` |
| 签名验证失败 | STRIPE_WEBHOOK_SECRET 不匹配 | 重新复制 Stripe signing secret |
| 无事件到达 | Stripe webhook 未配置或禁用 | 检查 Stripe Dashboard → Webhooks |
| 重试不工作 | 数据库未持久化 | 确保 `data/` 目录可写 |

---

**疑难问题?** 查看 `references/configuration.md` 或提交 GitHub Issue.
