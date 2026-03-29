# Gumroad 商品: Node Doctor API - 100 Calls

## 商品标题

**Node Doctor API - 100 Automated Diagnosis Calls**  
*Automatically diagnose OpenClaw node connection issues via REST API*

---

## 简短描述

OpenClaw 节点连接问题自动诊断 API，100 次调用额度。无需人工干预，2 秒返回健康报告。适合集成到你的监控系统或作为服务增值。

---

## 详细描述

### 🤖 什么是 Node Doctor API?

Node Doctor API 是 OpenClaw 技能 **Node Connection Doctor** 的 REST API 版本。你可以通过 HTTP 请求自动诊断任何 OpenClaw 节点的连接状态，包括：

- ✅ 网关状态检查
- ✅ 节点配置验证
- ✅ 网络连通性测试
- ✅ 自动生成修复建议

### 🚀 为什么你需要这个?

- **自动化运维**: 集成到监控系统，故障自动检测
- **服务增值**: 给你的 OpenClaw 客户提供健康检查
- **节省时间**: 每次诊断 30秒，代替人工
- **零维护**: 我们托管 API，你无需服务器

---

## 📡 API 使用示例

```bash
curl -X POST https://api.openclaw-marketplace.com/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "node-connection-doctor",
    "input": { "verbose": true },
    "licenseKey": "OC-YOUR-KEY-HERE"
  }'
```

**响应**:
```json
{
  "success": true,
  "result": {
    "timestamp": "2026-03-27T08:30:00Z",
    "healthScore": 95,
    "summary": "Healthy",
    "steps": [
      { "name": "Gateway Status", "ok": true, "output": "..." },
      { "name": "Node Config", "ok": true, "output": "..." },
      { "name": "Network", "ok": true, "output": "..." }
    ]
  },
  "remainingCalls": 99
}
```

---

## 💰 定价

| 计划 | 价格 | 包含 |
|------|------|------|
| **Starter** | $9.9 | 100 次调用 (90天有效) |
| **Pro** | $49/月 | 无限次调用 + 优先支持 |
| **Enterprise** | $99/月 | SLA保证 + 自定义技能 |

**接受支付**: 信用卡、Bitcoin、Ethereum、USDT

---

## 🛠️ 技术细节

- **Host**: Vercel (全球 CDN)
- **Uptime**: 99.9%
- Latency: < 200ms (global average)
- **Rate limit**: 无 (按许可证额度)
- **Data privacy**: 诊断结果不存储，仅计数

---

## ❓ FAQ

**Q: 调用失败会扣次数吗？**  
A: 仅成功执行才扣次数。API 错误（认证失败、参数错误）不扣。

**Q: 许可证 key 如何使用？**  
A: 购买后自动发送到邮箱。每次 API 调用需在 `licenseKey` 字段提供。

**Q: 可以退款吗？**  
A: 90天内未使用可全额退款。

**Q: 支持其他技能吗？**  
A: 目前只有 node-connection-doctor。未来会添加 Security Audit、ChurnBuster 等。

**Q: 如何监控剩余调用次数？**  
A: 每次响应会返回 `remainingCalls`。即将用完时，建议购买 Pro 计划。

---

## 📞 支持

有问题? 邮件: xinjiang.huo@gmail.com  
响应时间: 24小时内

---

*Made with ❤️ by JARVIS*
