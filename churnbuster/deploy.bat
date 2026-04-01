@echo off
chcp 65001 >nul
echo ========================================
echo   ChurnBuster v1.0 - Deploy Script
echo ========================================
echo.

:: Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js 18+ https://nodejs.org
    pause
    exit /b 1
)

node --version
echo Node.js detected
echo.

:: Change to project directory
cd /d "D:\OpenClaw\.openclaw\workspace\churnbuster"
echo Project: %CD%
echo.

:: 1. Install dependencies
echo [1/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo DONE
echo.

:: 2. Run tests
echo [2/5] Running tests...
call node test.js
if errorlevel 1 (
    echo ERROR: Tests failed!
    pause
    exit /b 1
)
echo DONE
echo.

:: 3. Build executable
echo [3/5] Building executable...
call node build.js
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo DONE
echo.

:: 4. Create zip
echo [4/5] Creating release zip...
if not exist "dist\churnbuster.exe" (
    echo ERROR: churnbuster.exe not found!
    pause
    exit /b 1
)

powershell Compress-Archive -Path "dist\churnbuster.exe" -DestinationPath "churnbuster-v1.0.0.zip" -Force
if exist "churnbuster-v1.0.0.zip" (
    echo DONE: churnbuster-v1.0.0.zip created
) else (
    echo ERROR: Zip creation failed!
    pause
    exit /b 1
)
echo.

:: 5. Summary
echo [5/5] All steps completed!
echo.
echo ========================================
echo   NEXT STEPS (Manual Work Required)
echo ========================================
echo.
echo 1. UPLOAD the file churnbuster-v1.0.0.zip to a cloud storage:
echo    - Google Drive / Baidu Netdisk / WeTransfer
echo    - Get a shareable download link (set password if needed)
echo.
echo 2. PUBLISH the sales page:
echo    - Open SALES_PAGE.html in browser to preview
echo    - Upload to GitHub Pages, Vercel, or send directly
echo.
echo 3. UPDATE contact info in SALES_PAGE.html (if not already):
echo    - Search for: support@example.com -> replace with your email
echo    - Search for: your_wechat_id -> replace with your WeChat ID
echo    - Search for: [Your download link] -> replace with actual link
echo.
echo 4. TEST the purchase flow yourself:
echo    - Scan QR code to pay (use a small amount test if possible)
echo    - Verify you receive the download link
echo    - Test churnbuster.exe runs correctly
echo.
echo 5. START SELLING:
echo    - Share the sales page link with potential customers
echo.
echo ========================================
echo    Files:
echo    - Sales page: %CD%\SALES_PAGE.html
echo    - Release zip: %CD%\churnbuster-v1.0.0.zip
echo    - Executable: %CD%\dist\churnbuster.exe
echo    - User guide: %CD%\README.md
echo ========================================
echo.
pause
