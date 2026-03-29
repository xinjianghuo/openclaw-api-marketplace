@echo off
REM 部署脚本 - Windows 版本
echo === Deploying OpenClaw API Marketplace to Vercel ===

REM 1. 检查 Vercel CLI
vercel --version >nul 2>&1
if errorlevel 1 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

REM 2. 环境变量检查
if not exist ".env.local" (
    echo Creating .env.local from .env.example...
    copy .env.example .env.local
    echo.
    echo Please edit .env.local and add your secrets:
    echo   Required: JWT_SECRET
    echo   Optional: VERCEL_KV_REST_API_URL, VERCEL_KV_REST_API_TOKEN
    echo.
    pause
    exit /b 1
)

REM 3. 部署
echo Deploying...
vercel --prod

echo.
echo Deployment complete!
echo Next steps:
echo   1. Create Gumroad product
echo   2. Configure webhook to https://your-app.vercel.app/api/webhook/gumroad
echo   3. Set GUMROUD_WEBHOOK_SECRET in Vercel dashboard
pause
