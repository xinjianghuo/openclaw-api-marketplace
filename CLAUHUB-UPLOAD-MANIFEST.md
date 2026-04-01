# ⚠️ CLAWHUB UPLOAD - DEPRECATED

**Status**: DEPRECATED (2026-04-01)
**Reason**: No API automation support – requires manual web upload
**Decision**: Marked as deprecated by user order (2026-04-01 10:55)

---

## ❌ Why ClawHub is Deprecated

| Issue | Impact |
|-------|--------|
| No API for automated upload | Entirely manual process, cannot integrate into CI/CD |
| No CLI tool | No `clawhub publish` automation |
| Extra overhead | Packaging, screenshots, web form filling |
| Low ROI | 4 skills ready, but manual effort not justified |

---

## ✅ **Alternative Distribution Channels** (已配置)

| 平台 | 状态 | 包名 |
|------|------|------|
| **npm** | ✅ 已发布 | `openclaw-idea-validator`, `openclaw-opportunity-scanner`, `openclaw-node-connection-doctor`, `ocl-vercel-deploy` |
| **GitHub** | ✅ 已推送 | `xinjianghuo/openclaw-api-marketplace` |
| **Vercel** | ✅ 部署 | API Marketplace 产品本身 |

---

## 📦 **技能包当前状态**

所有 4 个技能已发布到 npm，可直接安装使用：

```bash
npm install -g openclaw-idea-validator
npm install -g openclaw-opportunity-scanner
npm install -g openclaw-node-connection-doctor
npm install -g ocl-vercel-deploy
```

---

## 🔄 **如果需要重新启用 ClawHub**

1. 手动访问 https://clawhub.ai/dashboard
2. 上传 `skills/*` 文件夹的 ZIP 包
3. 填写元数据（各技能有 `.clawhub/meta.json`）
4. 等待 24-48h 审核

**不推荐** – 自动化成本 > 收益

---

**Deprecated**: 2026-04-01
**By**: 用户指令 (无水乙醇)
**替代方案**: npm + GitHub 双发布