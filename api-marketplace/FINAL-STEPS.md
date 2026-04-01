# 🚀 API Marketplace - 最终配置步骤

## ✅ 已准备

- API 部署: https://api-marketplace-ln1v0o44t-algea-foks-projects.vercel.app
- 健康检查: ✅ 通过
- Product ID: `6F0E4C97-B72A4E69-A11BF6C4-AF6517E7`
- API Token: `xZ17v1PyQpQDBwkIm3OmPA==`
- Webhook Secret: `d68816554d9ef606c6252054a9e7c99f58e6baf0aa077a68`
- PayPal: `algea@163.com`

---

## 🔧 最后3步 (手动或自动)

### **方法A: 运行 API 自动化脚本 (5分钟)**

1. **打开命令提示符** (cmd 或 PowerShell)
2. 进入目录:
   ```cmd
   cd D:\OpenClaw\.openclaw\workspace\api-marketplace
   ```
3. **安装依赖** (如果未安装):
   ```cmd
   npm install axios
   ```
4. **运行配置脚本**:
   ```cmd
   node gumroad-api-config.js
   ```
5. 脚本会自动:
   - ✅ 启用 License Keys (Random 16 chars, Auto-deliver)
   - ✅ 配置 Webhook
   - ✅ 发布产品

**预期输出**:
```
🚀 Configuring Gumroad product via API...
1. Fetching product...
2. Enabling License Keys...
   ✅ License Keys enabled
3. Configuring Webhook...
   ✅ Webhook created
4. Publishing product...
   ✅ Product published successfully!
🎉 Configuration complete!
```

---

### **方法B: 如果脚本失败，手动配置 (备用)**

#### **B1. 启用 License Keys (通过 Gumroad Dashboard)**
1. 进入产品编辑页: https://app.gumroad.com/products/6F0E4C97-B72A4E69-A11BF6C4-AF6517E7/edit
2. 找到 **Settings** → 向下滚动到 **"License keys"**
3. 打开开关 ✅
4. 设置:
   - Format: `Random characters`
   - Length: `16`
   - Delivery: `Automatically` ✅
5. 保存

#### **B2. 配置 Webhook**
1. Settings → Webhooks → Add webhook
2. URL: `https://api-marketplace-ln1v0o44t-algea-foks-projects.vercel.app/api/webhook/gumroad`
3. Secret: `d68816554d9ef606c6252054a9e7c99f58e6baf0aa077a68`
4. Event: `purchase_completed`
5. Save

#### **B3. 发布产品**
- 返回主编辑页 → Publish

---

## 📝 关键提醒

- **PayPal 账号**: `algea@163.com` (已记录)
- **支持邮箱**: `xinjiang.huo@gmail.com` (已更新)
- **KYC**: 确保已上传身份证+地址证明 (否则无法收款)
- **测试**: 发布后，用测试订单验证 API 调用

---

## 🎯 完成后

回复"完成"，我将:
1. 更新 MEMORY.md 记录状态
2. 准备 Reddit 推广计划
3. 设置 Opportunity Scanner 每日自动运行

---

**现在就运行脚本或手动配置，5分钟搞定！**
