# 🚀 Vercel 快速部署指南

**目标**: 5 分钟将 `openclaw-money-guide` 站点上线

---

## 前提条件

- 已注册 [Vercel](https://vercel.com) (免费)
- 已安装 Vercel CLI (或使用网页版)

---

## 方法A: 使用 Vercel CLI (推荐)

### 1. 登录 Vercel

```bash
vercel login
# 按提示在浏览器确认
```

### 2. 部署

```bash
cd D:\OpenClaw\.openclaw\workspace\openclaw-money-guide
vercel --prod
```

首次运行会问几个问题，选择:
- **Set up and deploy?** → Y
- **Which scope?** → 你的账号
- **Link to existing project?** → N
- **Project name?** → `openclaw-money-guide` (或自定义)
- **In which directory is your code located?** → `.` (当前目录)
- **Want to modify these settings?** → N

等待 1-2 分钟，部署完成。

### 3. 获取网址

完成后 Vercel 会输出:
```
✅ Production: https://openclaw-money-guide.vercel.app
```

这个就是你的网站地址。

---

## 方法B: 通过 Vercel 网页 (如果 CLI 有问题)

1. 访问 [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → 选择你的 GitHub 仓库 (需先 push)
3. **Framework Preset** → 选择 "Jekyll"
4. **Build and Output Settings**:
   - Output Directory: `_site`
   - Build Command: `bundle exec jekyll build`
5. Environment Variables (可选):
   - `JEKYLL_ENV`: `production`
6. Deploy

---

## 部署后设置

### 1. 自定义域名 (可选)

Vercel Dashboard → Project → Settings → Domains:
- 添加你的域名 (如: `money.openclaw.ai`)
- 按指引配置 DNS (CNAME 或 A 记录)

### 2. 提交到搜索引擎

- **Google Search Console**: 添加 sitemap `https://your-site/sitemap.xml`
- **Bing Webmaster Tools**: 同样添加

### 3. 添加分析

Vercel 内置 Analytics (免费):
- Dashboard → Analytics → Enable
- 或者在 HTML 中加 Google Analytics 代码

---

## 更新内容

修改 `_posts/` 中的文章或添加新文章后:

```bash
git add .
git commit -m "Update content"
vercel --prod
```

或直接 `vercel --prod`，Vercel 会自动检测变化并重新部署。

---

## 故障排除

| 问题 | 解决方案 |
|------|----------|
| Ruby version mismatch | 确保 `.ruby-version` 是 `3.1` |
| Bundle install error | Vercel 会自动安装依赖，等待即可 |
| 404 on posts | 检查文件命名: `YYYY-MM-DD-title.md` |
| Styles not loading | 检查 `_config.yml` 的 `baseurl` 设置 |

---

## 文件说明

| 文件 | 作用 |
|------|------|
| `vercel.json` | Vercel 构建配置 |
| `_config.yml` | Jekyll 站点配置 |
| `Gemfile` | Ruby 依赖 |
| `.ruby-version` | Ruby 版本锁定 |
| `.github/workflows/pages.yml` | GitHub Actions (现在不用) |
| `deploy-vercel.bat` | Windows 一键部署脚本 |

---

## 立即行动

```powershell
cd D:\OpenClaw\.openclaw\workspace\openclaw-money-guide
.\deploy-vercel.bat
```

或手动:
```bash
vercel login
vercel --prod
```

**5分钟后你的网站就上线了！**
