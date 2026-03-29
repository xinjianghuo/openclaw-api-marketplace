# API Marketplace 完全自动化部署脚本 (简化版)

Write-Host "🚀 API Marketplace 自动化部署" -ForegroundColor Cyan

# 配置
$projectName = "api-marketplace"
$teamId = "algea-foks-projects"
$upstashUrl = "https://model-clam-85882.upstash.io"
$upstashToken = "gQAAAAAAAU96AAIncDI0ZmYxYzFhNDg3ZWM0ZmIxYmE5YmFjMGY5NGNmNGJkNHAyODU4ODI"
$jwtSecret = "super-secret-jwt-key-change-this-in-production-12345"

# 1. 获取 token
$token = $null
if (Test-Path ".vercel/project.json") {
    $projectJson = Get-Content ".vercel/project.json" -Raw | ConvertFrom-Json
    if ($projectJson.token) { $token = $projectJson.token }
}
if (-not $token) {
    $globalConfig = "$env:APPDATA\vercel\config.json"
    if (Test-Path $globalConfig) {
        $cfg = Get-Content $globalConfig -Raw | ConvertFrom-Json
        if ($cfg.token) { $token = $cfg.token }
    }
}
if (-not $token) {
    Write-Host "❌ 未找到 Vercel token，请先运行: vercel login" -ForegroundColor Red
    exit 1
}

$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

# 2. 查找或创建项目
Write-Host "`n2. 查找或创建项目..." -ForegroundColor Yellow
$projectsUrl = "https://api.vercel.com/v9/projects?teamId=$teamId"
$response = Invoke-RestMethod -Uri $projectsUrl -Headers $headers -Method Get
$project = $response.projects | Where-Object { $_.name -eq $projectName }

if ($project) {
    Write-Host "   ✅ 找到项目: $($project.name)" -ForegroundColor Green
    $projectId = $project.id
} else {
    Write-Host "   ➕ 创建新项目..." -ForegroundColor Yellow
    $body = @{ name = $projectName; teamId = $teamId } | ConvertTo-Json
    $createUrl = "https://api.vercel.com/v9/projects"
    $response = Invoke-RestMethod -Uri $createUrl -Headers $headers -Method Post -Body $body
    $projectId = $response.id
    Write-Host "   ✅ 项目创建成功" -ForegroundColor Green
}

# 3. 设置环境变量
Write-Host "`n3. 设置环境变量..." -ForegroundColor Yellow

$envVars = @(
    @{ key = "JWT_SECRET"; value = $jwtSecret }
    @{ key = "VERCEL_KV_REST_API_URL"; value = $upstashUrl }
    @{ key = "VERCEL_KV_REST_API_TOKEN"; value = $upstashToken }
)

foreach ($envVar in $envVars) {
    $envUrl = "https://api.vercel.com/v9/projects/$projectId/env/$($envVar.key)?teamId=$teamId"
    $body = @{ value = $envVar.value; type = "plain"; target = @("production") } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri $envUrl -Headers $headers -Method Post -Body $body -ErrorAction SilentlyContinue | Out-Null
        Write-Host "   ✅ $($envVar.key) 已设置" -ForegroundColor Green
    } catch {
        # 可能已存在，尝试 PUT
        try {
            Invoke-RestMethod -Uri $envUrl -Headers $headers -Method Put -Body $body | Out-Null
            Write-Host "   ✅ $($envVar.key) 已更新" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  $($envVar.key) 失败: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

# 4. 触发部署
Write-Host "`n4. 触发部署..." -ForegroundColor Yellow
$deployBody = @{ name = $projectName; teamId = $teamId } | ConvertTo-Json
$deployUrl = "https://api.vercel.com/v13/deployments"
try {
    $deployResp = Invoke-RestMethod -Uri $deployUrl -Headers $headers -Method Post -Body $deployBody
    Write-Host "`n🎉 部署成功！" -ForegroundColor Green
    Write-Host "   部署 ID: $($deployResp.id)" -ForegroundColor Cyan
    if ($deployResp.url) {
        Write-Host "   🌐 网址: https://$($deployResp.url)" -ForegroundColor Green
    }
    Write-Host "`n查看详情: https://vercel.com/$teamId/$projectName" -ForegroundColor Cyan
} catch {
    Write-Host "`n❌ 部署失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n完成！" -ForegroundColor Green
