@echo off
REM 自动部署 OpenClaw Money Guide 到 Netlify
REM 用法: .\deploy-netlify-auto.ps1

echo ========================================
echo OpenClaw Money Guide - Netlify Auto Deploy
echo ========================================

REM 1. 检查 netlify-cli 是否安装
where netlify >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Netlify CLI not found. Installing...
    npm install -g netlify-cli
    if errorlevel 1 (
        echo [ERROR] npm install failed. Please install Node.js first.
        pause
        exit /b 1
    )
)

REM 2. 检查是否已登录
netlify whoami >nul 2>&1
if errorlevel 1 (
    echo [INFO] Not logged in to Netlify. Attempting login...
    netlify login
    if errorlevel 1 (
        echo [ERROR] Login failed. Please run 'netlify login' manually first.
        pause
        exit /b 1
    )
)

REM 3. 检查 _config.yml 存在
if not exist "_config.yml" (
    echo [ERROR] _config.yml not found. Are you in the right directory?
    pause
    exit /b 1
)

REM 4. 尝试本地构建（需要 Ruby）
echo [INFO] Checking if Jekyll is available...
where bundle >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Building locally with Jekyll...
    call bundle install
    if errorlevel 1 (
        echo [WARN] bundle install failed, will use Netlify remote build
    ) else (
        call bundle exec jekyll build
        if errorlevel 1 (
            echo [WARN] Local build failed, will use Netlify remote build
        ) else (
            echo [INFO] Local build successful. Deploying _site...
            netlify deploy --dir=_site --prod
            goto :end
        )
    )
)

REM 5. 如果本地构建失败，使用 Netlify 远程构建（无需 Ruby）
echo [INFO] Deploying with Netlify remote build...
REM 先创建站点（如果不存在）
netlify sites:create --name openclaw-money-guide --repo-git-url "" --prod 2>nul || echo Site may already exist

REM 部署
netlify deploy --prod

:end
echo.
echo ========================================
echo Deployment finished!
echo Check your site: https://openclaw-money-guide.netlify.app
echo ========================================
pause
