@echo off
REM 全自动部署到 Netlify（无需交互）
REM 前提：已安装 netlify-cli 并登录

echo ========================================
echo Auto Deploy to Netlify
echo ========================================

REM 1. 确保已登录
netlify whoami >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Not logged in to Netlify.
    echo Please run: netlify login
    pause
    exit /b 1
)

REM 2. 创建站点（如果不存在）
echo [INFO] Creating Netlify site...
netlify sites:create --name openclaw-money-guide --json > site-info.json 2>nul
if errorlevel 1 (
    echo [INFO] Site may already exist, continuing...
)

REM 3. 设置构建配置（从 netlify.toml）
echo [INFO] Site created. Deploying...

REM 4. 执行部署（使用 netlify.toml 配置）
netlify deploy --prod

if errorlevel 1 (
    echo.
    echo [ERROR] Deployment failed. Check the error above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Your site is live.
echo ========================================
echo.
echo Next steps:
echo 1. Visit your site URL (shown above)
echo 2. Test all pages work
echo 3. Submit sitemap to Google Search Console
echo.
pause
