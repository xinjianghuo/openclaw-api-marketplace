# SendGrid 集成指南

## 概述

ChurnBuster 使用 SendGrid 发送恢复邮件和确认邮件。你需要提供 SendGrid API key 才能发送邮件。

---

## 步骤

### 1. 获取 SendGrid API Key

1. 注册/登录 [SendGrid](https://sendgrid.com)
2. 左侧菜单 → Settings → API Keys
3. 点击 "Create API Key"
4. Name: `ChurnBuster`
5. 权限: **Mail Send** (最小权限)
6. 点击 "Create & View"
7. **复制 API Key** (形如: `SG.xxxxx`)

### 2. 验证发件域名 (推荐)

为了确保邮件不进垃圾箱:

1. SendGrid → Settings → Sender Authentication
2. 选择 "Domain Authentication"
3. 按照 DNS 记录指引添加你的域名
4. 验证成功后,发件人地址可以使用你的域名 (如: `billing@yourdomain.com`)

**如未验证域名**: 可使用 SendGrid 默认域名,但邮件可能标记为 "via sendgrid.net"

### 3. 配置 ChurnBuster

```bash
# 设置 SendGrid API key
openclaw skill config churnbuster SENDGRID_API_KEY SG.xxxxx

# 设置发件人邮箱 (必须是已验证的 SendGrid sender)
openclaw skill config churnbuster FROM_EMAIL billing@yourdomain.com

# 设置通知邮箱 (接收系统告警)
openclaw skill config churnbuster NOTIFY_EMAIL admin@yourdomain.com
```

### 4. 测试邮件发送

```bash
# 测试模式验证配置
openclaw skill run churnbuster --test

# 发送测试邮件
openclaw skill run churnbuster --send-test-email --to customer@example.com
```

预期输出:
```
[Email] Test email sent to customer@example.com
[Email] Message ID: abc123def456
```

---

## 邮件模板

ChurnBuster 使用 HTML 模板位于 `templates/`:

- `email-recovery.html` - 支付失败,请求更新卡片 (含个性化变量)
- `email-confirmation.html` - 支付成功,确认订阅恢复

### 模板变量

在模板中可以使用以下 Mustache-style 变量:

| 变量 | 来源 | 说明 |
|------|------|------|
| `{{customer_name}}` | Stripe customer.name | 客户姓名 |
| `{{customer_email}}` | Stripe customer.email | 客户邮箱 |
| `{{update_link}}` | ChurnBuster 生成 | 一键更新支付链接 |
| `{{amount}}` | Stripe payment_intent.amount | 失败金额 |
| `{{next_billing_date}}` | Stripe subscription | 下次扣款日期 |
| `{{company_name}}` | ChurnBuster config | 你的公司名 |

**修改模板**:
编辑 `templates/email-recovery.html` 后重启 ChurnBuster:
```bash
openclaw skill run churnbuster --port 3000 --reload-templates
```

---

## 不使用 SendGrid? (可选)

如果你已有 SMTP 服务器,可以修改 `scripts/webhook.js` 使用 Nodemailer:

```javascript
// 在 webhook.js 中替换 sendEmail 函数
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html
  });
}
```

然后配置:
```bash
openclaw skill config churnbuster SMTP_HOST smtp.gmail.com
openclaw skill config churnbuster SMTP_USER your-email@gmail.com
openclaw skill config churnbuster SMTP_PASS your-password
```

---

## 监控与统计

```bash
# 查看邮件发送统计
openclaw skill dashboard churnbuster

# 查看邮件日志
openclaw skill logs churnbuster --filter "Email" --tail

# 查看失败队列
openclaw skill run churnbuster --retry-failed-emails
```

---

## 最佳实践

1. **使用自定义域名**: 提高邮件送达率 (30%+)
2. **A/B 测试模板**: 调整文案提升点击率
3. **设置发送速率限制**: 避免被标记为 spam
4. **监控退回率**: 持续优化邮件内容
5. **提供多种联系渠道**: 邮件 + 电话 + 在线客服

---

**问题?** 查看 `references/configuration.md` 或提交 GitHub Issue.
