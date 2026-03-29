#!/usr/bin/env powershell
# Node Doctor API - Full Automation Controller
# Orchestrates: Git push, Reddit posts, health checks, notifications
#
# Usage:
#   .\run-automation.ps1 -DeploySite   # Deploy affiliate site to GitHub Pages
#   .\run-automation.ps1 -PostReddit   # Post to Reddit (all 3)
#   .\run-automation.ps1 -FullLaunch  # Full launch sequence
#   .\run-automation.ps1 -Monitor      # Run health monitoring

[CmdletBinding()]
param(
    [Parameter(ParameterSetName="Deploy")]
    [switch]$DeploySite,

    [Parameter(ParameterSetName="Reddit")]
    [switch]$PostReddit,

    [Parameter(ParameterSetName="Full")]
    [switch]$FullLaunch,

    [Parameter(ParameterSetName="Monitor")]
    [switch]$Monitor,

    [Parameter(ParameterSetName="Deploy")]
    [string]$GitHubUsername = "",

    [switch]$Force,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ProjectRoot = "D:\OpenClaw\.openclaw\workspace"
$AffiliateSiteDir = Join-Path $ProjectRoot "affiliate-site"
$ScriptsDir = Join-Path $ProjectRoot "automation-scripts"

function Write-Status {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n[$($MyInvocation.MyCommand.Name)] $Message" -ForegroundColor $Color
}

# Load helper functions
. "$ScriptsDir\utils.ps1" 2>$null

switch ($PSCmdlet.ParameterSetName) {
    "Deploy" {
        Write-Status "Deploying Affiliate Site to GitHub Pages" "Green"

        if (-not $GitHubUsername) {
            $GitHubUsername = Read-Host "Enter your GitHub username"
        }

        # Ensure we're in the right directory
        Set-Location $AffiliateSiteDir

        # Check git status
        Write-Status "Checking git status..."
        git status

        # Run auto-push script
        Write-Status "Configuring git remote with PAT..."
        & "$AffiliateSiteDir\scripts\git-auto-push.ps1" -GitHubUsername $GitHubUsername -Force

        if ($LASTEXITCODE -ne 0) {
            Write-Error "Deployment failed!"
            exit 1
        }

        Write-Status "✅ Site code pushed to GitHub" "Green"
        Write-Status "Next: Configure GitHub Pages at https://github.com/$GitHubUsername/node-doctor-api-site/settings/pages" "Yellow"
    }

    "Reddit" {
        Write-Status "Posting to Reddit" "Green"

        Set-Location $AffiliateSiteDir

        # Check Node.js is available
        $node = Get-Command node -ErrorAction SilentlyContinue
        if (-not $node) {
            Write-Error "Node.js not found. Install from https://nodejs.org"
            exit 1
        }

        # Check .env file
        if (-not (Test-Path ".env")) {
            Write-Warning ".env file not found. Copy .env.example to .env and fill credentials."
            $createEnv = Read-Host "Create .env now? (y/N)"
            if ($createEnv -eq 'y') {
                Copy-Item ".env.example" ".env"
                Write-Host "📝 Edit .env and add your Reddit credentials, then re-run." -ForegroundColor Yellow
                exit 0
            }
        }

        if ($DryRun) {
            Write-Status "Dry-run mode: validating posts only" "Yellow"
            node "$AffiliateSiteDir\scripts\reddit-auto-post.js" --all --dry-run
        } else {
            Write-Status "Posting to all 3 subreddits with 15min delays..." "Cyan"
            Write-Host "Make sure your Reddit account is >7 days old with verified email." -ForegroundColor Yellow
            $confirm = Read-Host "Continue? (yes/no)"
            if ($confirm -ne 'yes') {
                Write-Host "Aborted." -ForegroundColor Red
                exit 0
            }

            node "$AffiliateSiteDir\scripts\reddit-auto-post.js" --all
        }
    }

    "Full" {
        Write-Status "FULL LAUNCH SEQUENCE" "Green"
        Write-Host "================================" -ForegroundColor Green

        # Step 1: Deploy site
        Write-Status "Step 1/2: Deploy Affiliate Site"
        & $MyInvocation.MyCommand.Path -DeploySite -GitHubUsername $GitHubUsername -Force

        # Step 2: Post Reddit (with delay to allow GitHub Pages to be ready)
        Write-Status "Step 2/2: Post to Reddit" "Green"
        Write-Host "Waiting 2 minutes for GitHub Pages to become available..." -ForegroundColor Yellow
        Start-Sleep -Seconds 120

        & $MyInvocation.MyCommand.Path -PostReddit

        Write-Status "🎉 LAUNCH COMPLETE!" "Green"
        Write-Host ""
        Write-Host "📊 Monitoring:" -ForegroundColor Cyan
        Write-Host " - GitHub Pages: https://$GitHubUsername.github.io/node-doctor-api-site/"
        Write-Host " - API Health: https://api-marketplace-pearl.vercel.app/api/health"
        Write-Host " - Gumroad: https://huozen5.gumroad.com/l/sligrv"
        Write-Host ""
        Write-Host "⏰ Next actions:" -ForegroundColor Yellow
        Write-Host " 1. Monitor Reddit comments (every 30min for 48h)"
        Write-Host " 2. Check Gumroad for views/purchases"
        Write-Host " 3. Set up monitoring: .\monitor-system.ps1"
    }

    "Monitor" {
        Write-Status "Running System Health Monitor" "Green"
        & "$ScriptsDir\maintenance\monitor-system.ps1"
    }
}

Write-Status "Done." "Green"