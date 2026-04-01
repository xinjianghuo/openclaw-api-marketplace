#!/usr/bin/env powershell
# 🚀 FINAL DEPLOYMENT - One Command to GitHub Pages
#
# This script handles everything:
# 1. Checks if GitHub repo exists (creates if needed via manual step)
# 2. Configures git remote with PAT authentication
# 3. Pushes code to GitHub
# 4. Prints GitHub Pages setup instructions
#
# USAGE:
#   .\deploy-final.ps1 -GitHubUsername "algea" -PAT "ghp_xxx"
#
# If you don't have PAT, generate at: https://github.com/settings/tokens

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,

    [Parameter(Mandatory=$true)]
    [string]$PAT
)

Write-Host @"
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 Final Deployment to GitHub Pages                  ║
║                                                          ║
║   Target: https://$GitHubUsername.github.io/           ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$ErrorActionPreference = "Stop"
$SiteDir = "D:\OpenClaw\.openclaw\workspace\affiliate-site"

# Validate directory
if (-not (Test-Path $SiteDir)) {
    Write-Error "Site directory not found: $SiteDir"
    exit 1
}

Set-Location $SiteDir

# 1. Check/Initialize Git (if not already)
if (-not (Test-Path ".git")) {
    Write-Host "🔧 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit: Node Doctor API landing site"
    git branch -M main
}

# 2. Configure remote with PAT
$remoteUrl = "https://$PAT@github.com/$GitHubUsername/node-doctor-api-site.git"

Write-Host "🔗 Configuring git remote..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin $remoteUrl

# 3. Push to GitHub
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "   This may take 10-30 seconds..." -ForegroundColor Gray

try {
    git push -u origin main
    Write-Host "✅ Push successful!" -ForegroundColor Green
} catch {
    Write-Error "Push failed: $($_.Exception.Message)"
    exit 1
}

# 4. Instructions for GitHub Pages
Write-Host @"

╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ✅ Code is now on GitHub!                             ║
║                                                          ║
║   NEXT: Enable GitHub Pages                             ║
║                                                          ║
║   1. Open: https://github.com/$GitHubUsername/node-doctor-api-site/settings/pages ║
║   2. Source: Deploy from a branch                       ║
║   3. Branch: main → /root                               ║
║   4. Click Save                                         ║
║   5. Wait 2-5 minutes                                   ║
║                                                          ║
║   🌐 Your site will be:                                 ║
║      https://$GitHubUsername.github.io/node-doctor-api-site/ ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green

# 5. Optional: Trigger first workflow (if using GitHub Actions)
Write-Host "`n📊 Verify deployment:" -ForegroundColor Cyan
Write-Host "   Visit: https://$GitHubUsername.github.io/node-doctor-api-site/" -ForegroundColor Yellow
Write-Host "   API: https://api-marketplace-pearl.vercel.app/api/health" -ForegroundColor Yellow

Write-Host "`n🎉 Deployment complete! Check the URL above in 2-5 minutes." -ForegroundColor Green

exit 0
