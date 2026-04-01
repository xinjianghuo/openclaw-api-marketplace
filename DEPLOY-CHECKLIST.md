# 部署执行清单 (2026-03-31 06:35)

## 前置条件
- [ ] VERCEL_TOKEN 已获取（https://vercel.com/account/tokens）
- [ ] 确认项目目录：`D:\Program Files\openclaw\data\.openclaw\workspace\projects\api-marketplace`

## 步骤 1：设置 VERCEL_TOKEN（临时或永久）

**临时（当前会话）：**
```bash
set VERCEL_TOKEN=your_token_here
```

**永久（Windows 环境变量）：**
- 系统属性 → 高级 → 环境变量
- 添加用户变量：`VERCEL_TOKEN` = `your_token_here`

## 步骤 2：执行部署（生产环境）

```bash
cd "D:\Program Files\openclaw\data\.openclaw\workspace\projects\api-marketplace"
npx vercel --token %VERCEL_TOKEN% --prod
```

**注意：**
- 首次部署可能需要授权（会提示链接到 Vercel 账户）
- 部署完成后会返回 URL（如 `https://api-marketplace.vercel.app`）

## 步骤 3：设置 Vercel Dashboard 环境变量

登录 Vercel Dashboard → 选择项目 → Settings → Environment Variables：

| Key | Value | Environment |
|-----|-------|-------------|
| PAYPAL_CLIENT_ID | AaHszY2Kn2lF3FeUybv1ax5H7YLJ9kDe-_Djp14KrV95Aj6qhu0drL4hDEdgo5gLJ7KdzfRqGIzpJPuj | Production |
| PAYPAL_CLIENT_SECRET | EC6-TbKj2WfqpoTNYQv6HQoFbOin7d6QRnEMT5_e0rIXVWbPmU-xkiWmgZStwC-vSe2DAneSEF7S7gLq | Production |
| PAYPAL_SANDBOX | false | Production |
| JWT_SECRET | 613002256e8e8b9f7e6c6c89a154c6ed6ac4b338eb5451f79c37a9e255712a42 | Production |
| VERCEL_KV_REST_API_URL | https://model-clam-85882.upstash.io | Production |
| VERCEL_KV_REST_API_TOKEN | gQAAAAAAAU96AAIncDI0ZmYxYzFhNDg3ZWM0ZmIxYmE5YmFjMGY5NGNmNGJkNHAyODU4ODI | Production |
| PAYPAL_WEBHOOK_ID | （部署后注册） | Production |

**注意：** `VERCEL_KV_*` 已在 .env.local 配置，需同步到 Vercel Dashboard。

## 步骤 4：注册 PayPal Webhook（可选但推荐）

```bash
cd "D:\Program Files\openclaw\data\.openclaw\workspace\projects\api-marketplace"
set PAYPAL_WEBHOOK_URL=https://your-app.vercel.app/api/paypal/webhook
node scripts/register-paypal-webhook.js
```

获取 `PAYPAL_WEBHOOK_ID` → 填入 Vercel 环境变量。

## 步骤 5：测试购买流程

1. 访问部署 URL
2. 点击 "Buy Now with PayPal"
3. 完成支付（Sandbox 或真实）
4. 验证 license key 显示并可用

## 步骤 6：启动 Show HN 发布

测试通过后立即执行（48小时窗口）。

## 阻塞状态

- ⚠️ **待办**：获取 VERCEL_TOKEN（需用户操作）
- ⚠️ **依赖**：Vercel 环境变量同步
- ⚠️ **机会扫描**：Brave API 未配置 → 已使用 searxng-bangs 替代（待测试）

请提供 VERCEL_TOKEN，我将自动执行部署命令。