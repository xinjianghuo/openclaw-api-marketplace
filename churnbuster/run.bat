@echo off
chcp 65001 >nul
echo Starting ChurnBuster...
echo.
node "%~dp0src\index.js" %*
pause
