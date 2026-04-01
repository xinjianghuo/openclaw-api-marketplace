# 💰 ChurnBuster - ClawHub 发布包

**Skill ID**: `churnbuster`  
**Version**: 1.0.0  
**Price**: $49/月 (年付 $499，省2个月)  
**Category**: Finance & Revenue

---

## 📦 提交内容

### 1. 技能清单
```
churnbuster/
├── SKILL.md                    # 技能文档
├── scripts/
│   ├── run.js                 # 主运行脚本 (webhook listener)
│   └── webhook.js             # Stripe webhook 处理器
├── templates/
│   ├── email-recovery.html    # 支付失败恢复邮件模板
│   └── email-confirmation.html # 付款成功确认模板
├── references/
│   ├── configuration.md       # 配置指南
│   ├── stripe-webhook-setup.md # Stripe webhook 设置
│   └── sendgrid-integration.md # SendGrid 集成 (可选)
├── screenshots/
│   ├── dashboard.png          # 仪表板截图
│   └── recovery-email.png     # 恢复邮件示例
└── README-ClawHub.md          # ClawHub 主文档
```

### 2. 核心功能说明

**自动挽回流失收入**:
- 实时监听 Stripe payment_intent.payment_failed webhook
- 智能重试引擎: 1h, 6h, 24h, 3d (根据失败原因调整)
- 自动发送客户邮件,含一键更新支付链接
- 仪表板显示: 挽回率、挽回收入、客户趋势

**技术优势**:
- 纯 OpenClaw 原生运行,无额外服务器成本
- 5分钟配置完成
- 数据本地存储,加密安全
- 支持 Sentry/SendGrid 集成 (可选)

### 3. 技术栈
- OpenClaw SDK (webhook listener, node.exec)
- Node.js 18+
- Stripe webhook signature verification
- 可选: SendGrid API (邮件发送)

### 4. 兼容性
- OpenClaw v2026.3.23+
- 需要外部 Stripe 账户 (test/live)
- 支持任意 OS (Linux/Windows/macOS)

### 5. 支持
- Issues: https://github.com/your-username/churnbuster/issues
- Docs: `references/` 目录

---

## 🎯 提交步骤 (用户操作)

1. **注册 ClawHub Seller**
   - 访问 https://clawhub.com/signup
   - 选择 "Skill Seller"
   - 验证邮箱，设置 Stripe/PayPal 收款

2. **上传 Skill 包**
   - 点击 "Create New Skill"
   - 填写:
     - Name: ChurnBuster
     - Description: 自动挽回 Stripe 支付失败,智能重试+客户邮件
     - Price: $49/month 或 $499/year
     - Category: Finance & Revenue
   - Upload ZIP (我会打包)
   - Submit for review (通常 24-48 小时)

3. **发布后推广**
   - 在 r/SaaS, r/Stripe, r/Entrepreneur 发帖
   - 在 Indie Hackers / Micro-SaaS 社区分享
   - 提供 7 天免费试用,收集案例
   - 快速迭代 (根据反馈 v1.1 在 2 周内)

---

## 📈 预期指标

- **首周**: 5-10 试用安装
- **首月**: 10-15 付费订阅 → $490-735 MRR (或 $4,990 年付)
- **3个月**: 25+ 付费订阅 → $1,200+/月 MRR

**ROI 角度推广语**: "Recover 1-2 failed payments and it pays for itself in the first week."

---

## ⚙️ 安装与配置要点

用户在购买后需要:
1. Stripe 账户 (test mode 即可试用)
2. 复制 webhook secret 到 `openclaw skill config churnbuster`
3. 设置 SendGrid API key (或使用默认 SMTP)
4. 启动: `openclaw skill run churnbuster --port 3000`
5. 在 Stripe dashboard 添加 webhook endpoint: `https://your-domain.com/webhooks/churnbuster`

---

**准备状态**: 🟢 待打包 (scripts/run.js + webhook.js + templates + references 完整)

请注册 ClawHub Seller 后回复,我会立即打包提交。
