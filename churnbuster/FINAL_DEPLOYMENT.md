# 🎯 ChurnBuster - 最终部署清单

---

## ✅ 已完成

- [x] 源代码完整 (src/, data/, templates/)
- [x] 单元测试 (test.js)
- [x] 打包脚本 (build.js)
- [x] 用户文档 (README.md)
- [x] 中文销售页面 (SALES_PAGE_CN.html)
- [x] 收款码已集成 (payment/ 目录)
- [x] 部署指南 (DEPLOY_GUIDE.md)

---

## 📋 你的5分钟快速操作

### 1️⃣ 整理图片文件 (1分钟)
将真实的收款码图片替换 placeholder:

```cmd
cd D:\OpenClaw\.openclaw\workspace\churnbuster\payment
# 删除 placeholder 文件
del wechat-qr.jpg alipay-qr.jpg

# 复制真实的收款码图片
copy "D:\OpenClaw\State\media\inbound\53e4e64d-70ea-4a5c-8ac9-d8fe2f75ebda.jpg" wechat-qr.jpg
copy "D:\OpenClaw\State\media\inbound\5f7d7182-a6cb-495a-a11a-6cea5deb35cb.jpg" alipay-qr.jpg
```

### 2️⃣ 安装依赖 (2分钟)
```cmd
cd D:\OpenClaw\.openclaw\workspace\churnbuster
npm install
```

### 3️⃣ 运行测试 (30秒)
```cmd
node test.js
```
✅ 确保看到 10/10 tests passed

### 4️⃣ 打包 (1分钟)
```cmd
node build.js
```
输出: `dist/churnbuster.exe`

### 5️⃣ 压缩并上传 (1分钟)
```cmd
cd dist
powershell Compress-Archive -Path churnbuster.exe -DestinationPath churnbuster-v1.0.0.zip
```
上传 `churnbuster-v1.0.0.zip` 到 Google Drive / 百度网盘，获取分享链接

### 6️⃣ 发布销售页 (30秒)
双击 `SALES_PAGE_CN.html` 在浏览器中打开，检查收款码显示正常

上传 `SALES_PAGE_CN.html` 到:
- GitHub Pages (免费)
- 或 Vercel (拖拽部署)

### 7️⃣ 开始测试销售 (立即)
将销售页链接发给1-2个朋友，问："如果需要，你会买吗？"

---

## 🔧 需要修改的配置 (如果不同)

### 价格
在 `SALES_PAGE_CN.html` 中搜索所有 `¥140` 和 `$19.99`，批量修改为你想要的价格

### 联系方式
搜索替换:
- `support@example.com` → 你的真实邮箱
- `your_wechat_id` → 你的微信号
- `[你的网盘链接]` → 实际的下载链接 (后续填写)

### 退款政策
如需调整，搜索 "30天退款" 修改天数或条件

---

## 🧪 测试清单 (发布前必做)

- [ ] `churnbuster.exe` 能在干净Windows机器运行 (scan --dry-run)
- [ ] 销售页在手机和电脑都能正常显示
- [ ] 收款码图片清晰可见
- [ ] 邮箱地址正确，能收到邮件
- [ ] 网盘链接可下载，无密码或密码已知
- [ ] 价格、产品描述准确无误

---

## 💰 定价建议

| 价格 | 目标客户 | 预期销量 | 总收入 |
|------|----------|----------|--------|
| ¥99 | 价格敏感 | 20单/月 | ¥1,980 |
| ¥140 (推荐) | 均衡 | 10单/月 | ¥1,400 |
| ¥199 | 高端 | 5单/月 | ¥995 |
| $19.99 (¥140) | 国际化 | 20单/月 | $400 |

**建议**: 先从 ¥140 开始，根据转化率调整

---

## 📈 推广渠道 (按优先级)

1. **朋友圈** (你的个人网络) - 转化率最高
2. **红迪** (r/sideproject, r/freelance) - 潜在客户多
3. **Telegram/微信群** - 技术社区
4. **Twitter/X** - 标签 #Productivity #SaaS

---

## 🎯 成功后指标

- ✅ 第一周: 1-3单 (证明需求)
- ✅ 第一月: 10单 (¥1,400收入)
- ✅ 用户反馈: 至少3条改进建议
- ✅ 更新 v1.0.1: 1周内发布

---

## 📞 遇到问题？

| 问题 | 解决方案 |
|------|----------|
| npm install 失败 | 使用代理 `npm config set proxy http://127.0.0.1:7890` 或换镜像源 |
| pkg 打包报错 | 确保 package.json pkg 配置正确，Node.js版本 >= 18 |
| 销售页图片不显示 | 检查路径，确保 payment/*.jpg 存在 |
| 收款码无法识别 | 确保图片清晰，建议用原图 (不要截图) |

---

**所有材料已就绪，你可以开始了！🚀**

需要我协助任何环节，随时告诉我。
