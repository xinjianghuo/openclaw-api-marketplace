@echo off
REM Deploy OpenClaw Money Guide to GitHub Pages

echo === Deploying OpenClaw Money Guide to GitHub Pages ===

REM 1. Check _config.yml
if not exist "_config.yml" (
    echo Error: _config.yml not found. Please run this script from the site root.
    pause
    exit /b 1
)

REM 2. Init Git if needed
if not exist ".git" (
    git init
    git branch -M main
    echo Git repository initialized.
)

REM 3. Prompt for remote
echo.
echo Please create a new repository on GitHub named: openclaw-money-guide
echo Then add the remote:
echo   git remote add origin https://github.com/YOUR_USERNAME/openclaw-money-guide.git
echo.
set /p "yn=Have you added the remote? (y/n) "
if /i not "%yn%"=="y" (
    echo Please add remote first, then re-run this script.
    pause
    exit /b 1
)

REM 4. Commit and push
git add .
git commit -m "Deploy OpenClaw Money Guide site"
git push -u origin main

REM 5. Instructions
echo.
echo ^✅ Code pushed to GitHub!
echo.
echo Next steps:
echo 1. Go to https://github.com/YOUR_USERNAME/openclaw-money-guide/settings/pages
echo 2. Set 'Source' to 'GitHub Actions' (recommended) or 'Deploy from a branch'
echo 3. If using Actions, the workflow will run automatically
echo 4. Wait 1-2 minutes, then visit:
echo    https://YOUR_USERNAME.github.io/openclaw-money-guide/
echo.
echo Don't forget to update _config.yml with your username and email!
pause
