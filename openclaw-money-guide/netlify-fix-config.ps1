# 更新 Netlify 站点配置，清除构建命令
$siteId = "09731c18-81d7-4c7e-8f76-d755d896e3e4"

Write-Host "Updating Netlify site configuration..." -ForegroundColor Cyan

# 使用 netlify open 命令打开浏览器管理页面 (最简单)
Write-Host "`nPlease go to: https://app.netlify.com/sites/cerulean-bienenstitch-48146b/settings/build" -ForegroundColor Yellow
Write-Host "`nManual steps:" -ForegroundColor Yellow
Write-Host "1. Clear 'Build command' (delete: bundle exec jekyll build)"
Write-Host "2. Set 'Publish directory' to '.' (dot)"
Write-Host "3. Click Save`n"

# 尝试用 CLI 修改 (需要 Netlify CLI v13+)
Write-Host "Trying CLI update..." -ForegroundColor Gray
netlify sites:update $siteId --build-command "" --publish-dir "." 2>&1 | Write-Host

Write-Host "`nAfter updating, run: netlify deploy --id $siteId --prod" -ForegroundColor Green
