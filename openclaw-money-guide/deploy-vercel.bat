@echo off
REM 部署 OpenClaw Money Guide 到 Vercel

echo === Deploying OpenClaw Money Guide to Vercel ===

REM 检查是否已登录 Vercel
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo You need to login to Vercel first.
    echo Run: vercel login
    pause
    exit /b 1
)

REM 部署
echo Deploying to Vercel...
vercel --prod

echo.
echo Deployment complete!
echo Your site will be available at: https://your-project.vercel.app
echo.
echo Next steps:
echo 1. Add custom domain (optional)
echo 2. Submit sitemap to Google Search Console
echo 3. Add affiliate links and tracking
pause
