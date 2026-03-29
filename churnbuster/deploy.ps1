# ChurnBuster v1.0 - 自动化部署脚本 (PowerShell)
# 用法: 右键"以管理员身份运行" 或直接 .\deploy.ps1

param(
    [string]$ProjectDir = "D:\OpenClaw\.openclaw\workspace\churnbuster"
)

# 设置错误处理
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ChurnBuster v1.0 - 自动化部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未检测到 Node.js！请先安装 Node.js 18+ https://nodejs.org" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "📂 项目目录: $ProjectDir"
Set-Location $ProjectDir

# 1. 安装依赖
Write-Host ""
Write-Host "[1/5] 正在安装依赖..." -ForegroundColor Yellow
try {
    npm install --silent
    Write-Host "✅ 依赖安装完成" -ForegroundColor Green
} catch {
    Write-Host "❌ npm install 失败！请检查网络或代理设置" -ForegroundColor Red
    Write-Host "提示: 可以配置 npm 代理: npm config set proxy http://127.0.0.1:7890" -ForegroundColor Yellow
    pause
    exit 1
}

# 2. 运行测试
Write-Host ""
Write-Host "[2/5] 正在运行测试..." -ForegroundColor Yellow
try {
    node test.js
    if ($LASTEXITCODE -ne 0) { throw "Tests failed" }
    Write-Host "✅ 测试通过" -ForegroundColor Green
} catch {
    Write-Host "❌ 测试未通过！请检查代码" -ForegroundColor Red
    pause
    exit 1
}

# 3. 打包
Write-Host ""
Write-Host "[3/5] 正在打包可执行文件..." -ForegroundColor Yellow
try {
    node build.js
    if (!(Test-Path "dist\churnbuster.exe")) { throw "Build output missing" }
    $exeSize = [math]::Round((Get-Item "dist\churnbuster.exe").Length / 1MB, 2)
    Write-Host "✅ 打包完成 (大小: ${exeSize}MB)" -ForegroundColor Green
} catch {
    Write-Host "❌ 打包失败！" -ForegroundColor Red
    Write-Host "错误详情: $_" -ForegroundColor Yellow
    pause
    exit 1
}

# 4. 压缩
Write-Host ""
Write-Host "[4/5] 正在压缩发布包..." -ForegroundColor Yellow
try {
    $zipPath = "churnbuster-v1.0.0.zip"
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
    Compress-Archive -Path "dist\churnbuster.exe" -DestinationPath $zipPath
    $zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
    Write-Host "✅ 压缩包创建完成: $zipPath (${zipSize}MB)" -ForegroundColor Green
} catch {
    Write-Host "❌ 压缩失败！" -ForegroundColor Red
    pause
    exit 1
}

# 5. 生成部署清单
Write-Host ""
Write-Host "[5/5] 生成部署清单..." -ForegroundColor Yellow

$checklist = @"
========================================
  🎉 部署成功！接下来需要你手动操作：
========================================

1. 📤 上传发布包到网盘
   - 文件: churnbuster-v1.0.0.zip
   - 推荐平台: Google Drive / 百度网盘 / WeTransfer
   - 获取分享链接 (建议设置提取密码)

2. 🌐 发布销售页
   - 文件: SALES_PAGE_CN.html
   - 上传到:
     • GitHub Pages (免费) https://pages.github.com/
     • Vercel (拖拽部署) https://vercel.com
     • Netlify https://netlify.com
   - 或直接发送 HTML 给客户

3. 🔧 修改联系信息 (在 SALES_PAGE_CN.html 中)
   搜索替换以下内容:
   - support@example.com  -> 你的真实邮箱
   - your_wechat_id      -> 你的微信号
   - [你的网盘链接]      -> 实际的下载链接（上一步获取）

4. 💰 测试购买流程（重要！）
   - 自己扫码支付一次
   - 检查是否收到下载链接
   - 验证 churnbuster.exe 可正常运行
   - 如不需要，可在支付后申请退款测试

5. 📢 开始推广
   - 将销售页链接发给目标客户
   - 建议渠道: 朋友圈、Reddit、Telegram群、技术社区

========================================
   关键文件位置
========================================
   📁 项目目录: $ProjectDir
   📄 销售页: $ProjectDir\SALES_PAGE_CN.html
   📦 发布包: $ProjectDir\churnbuster-v1.0.0.zip
   🔧 可执行: $ProjectDir\dist\churnbuster.exe
   📖 用户文档: $ProjectDir\README.md
========================================
"@

Write-Host $checklist -ForegroundColor White

# 保存清单到文件
$checklist | Out-File -FilePath "DEPLOYMENT_COMPLETE.txt" -Encoding UTF8
Write-Host "📋 清单已保存到: DEPLOYMENT_COMPLETE.txt" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 下一步: 打开 SALES_PAGE_CN.html 预览销售页" -ForegroundColor Cyan
Write-Host "   然后按照上面步骤完成手动操作" -ForegroundColor Cyan
Write-Host ""

pause
