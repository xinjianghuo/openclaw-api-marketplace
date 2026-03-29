# Git Auto Push Script
# Automates GitHub repository setup and deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl,

    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername
)

# Import utilities
. "$PSScriptRoot\utils.ps1"

Write-Host "🚀 Starting Git Auto Push..." -ForegroundColor Cyan

# 1. Check git installation
if (-not (Test-Command "git")) {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "Download: https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Git is installed" -ForegroundColor Green

# 2. Configure git user info (if not already set)
$currentUser = git config --global user.name
$currentEmail = git config --global user.email

if (-not $currentUser) {
    git config --global user.name "JARVIS Assistant"
    git config --global user.email "jarvis@openclaw.ai"
    Write-Host "✅ Git user configured" -ForegroundColor Green
} else {
    Write-Host "✅ Git user already set: $currentUser <$currentEmail>" -ForegroundColor Green
}

# 3. Check if repo already exists locally
if (Test-Path ".git") {
    Write-Host "⚠️  Git repository already exists locally" -ForegroundColor Yellow
    $status = Get-GitStatus
    if ($status.HasChanges) {
        Write-Host "📝 Committing changes..." -ForegroundColor Cyan
        git add .
        git commit -m "Automated deployment update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    # Check if remote exists
    $remotes = git remote
    if ($remotes -contains "origin") {
        $currentRemote = git remote get-url origin
        if ($currentRemote -ne $RepoUrl) {
            Write-Host "🔄 Updating remote origin to $RepoUrl" -ForegroundColor Cyan
            git remote set-url origin $RepoUrl
        } else {
            Write-Host "✅ Remote origin already set correctly" -ForegroundColor Green
        }
    } else {
        Write-Host "🔗 Adding remote origin: $RepoUrl" -ForegroundColor Cyan
        git remote add origin $RepoUrl
    }
    Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Cyan
    git push -u origin HEAD:main
} else {
    # 4. Initialize new repository
    Write-Host "🆕 Initializing new git repository..." -ForegroundColor Cyan
    git init
    git add .
    git commit -m "Initial commit - OpenClaw API Marketplace $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

    # 5. Add remote and push
    Write-Host "🔗 Adding remote: $RepoUrl" -ForegroundColor Cyan
    git remote add origin $RepoUrl

    Write-Host "⬆️  Pushing to GitHub (may prompt for credentials)..." -ForegroundColor Cyan
    git push -u origin main
}

# 6. Verify GitHub Pages (informational)
$repoParts = $RepoUrl -replace "https://github.com/", "" -split "/"
$owner = $repoParts[0]
$repoName = $repoParts[1]
$pagesUrl = "https://$owner.github.io/$repoName/"

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "📖 Repository: $RepoUrl" -ForegroundColor Cyan
Write-Host "🌐 GitHub Pages (should be live in 1-2 min): $pagesUrl" -ForegroundColor Cyan
Write-Host "`n⚠️  Note: If GitHub prompts for authentication, use your GitHub Personal Access Token (PAT) as password." -ForegroundColor Yellow
