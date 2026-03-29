---
title:  "Gumroad 收款完全攻略 (中国开发者版)"
date:   2026-03-27 18:00:00 +0800
categories: [教程]
tags: [Gumroad, 收款, USDT]
description: "针对中国开发者的 Gumroad 收款全流程: 绕过银行限制，用 USDT 安全变现"
---

## 为什么需要这篇

- ❌ Payoneer 已关闭中国注册
- ❌ Wise 不支持中国身份证
- ❌ PayPal 提现到国内卡费高 ($35/笔)
- ✅ Gumroad + USDT = 完美绕过

---

## 方案总览

```
客户付款 (信用卡/BTC/ETH/USDT)
    ↓
Gumroad 处理 (收 USD 或 crypto)
    ↓
每周二打款到你的账户:
  - 银行账户 (美元) → 需要境外账户 (不推荐)
  - PayPal → 提现困难
  - **直接收 USDT (推荐)** → OKX 交易所 → 卖出 → 人民币
```

---

## 第一步: 注册交易所 (收 USDT)

**推荐**: OKX (okx.com)

理由:
- 支持中文界面
- 人民币充值/提现方便
- 低手续费
- KYC 快 (1-24小时)

**步骤**:

1. 下载 OKX App
2. 注册 (邮箱/手机)
3. 完成 L1 认证:
   - 上传身份证
   - 人脸识别
4. 获取 USDT 充值地址:
   - 资产 → 充值 → 选择 USDT
   - 网络: **TRC-20** (手续费 $1)
   - 复制地址 (保存好)

---

## 第二步: 注册 Gumroad

1. 访问 gumroad.com
2. Sign up (邮箱)
3. 验证邮箱
4. Settings → Accept cryptocurrency ✅
   - 支持: BTC, ETH, USDC, USDT
5. 填写 payout 信息:
   - 这条可以不填 (因为我们不走银行)
   - 或者填任意 PayPal 作为备用

---

## 第三步: 创建商品

1. Create Product
2. 填写:
   - Name: "Your Product"
   - Price: $9-199
   - Description: 详细说明
   - Category: Software
3. **开启 License Keys** (如果需要)
4. **开启 Accept cryptocurrency** ✅
5. Publish

---

## 第四步: 收到 USDT 后的流程

### 情景: 客户用 USDT 付款

1. Gumroad 收到 USDT (自动)
2. Gumroad 按当时汇率转成 USD 记账
3. 每周二 Gumroad 会将等值的 USD 打到你的... 银行账户?

**等等!** 这里有个坑:

Gumroad 只能付美元到银行/PayPal。如果你没有美国银行账户，你需要:

**方案A (推荐)**: 用 **Coinbase Commerce** 替代 Gumroad 的 crypto 支付

- 客户直接打 USDT 到你的 Coinbase Commerce 地址
- 你在 Coinbase 提现到 OKX
- 100% 控制，无中间账户

**方案B**: 让 Gumroad 付美元到 Payoneer (你注册不了) 或 Wise (你注册不了) → 行不通

**结论**: 用 **Gumroad 卖商品 + Coinbase Commerce 收款** (两者独立)

---

## 第五步: Coinbase Commerce 设置 (替代方案)

1. 访问 commerce.coinbase.com
2. Sign up (需 KYC，同 OKX)
3. 创建 API key
4. 在你的网站/商品页嵌入 Coinbase 支付按钮
5. 客户付 USDT → 直接到你的 Coinbase 钱包
6. 提现到 OKX → 卖出 → 人民币

**费用**:
- Coinbase Commerce: 免费
- 链上转账 (TRC-20): ~$1
- OKX 提现: 免费

---

## 完整收款流程图 (最优)

```
客户选择产品 → Gumroad 下单 (信用卡) → Gumroad  weekly payout → Payoneer (需要) → 银行卡
客户选择产品 → Coinbase Commerce (USDT) → 你的 Coinbase 钱包 → OKX → 卖出 → 银行卡 ✅
```

**推荐组合**:
- **Gumroad**: 处理信用卡客户 (自动发货)
- **Coinbase Commerce**: 处理 crypto 客户 (手动发货，但省手续费)

---

## 第六步: 税务与合规

**中国个人所得税**:
- 海外收入需申报
- 每年有 6万人民币免税额度
- 小额 (<6万) 可能不需缴税，但需备案

**建议**:
- 保留 Gumroad/Coinbase 交易记录
- 年度汇算清缴时主动申报
- 咨询本地税务师

---

## 常见问题

**Q: 客户能用支付宝/微信吗?**  
A: 不能。Gumroad 只支持国际支付。你可以单独提供支付宝收款码，但需手动发货，适合小规模。

**Q: USDT 价格波动怎么办?**  
A: USDT 锚定美元，波动很小。收到后尽快从 Coinbase 提到 OKX 卖出即可。

**Q: 大额收款 (> $10,000) 有风险吗?**  
A: 单笔金额不要太大 ($5000 以内)，避免触发交易所风控。分多次提现。

**Q: 需要企业账户吗?**  
A: 个人即可。交易所和个人钱包都支持个人卖家。

---

## 我的推荐配置

| 平台 | 用途 | 费用 |
|------|------|------|
| Gumroad | 商品展示 + 信用卡支付 + 自动发货 | 5% |
| Coinbase Commerce | USDT 直接收款 | 0% |
| OKX | 交易所 (USDT→CNY) | 0.1% + 免费提现 |
| GitHub Pages | 产品官网 | 免费 |

**总费率**: ~5.1% (相比国内平台 0.6% 略高，但能接国际客户)

---

## 总结

中国开发者变现路径:
1. 用 **Gumroad** 卖数字产品
2. 同时开启 **Coinbase Commerce** 收 USDT
3. 提现到 **OKX** 换成人民币
4. 完税备案 (如有需要)

全程零成本，24小时到账。

---

**有问题?** 我提供了详细操作指南。开始注册吧！
