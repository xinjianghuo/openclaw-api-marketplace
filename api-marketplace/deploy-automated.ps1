Write-Host "🤖 API Marketplace 自动化部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Gray

# 1. 生成随机 JWT_SECRET
$jwtSecret = [System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
Write-Host "`n1. 生成 JWT_SECRET: $jwtSecret" -ForegroundColor Green

# 2. 添加环境变量
Write-Host "`n2. 设置 Vercel 环境变量..." -ForegroundColor Yellow
try {
    vercel env add JWT_SECRET production $jwtSecret | Out-Null
    Write-Host "   ✅ JWT_SECRET set" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  JWT_SECRET may already exist" -ForegroundColor Yellow
}

# 3. 创建 KV 数据库（如果不存在）
Write-Host "`n3. 创建 Vercel KV 数据库..." -ForegroundColor Yellow
try {
    # 使用 vercel kv create 命令
    $kvOutput = vercel kv create api-marketplace-kv 2>&1
    Write-Host $kvOutput
    
    if ($kvOutput -match '@([^\s]+)') {
        $kvUrl = $matches[0]
        Write-Host "   ✅ KV 创建成功: $kvUrl" -ForegroundColor Green
        
        # 设置 KV_URL 环境变量
        vercel env add KV_URL production $kvUrl | Out-Null
        Write-Host "   ✅ KV_URL set" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  无法自动提取 KV URL，可能需要手动设置" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ KV 创建失败: $_" -ForegroundColor Red
    Write-Host "   请手动在 Vercel Dashboard 创建 KV 并设置 KV_URL" -ForegroundColor Yellow
}

# 4. 最终部署
Write-Host "`n4. 开始生产部署..." -ForegroundColor Cyan
Write-Host "   按提示操作（全部选 N/默认即可）..." -ForegroundColor Gray

vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🎉 部署成功！" -ForegroundColor Green
    Write-Host "`n你的 API 地址将在几分钟后生效。" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ 部署失败，请检查错误信息。" -ForegroundColor Red
}

Write-Host "`n按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
