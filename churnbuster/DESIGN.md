# ChurnBuster v1.0 - 开发日志

## 🎯 项目目标
**独立可执行CLI工具** - 检测并帮助取消自动续费订阅

**交付形式**：单文件 `churnbuster.exe` (Windows) 或 `churnbuster` (跨平台)
**价格点**：$19.99 一次性购买

---

## 📐 架构设计

```
churnbuster/
├── src/
│   ├── index.js              # CLI入口 (commander)
│   ├── detector.js           # 订阅检测引擎
│   ├── guide-generator.js    # 取消步骤生成器
│   ├── reporter.js           # HTML报告生成
│   └── config.js             # 配置管理
├── data/
│   ├── services.json         # 已知SaaS服务数据库
│   └── cancellation-guides.json # 详细取消指南
├── templates/
│   └── report.html           # 报告模板
├── package.json
├── build.js                  # pkg打包脚本
├── README.md
├── USER_GUIDE.md
└── CHANGELOG.md
```

---

## 🔍 检测策略

### 扫描目标
1. **配置文件** (常见路径)
   - `~/.config/**/*.json` (Linux/Mac)
   - `%APPDATA%/**/*.json` (Windows)
   - `~/.aws/**/*.config` (AWS)
   - `~/.npmrc`, `~/.yarnrc` (包管理)
   - `~/.ssh/config` (可能包含服务URL)

2. **环境变量** (通过进程和shell历史)
   - `STRIPE_*`, `PAYPAL_*`, `AWS_*`, `DIGITALOCEAN_*`
   - `SHOPIFY_*`, `STRIPE_API_KEY`, `TWILIO_*`

3. **浏览器历史** (可选,需用户授权)
   - 访问过 billing.*, payment.*, subscription.* 域名
   - 使用浏览器历史库 (无需解密)

4. **本地应用数据**
   - Spotify, Netflix, Adobe 等本地存储
   - Electron apps config

### 已知服务数据库 (services.json)
```json
{
  "services": [
    {
      "id": "netflix",
      "name": "Netflix",
      "detect": {
        "files": ["**/Netflix/**/*.json"],
        "urls": ["netflix.com"],
        "env_vars": []
      },
      "cancel_guide": "netflix-cancel.md"
    }
  ]
}
```

---

## 🛠️ 技术栈

- **Node.js** (目标: v18+ 兼容)
- **commander** (CLI框架)
- **chalk** (彩色输出)
- **conf** (配置存储)
- **pkg** (打包成exe)
- **ejs** (HTML模板)

**打包目标**：
- 单文件分发 (无node_modules依赖)
- 大小 < 50MB
- 启动快 (<2s)

---

## 📋 开发步骤

### Step 1: 基础框架 (13:30-14:30) - 2h
- [x] package.json
- [x] CLI参数解析 (--scan, --report, --list)
- [x] 配置文件加载/保存
- [x] 日志系统

### Step 2: 检测引擎 (14:30-16:00) - 1.5h
- [ ] 文件系统扫描 (glob)
- [ ] 环境变量读取
- [ ] 浏览器历史解析 (Chrome/Edge)
- [ ] 结果去重 + 置信度评分

### Step 3: 指南生成 (16:00-17:00) - 1h
- [ ] 服务数据库初始化 (30+常见服务)
- [ ] 动态生成HTML取消步骤
- [ ] PDF导出选项 (可选)

### Step 4: 打包测试 (17:00-17:30) - 0.5h
- [ ] pkg配置
- [ ] Windows exe生成
- [ ] 自测试 (在干净Windows VM)

### Step 5: 文档 (17:30-18:00) - 0.5h
- [ ] README.md
- [ ] 用户指南
- [ ] 营销文案草稿

---

## 💾 数据隐私承诺

- 所有扫描**本地执行**，无数据上传
- 可审计代码 (开源可选)
- 用户控制：--dry-run模式, --exclude路径

---

## 🎁 增值功能 (v2.0)

- 自动取消 (直接调用API, 风险高, 暂不实现)
- 订阅费用追踪 (从账单邮件解析)
- 提醒机制 (每月自动运行)
- 团队版 (集中管理多设备)

---

## 📈 盈利模型

- **v1.0**: $19.99 一次性
- **v2.0**: $9.99/月 (高级功能)
- **v3.0**: 企业版 $99/月 (多设备管理)

---

**Status**: 🏁 STARTING NOW
**Target Completion**: 2026-03-27 18:00 (5h)
**Current Phase**: Phase 1 - 初始化
