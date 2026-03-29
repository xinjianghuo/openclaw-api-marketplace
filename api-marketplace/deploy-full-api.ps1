# API Marketplace 完全自动化部署脚本
# 使用 Vercel REST API 绕过 CLI 限制

Write-Host "🚀 API Marketplace 完全自动化部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Gray

# 配置
$projectName = "api-marketplace"
$teamId = "algea-foks-projects"  # 你的 team ID
$upstashUrl = "https://model-clam-85882.upstash.io"
$upstashToken = "gQAAAAAAAU96AAIncDI0ZmYxYzFhNDg3ZWM0ZmIxYmE5YmFjMGY5NGNmNGJkNHAyODU4ODI"
$jwtSecret = "super-secret-jwt-key-change-this-in-production-12345"

# 1. 获取 Vercel API Token (从本地配置)
Write-Host "`n1. 获取 Vercel API Token..." -ForegroundColor Yellow
$token = $null
if (Test-Path ".vercel/project.json") {
    $projectJson = Get-Content ".vercel/project.json" -Raw | ConvertFrom-Json
    if ($projectJson.token) {
        $token = $projectJson.token
        Write-Host "   ✅ 从 .vercel/project.json 读取 token" -ForegroundColor Green
    }
}
if (-not $token) {
    # 尝试从全局配置读取
    $globalConfig = "$env:APPDATA\vercel\config.json"
    if (Test-Path $globalConfig) {
        $cfg = Get-Content $globalConfig -Raw | ConvertFrom-Json
        if ($cfg.token) {
            $token = $cfg.token
            Write-Host "   ✅ 从全局配置读取 token" -ForegroundColor Green
        }
    }
}
if (-not $token) {
    Write-Host "   ❌ 未找到 Vercel token，请先运行 'vercel login'" -ForegroundColor Red
    exit 1
}

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`n2. 查找或创建项目..." -ForegroundColor Yellow

# 获取团队下的所有项目
$projectsUrl = "https://api.vercel.com/v9/projects?teamId=$teamId"
$response = Invoke-RestMethod -Uri $projectsUrl -Headers $headers -Method Get
$project = $response.projects | Where-Object { $_.name -eq $projectName }

if ($project) {
    Write-Host "   ✅ 找到现有项目: $($project.name) (ID: $($project.id))" -ForegroundColor Green
    $projectId = $project.id
} else {
    Write-Host "   ➕ 创建新项目..." -ForegroundColor Yellow
    $body = @{
        name = $projectName
        teamId = $teamId
    } | ConvertTo-Json
    $createUrl = "https://api.vercel.com/v9/projects"
    $response = Invoke-RestMethod -Uri $createUrl -Headers $headers -Method Post -Body $body
    $projectId = $response.id
    Write-Host "   ✅ 项目创建成功 (ID: $projectId)" -ForegroundColor Green
}

# 3. 设置环境变量
Write-Host "`n3. 设置环境变量..." -ForegroundColor Yellow

$envVars = @(
    @{ key = "JWT_SECRET"; value = $jwtSecret },
    @{ key = "VERCEL_KV_REST_API_URL"; value = $upstashUrl },
    @{ key = "VERCEL_KV_REST_API_TOKEN"; value = $upstashToken }
)

foreach ($envVar in $envVars) {
    # 检查是否已存在
    $checkUrl = "https://api.vercel.com/v9/projects/$projectId/env/$($envVar.key)?teamId=$teamId"
    $getResp = Invoke-RestMethod -Uri $checkUrl -Headers $headers -Method Get -ErrorAction SilentlyContinue
    
    if ($getResp.value) {
        Write-Host "   🔄 更新 $($envVar.key)..." -ForegroundColor Gray
        $method = "Put"
    } else {
        Write-Host "   ➕ 添加 $($envVar.key)..." -ForegroundColor Gray
        $method = "Post"
    }
    
    $body = @{
        value = $envVar.value
        type = "encrypted"
        target = @("production")
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri $checkUrl -Headers $headers -Method $method -Body $body | Out-Null
        Write-Host "   ✅ $($envVar.key) 设置完成" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ 设置 $($envVar.key) 失败: $_" -ForegroundColor Red
    }
}

# 4. 触发部署
Write-Host "`n4. 触发生产部署..." -ForegroundColor Yellow

$deployBody = @{
    name = $projectName
    teamId = $teamId
} | ConvertTo-Json

$deployUrl = "https://api.vercel.com/v13/deployments"
try {
    $deployResp = Invoke-RestMethod -Uri $deployUrl -Headers $headers -Method Post -Body $deployBody
    Write-Host "`n🎉 部署已触发！" -ForegroundColor Green
    Write-Host "   部署 ID: $($deployResp.id)" -ForegroundColor Cyan
    Write-Host "   状态: $($deployResp.state)" -ForegroundColor Cyan
    
    if ($deployResp.url) {
        Write-Host "`n🌐 你的 API 地址: https://$($deployResp.url)" -ForegroundColor Green
    }
    
    Write-Host "`n⏳ 等待部署完成，可能需要 1-2 分钟..." -ForegroundColor Yellow
    Write-Host "   查看进度: https://vercel.com/$teamId/$projectName" -ForegroundColor Cyan
} catch {
    Write-Host "`n❌ 部署失败: $_" -ForegroundColor Red
}

Write-Host "`n按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
