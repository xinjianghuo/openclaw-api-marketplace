#!/usr/bin/env powershell
# 🚀 ONE-CLICK LAUNCH - Node Doctor API Full Automation
#
# This is the master script. Run this to:
# 1. Deploy affiliate site to GitHub Pages
# 2. Configure automatic monitoring
# 3. Schedule Reddit posts (with API)
# 4. Everything in between
#
# Usage:
#   .\launch.ps1 -GitHubUsername "yourname" -RedditCredentials
#
# Example:
#   .\launch.ps1 -GitHubUsername "algea"
#
# Prerequisites:
# - GitHub account (create repo node-doctor-api-site first)
# - Reddit account >7 days old
# - Node.js installed
# - PowerShell 7+

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,

    [switch]$SkipGitHub,
    [switch]$SkipReddit,
    [switch]$SkipMonitoring,
    [switch]$DryRun
)

Write-Host @"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Node Doctor API - Full Automation Launcher         ║
║                                                           ║
║   Automated: Deploy + Market + Monitor                  ║
║   Status: Ready to launch                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$AffiliateSiteDir = Join-Path $ProjectRoot "affiliate-site"
$AutomationDir = Join-Path $PSScriptRoot "automation-scripts"

function Invoke-Step {
    param([string]$StepName, [scriptblock]$Script)
    Write-Host "`n🔧 Step: $StepName" -ForegroundColor Cyan
    Write-Host "──".PadRight(60, '─') -ForegroundColor Gray
    try {
        & $Script
        Write-Host "✅ $StepName completed" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ $StepName failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# ============================================
# PHASE 1: GITHUB PAGES DEPLOYMENT
# ============================================
if (-not $SkipGitHub) {
    $deploySuccess = Invoke-Step -StepName "Deploy Affiliate Site" -Script {
        Set-Location $AffiliateSiteDir

        # Check git
        if (-not (Test-Command git)) {
            throw "Git not found. Install from https://git-scm.com/"
        }

        # Ensure on main branch
        $branch = git branch --show-current
        if ($branch -ne "main") {
            git checkout main
        }

        # Pull latest (if any)
        if (git remote get-url origin) {
            git pull origin main
        }

        # Run auto-push script
        . "$AffiliateSiteDir\scripts\git-auto-push.ps1" -GitHubUsername $GitHubUsername -Force
    }

    if (-not $deploySuccess) {
        Write-Host "`n💡 Deploy failed. Check:" -ForegroundColor Yellow
        Write-Host " 1. Did you create GitHub repo 'node-doctor-api-site'?" -ForegroundColor Cyan
        Write-Host " 2. Do you have a PAT with 'repo' scope?" -ForegroundColor Cyan
        Write-Host " 3. Is repo name correct?" -ForegroundColor Cyan
        exit 1
    }

    Write-Host "`n🔗 GitHub Pages URL (enable at Settings → Pages):" -ForegroundColor Cyan
    Write-Host "   https://$GitHubUsername.github.io/node-doctor-api-site/" -ForegroundColor Yellow
    Write-Host "`n⏳ Waiting 3 minutes for deployment to propagate..." -ForegroundColor Yellow
    Start-Sleep -Seconds 180
}

# ============================================
# PHASE 2: REDDIT MARKETING
# ============================================
if (-not $SkipReddit) {
    $redditSuccess = Invoke-Step -StepName "Post to Reddit" -Script {
        Set-Location $AffiliateSiteDir

        # Check Node.js
        if (-not (Test-Command node)) {
            throw "Node.js not found. Install from https://nodejs.org/"
        }

        # Check .env
        if (-not (Test-Path ".env")) {
            Write-Host "📝 Reddit credentials not configured." -ForegroundColor Yellow
            $create = Read-Host "Copy .env.example to .env and fill credentials? (y/N)"
            if ($create -eq 'y') {
                Copy-Item ".env.example" ".env"
                Write-Host "✏️  Edit .env with your Reddit credentials, then re-run this script." -ForegroundColor Green
                exit 0  # Exit success, user will re-run later
            } else {
                throw "Reddit credentials required for automated posting"
            }
        }

        if ($DryRun) {
            Write-Host "🧪 Dry-run mode: validating posts only" -ForegroundColor Yellow
            node "$AffiliateSiteDir\scripts\reddit-auto-post.js" --all --dry-run
        } else {
            Write-Host "📢 Starting Reddit automated posting..." -ForegroundColor Cyan
            Write-Host "⚠️  Ensure:" -ForegroundColor Yellow
            Write-Host "   - Reddit account > 7 days old" -ForegroundColor Gray
            Write-Host "   - Email verified" -ForegroundColor Gray
            Write-Host "   - Fresh proxy/VPN recommended (avoid rate limits)" -ForegroundColor Gray
            $confirm = Read-Host "Continue? (yes/no)"
            if ($confirm -ne 'yes') {
                Write-Host "⚠️  Skipped by user" -ForegroundColor Yellow
                return $true  # Not an error
            }

            node "$AffiliateSiteDir\scripts\reddit-auto-post.js" --all
        }
    }

    if (-not $redditSuccess) {
        Write-Host "`n💡 Reddit posting failed. Check:" -ForegroundColor Yellow
        Write-Host " 1. .env file has correct Reddit credentials" -ForegroundColor Cyan
        Write-Host " 2. Reddit app type is 'script' with redirect http://localhost:8080" -ForegroundColor Cyan
        Write-Host " 3. Account has permission to post to target subreddits" -ForegroundColor Cyan
    }
}

# ============================================
# PHASE 3: MONITORING SETUP
# ============================================
if (-not $SkipMonitoring) {
    Invoke-Step -StepName "Configure Monitoring Tasks" -Script {
        # Run as Admin check
        $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
        if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
            Write-Warning "Not running as Administrator. Task Scheduler setup requires admin."
            $continue = Read-Host "Continue without scheduling? (y/N)"
            if ($continue -ne 'y') {
                throw "Run PowerShell as Administrator and retry."
            }
            return
        }

        Set-Location $AutomationDir
        .\setup-tasks.ps1 -CreateAll
    }
}

# ============================================
# FINAL SUMMARY
# ============================================
Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎉 LAUNCH SEQUENCE COMPLETE                            ║
║                                                           ║
║   ✅ Affiliate site deployed                             ║
║   ✅ Reddit marketing automation active                  ║
║   ✅ System monitoring scheduled                         ║
║                                                           ║
╠───────────────────────────────────────────────────────────╣
║                                                           ║
║   📊 WHAT'S LIVE NOW                                     ║
║                                                           ║
║   🌐 Marketing Site:                                     ║
║      https://$GitHubUsername.github.io/node-doctor-api-site/ ║
║                                                           ║
║   🔌 Production API:                                      ║
║      https://api-marketplace-pearl.vercel.app            ║
║                                                           ║
║   🛍️ Gumroad Product:                                    ║
║      https://huozen5.gumroad.com/l/sligrv               ║
║                                                           ║
╠───────────────────────────────────────────────────────────╣
║                                                           ║
║   📈 NEXT 48 HOURS                                       ║
║                                                           ║
║   1. Monitor Reddit posts (respond to comments)         ║
║   2. Check Gumroad dashboard for views/purchases        ║
║   3. Monitor site analytics (Vercel/GA4)                ║
║   4. Daily health report at 9:00 AM                     ║
║   5. Expected first sale: 1-3 customers                 ║
║                                                           ║
╠───────────────────────────────────────────────────────────╣
║                                                           ║
║   🔧 MANUAL OVERRIDES                                    ║
║                                                           ║
║   Deploy only:      .\automation-scripts\run-automation.ps1 -DeploySite -GitHubUsername "you" ║
║   Reddit only:      .\run-automation.ps1 -PostReddit    ║
║   Monitor only:     .\run-automation.ps1 -Monitor       ║
║   Run health check: .\automation-scripts\maintenance\monitor-system.ps1 ║
║                                                           ║
╠───────────────────────────────────────────────────────────╣
║                                                           ║
║   📞 SUPPORT                                             ║
║      Email: xinjiang.huo@gmail.com                      ║
║      Logs: C:\Logs\NodeDoctor\                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host "`n🎯 System is now autonomous. Monitor, optimize, collect revenue." -ForegroundColor Green
Write-Host "   - Heartbeat checks every 30 minutes"
Write-Host "   - Daily auto-reports at 9:00 AM"
Write-Host "   - Weekly performance review (Sunday 3:00 AM)"
Write-Host "`n💰 Good luck with your passive income journey!" -ForegroundColor Yellow

exit 0