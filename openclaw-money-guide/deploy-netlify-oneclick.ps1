Write-Host "=== Netlify 一键部署助手 ===" -ForegroundColor Cyan

Write-Host "`nStep 1: 打开 Netlify 设置页面..." -ForegroundColor Yellow
Start-Process "https://app.netlify.com/sites/cerulean-bienenstitch-48146b/settings/build"

Write-Host "`n在打开的网页中，请修改：" -ForegroundColor White
Write-Host "  1. Build command: 清空 (删除所有内容)" -ForegroundColor Green
Write-Host "  2. Publish directory: 改为 . (一个点)" -ForegroundColor Green
Write-Host "  3. 滚动到最下面，点击 Save" -ForegroundColor Green
Write-Host "`n修改完成后，关闭网页，回到这里按回车继续。" -ForegroundColor Yellow

Read-Host "按回车继续 (完成修改后)"

Write-Host "`nStep 2: 正在部署..." -ForegroundColor Cyan
netlify deploy --site cerulean-bienenstitch-48146b --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ 部署成功！" -ForegroundColor Green
    Write-Host "`n你的网站地址: https://cerulean-bienenstitch-48146b.netlify.app" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ 部署失败，请检查错误信息。" -ForegroundColor Red
}

Write-Host "`n按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
