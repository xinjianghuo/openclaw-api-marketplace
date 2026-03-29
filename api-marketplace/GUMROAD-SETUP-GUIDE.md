# 🎯 Gumroad 配置指南 (手动步骤)

**前提**: 已在浏览器中登录 Gumroad (app.gumroad.com)

---

## 步骤 1: 创建新产品

1. 访问: https://app.gumroad.com/products/new
2. 填写字段:

| 字段 | 值 |
|------|-----|
| **Product name** | `Node Doctor API - 100 Calls` |
| **Price** | `$9.9` |
| **Category** | `Software` |
| **Description** | 复制下方完整内容 |

3. 滚动到描述框，粘贴:

```
🤖 What is Node Doctor API?

Node Doctor API is OpenClaw skill "Node Connection Doctor" as a REST API. Diagnose OpenClaw node connection issues automatically via HTTP request.

Features:
- ✅ Gateway status check
- ✅ Node configuration validation
- ✅ Network connectivity test
- ✅ Auto-generate fix suggestions

🚀 Why you need this:
- Automate operations: Integrate with monitoring systems
- Service value-add: Offer health checks to your OpenClaw clients
- Save time: 30s per diagnosis vs manual
- Zero maintenance: We host the API

📡 API Usage:
curl -X POST https://api-marketplace-ln1v0o44t-algea-foks-projects.vercel.app/api/run \
  -H "Content-Type: application/json" \
  -d '{"skill":"node-connection-doctor","input":{"verbose":true},"licenseKey":"OC-YOUR-KEY"}'

💰 Pricing Plans (for your info):
- Starter: $9.9 (100 calls, 90 days)
- Pro: $49/mo (unlimited + priority support)
- Enterprise: $99/mo (SLA + custom skills)

Payment Methods: Credit Card, Bitcoin, Ethereum, USDT

🛠️ Technical:
- Host: Vercel (global CDN)
- Uptime: 99.9%
- Latency: <200ms
- Privacy: No diagnostic data stored

❓ FAQ:
Q: Failed calls consume quota?
A: Only successful executions count.

Q: How to use license key?
A: Include in licenseKey field per request.

Q: Refunds?
A: 90-day refund if unused.

Support: xinjiang.huo@gmail.com
```

4. 暂时不要点击 "Publish"，先完成后续配置。

---

## 步骤 2: 启用 License Keys (关键) - 新界面

**重要**: Gumroad 新界面中，License Keys 在产品 **Content 页面** 配置，不是在 Settings。

1. 在产品管理页，点击 **Content** 标签或按钮
2. 进入内容编辑器 (可能是空白页面或已有内容)
3. 在页面中添加 **License Key 模块**:
   - 找 "+" 按钮、**Add module** 或 **Insert** 菜单
   - 搜索并选择 **"License key"**
   - 拖拽模块到页面合适位置
4. **配置模块** (点击模块展开设置):
   - ✅ **Enable license keys**
   - **Format**: `Random characters`
   - **Length**: `16`
   - **Delivery**: ✅ `Automatically deliver the license key to the customer`
5. **保存** 内容页面
6. (可选) 展开模块，复制 **product_id** (用于 API 验证，如 `SDGgCnivv6gTTHfVRfUBxQ==`)

---

## 步骤 3: 配置 Webhook

1. 仍在 Settings 区域，找到 **Webhooks**。
2. 点击 **Add webhook**。
3. 填写:
   - **URL**: `https://api-marketplace-ln1v0o44t-algea-foks-projects.vercel.app/api/webhook/gumroad`
   - **Events**: 勾选 `purchase_completed`
4. 会看到 **Secret** 字段，点击 "Generate" 或手动粘贴:
   ```
   d68816554d9ef606c6252054a9e7c99f58e6baf0aa077a68
   ```
5. 保存 webhook。

---

## 步骤 4: 启用加密货币收款 (USDT)

1. 在 Settings 中，找到 **Payments** 或 **Accept cryptocurrency**。
2. 打开开关: **Accept cryptocurrency** ✅
3. 可选: 勾选支持的币种 (至少包含 USDT)。

---

## 步骤 5: 发布商品

1. 返回编辑页面 (顶部 "Product" 标签)。
2. 点击 **Publish** 按钮 (右上角)。
3. 确认发布。

---

## 步骤 6: 验证

1. 访问你的商品公开页面 (Gumroad 会提供链接)。
2. 测试购买流程 (可以使用测试卡或真实小额支付)。
3. 购买成功后，检查:
   - 是否收到 license key (自动发到邮箱)?
   - API 调用是否工作?
4. 测试 API:

```bash
curl -X POST https://api-marketplace-ln1v0o44t-algea-foks-projects.vercel.app/api/run \
  -H "Content-Type: application/json" \
  -d '{"skill":"node-connection-doctor","input":{"verbose":false},"licenseKey":"OC-YOUR-KEY"}'
```

预期响应:
```json
{
  "success": true,
  "result": { "timestamp": "...", "healthScore": 95, ... },
  "remainingCalls": 99
}
```

---

## ✅ 完成!

如果所有步骤完成，API Marketplace 将开始自动产生收入。

如有问题，检查:
- Vercel Dashboard 中的环境变量 (JWT_SECRET)
- Gumroad webhook 日志 (Settings → Webhooks → 查看发送记录)
- API 健康检查: https://api-marketplace-ln1v0o44t-algea-foks-projects.vercel.app/api/health

祝大卖！🎉
