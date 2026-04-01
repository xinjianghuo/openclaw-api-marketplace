# OpenClaw 赚钱实战指南

> 真实记录用 OpenClaw 自动化工具赚钱的案例、技术方案和变现策略

**访问**: 即将上线 (Vercel 部署中)

---

## 📖 项目简介

这是一个关于 **用 OpenClaw 实现被动收入** 的实战指南博客。

内容包括:
- ✅ 真实案例研究 (我是如何月入 $500)
- ✅ 技术教程 (API 封装、 Gumroad 收款)
- ✅ 微 SaaS 点子 (5 个零成本方案)
- ✅ 收款攻略 (中国开发者 USDT 变现)
- ✅ 90 天行动计划

---

## 🚀 如何部署 (选择一种)

### 选项1: Vercel (推荐，无等待)

**优势**: 立即上线，无 GitHub 新号限制

```bash
cd openclaw-money-guide
vercel login
vercel --prod
```

详细步骤: [VERCEL-DEPLOY.md](VERCEL-DEPLOY.md)

---

### 选项2: GitHub Pages (需等新号3-7天)

如果你的 GitHub 账号已解除限制:

```bash
# Windows
.\deploy.bat

# 或手动:
git init
git add .
git commit -m "Initial"
git remote add origin https://github.com/YOUR_USERNAME/openclaw-money-guide.git
git push -u origin main
```

然后在仓库 Settings → Pages 启用。

---

## 💡 核心推荐

如果你时间有限，只读这三篇:

1. **[5 个零成本微 SaaS 点子](/openclaw-money-guide/2026/03/27/ideas/)** - 找方向
2. **[API Marketplace 完整搭建指南](/openclaw-money-guide/2026/03/27/api-tutorial/)** - 快速启动
3. **[Gumroad 收款完全攻略](/openclaw-money-guide/2026/03/27/gumroad-guide/)** - 避坑

---

## 🛠️ 技术栈

- **生成器**: Jekyll (GitHub Pages 原生支持)
- **主题**: Minima (简洁、快速)
- **托管**: GitHub Pages (免费)
- **CI/CD**: GitHub Actions (自动部署)
- **域名**: 可选自定义 (CNAME)

---

## 📝 如何添加新文章

1. Fork 本仓库
2. 在 `_posts/` 创建文件，命名: `YYYY-MM-DD-标题.md`
3.  Front Matter:

```yaml
---
title:  "文章标题"
date:   2026-03-27 12:00:00 +0800
categories: [分类]
tags: [标签1, 标签2]
description: "简短描述"
---
```

4. 写内容 (Markdown)
5. Push → 自动部署

---

## 💰 收入来源 (本站)

本站本身会带来:

- **Amazon Associates**: 推荐开发工具、硬件 (4-10% 佣金)
- **DigitalOcean/Vercel 推荐链接**: 新用户奖励 ($100)
- **自建产品引流**: 引导到 API Marketplace (收入主体)

预期:
- 6个月后: 月 1k 访问 → $20-50 联盟收入
- 主要收入来自产品转化

---

## 📄 许可证

内容采用 CC BY-NC 4.0 (可学习，不可商用)

代码片段采用 MIT License

---

## 🤝 支持

有问题? Issues → [创建 issue](https://github.com/yourusername/openclaw-money-guide/issues)

**想直接合作?** Email: your@email.com
