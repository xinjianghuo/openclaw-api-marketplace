# 📦 OpenClaw API Marketplace - 4小时产出

## ✅ 已完成的系统

**项目名称**: `openclaw-api-marketplace`  
**核心功能**: 将 OpenClaw 技能封装为付费 REST API，通过许可证密钥控制访问

**文件结构**:
```
api-marketplace/
├── package.json          # Node.js 依赖
├── vercel.json           # Vercel 部署配置
├── README.md             # 技术文档
├── deploy.[sh|bat]       # 部署脚本
├── api/
│   └── index.js          # 主路由 (验证+执行+webhook)
├── lib/
│   ├── license.js        # 许可证生成与验证 (JWT + KV)
│   └── skills/
│       └── node-doctor.js # Node Doctor 技能封装
├── test.js               # 本地测试脚本
└── gumroad-product-description.md  # Gumroad 商品文案
```

---

## 🎯 方案评估 (复盘)

### 匹配度: ⭐⭐⭐⭐⭐ (9/10)

| 维度 | 评分 | 说明 |
|------|------|------|
| 启动速度 | ⭐⭐⭐⭐⭐ | 2-4小时即可上线 |
| 被动程度 | ⭐⭐⭐⭐⭐ | 完全自动化，无需人工 |
| 收入潜力 | ⭐⭐⭐⭐ | $100-500/月 (首个技能) |
| 维护需求 | ⭐⭐⭐⭐⭐ | 仅需 occasional bug fix |
| 中国友好度 | ⭐⭐⭐⭐⭐ | 收 USDT，无银行依赖 |
| 扩展性 | ⭐⭐⭐⭐⭐ | 增加新技能 = 新产品 |

### 为什么这是最优选择

1. **技术栈完美匹配**: 我有 OpenClaw 技能和 Node.js 经验
2. **零成本**: Vercel 免费 + Gumroad 免费
3. **零客户沟通**: API 标准化，客户自用
4. **中国收款绕过**: 直接收 USDT (Gumroad crypto)
5. **边际成本为零**: 每多一用户，成本不增加
6. **快速验证**: 今天能启动，3天内可测试销售

---

## 📋 立即行动清单 (今天完成)

### 步骤 1: 环境准备 (30分钟)

1. **注册 Vercel** (vercel.com)
   - 用 GitHub 账号登录
   - 安装 Vercel CLI: `npm install -g vercel`
2. **注册 Gumroad** (gumroad.com)
   - 邮箱验证
   - 开启 "Accept cryptocurrency" (收 USDT)
3. **创建 USDT 钱包** (OKX)
   - 下载 OKX App，完成 KYC (1小时)
   - 获取 USDT TRC-20 充值地址

### 步骤 2: API 项目配置 (1小时)

```bash
# 进入项目目录
cd D:\OpenClaw\.openclaw\workspace\api-marketplace

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local:
#   JWT_SECRET=<生成随机32位hex>
#   GUMROUD_WEBHOOK_SECRET=<随机>
```

生成 JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤 3: 本地测试 (30分钟)

```bash
# 启动本地服务器
npm run dev
# 访问 http://localhost:3000/api/health

# 测试 API (需先有测试 key, 可跳过)
node test.js
```

### 步骤 4: 部署到 Vercel (10分钟)

```bash
vercel --prod
# 记录你的 URL, 如: https://openclaw-api.vercel.app
```

登录 Vercel Dashboard:
- 进入项目 → Settings → Environment Variables
- 添加 `GUMROUD_WEBHOOK_SECRET` (与 Gumroad webhook 一致)

### 步骤 5: Gumroad 商品配置 (30分钟)

1. **Create Product**:
   - Name: "Node Doctor API - 100 Calls"
   - Price: $9.9
   - Description: 粘贴 `gumroad-product-description.md` 内容
   - Category: Software

2. **Enable License Keys**:
   - Settings → License Keys → Enable
   - Format: Random, Length 16
   - Delivery: Automatic

3. **Configure Webhook**:
   - Settings → Webhooks → Add
   - URL: `https://your-app.vercel.app/api/webhook/gumroad`
   - Events: `purchase_completed`
   - Copy Secret → 粘贴到 Vercel env `GUMROUD_WEBHOOK_SECRET`
   - Save

4. **Enable Crypto Payments**:
   - Settings → Accept cryptocurrency ✅
   - 支持: BTC, ETH, USDT

5. **Publish** → 商品页发布成功

---

## 💰 收入预期

| 周次 | 付费用户 | MRR | 备注 |
|------|----------|-----|------|
| Week 1 | 0-2 | $0-20 | 测试期，只卖朋友 |
| Week 2 | 3-5 | $50 | Reddit 推广 |
| Week 3 | 8 | $80 | 口碑传播 |
| Week 4 | 12 | $120 | 稳定 |
| Month 2 | 20 | $200 | 增加技能 |
| Month 3 | 30 | $300 | 推出 Pro plan |

**关键假设**:
- 转化率: 访问 → 购买 0.5-1%
- 推广: Reddit r/openclaw, r/selfhosted, IndieHackers
- 定价: $9.9/100calls, $49/月 unlimited

---

## ⚠️ 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| Vercel 免费额度超 | 中 | 服务暂停 | 监控使用，超限升级 Pro $20/月 |
| API 滥用刷调用 | 中 | 成本增加 | 每个 key 限制并发，监控异常 |
| 技能有 bug | 低 | 退款 | 提供 90 天退款保证 |
| Gumroad 手续费 | 低 | 利润少5% | 定价已包含 |
| 无流量 | 中 | 零收入 | 主动 Reddit 推广，提供免费额度 |

---

## 🚀 增长策略

1. **第一周**: 小范围测试 (朋友/freebie)
2. **第二周**: Reddit 推广 (r/openclaw, r/selfhosted, r/selfhosted)
3. **第三周**: 根据反馈修复，推出 Pro plan
4. **第四周**: 增加第二个技能 (Security Audit API)
5. **Month 2**: 创建官网 (Carrd) 展示所有 API
6. **Month 3**: 考虑SEO内容站引流

---

## 📈 扩展路线

**Skill Pipeline**:
1. ✅ Node Doctor API (Week 1)
2. 🔄 Security Audit API (Week 2-3) - 改造成 API 版本
3. 🔄 ChurnBuster API (Week 4) - Stripe webhook 模拟
4. 🔄 GitHub Project Automator API (Month 2)
5. 🔄 Opportunity Scanner API (Month 3)

**收入叠加**: 每个技能独立定价，打包销售 "All Access" $99/月

---

## 🎯 今天完成目标

- [ ] Vercel 账号注册 + CLI 安装
- [ ] Gumroad 账号注册 + crypto 开启
- [ ] OKX KYC 完成 + USDT 地址获取
- [ ] 本地环境配置 `.env.local`
- [ ] 本地测试通过 (`npm run dev`)
- [ ] 部署到 Vercel (`vercel --prod`)
- [ ] Gumroad 商品创建 + webhook 配置
- **完成以上 → 明天即可开始测试销售**

---

**文件位置**: `D:\OpenClaw\.openclaw\workspace\api-marketplace\`

需要我继续帮你准备其他技能的 API 封装，还是先完成这个的部署？
