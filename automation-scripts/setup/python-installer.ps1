#!/usr/bin/env powershell
# Auto-Download and Install Python to D:\Program Files\Python
#
# This script:
# 1. Detects latest Python version from python.org
# 2. Downloads 64-bit installer
# 3. Installs silently to D:\Program Files\Python
# 4. Adds to PATH
# 5. Verifies installation

$ErrorActionPreference = "Stop"

Write-Host "🐍 Python Automated Installer" -ForegroundColor Cyan
Write-Host "Target: D:\Program Files\Python" -ForegroundColor Cyan
Write-Host ""

# Configuration
$InstallDir = "D:\Program Files\Python"
$DownloadUrl = "https://www.python.org/ftp/python/3.12.10/python-3.12.10-amd64.exe"  # Will update
$InstallerPath = "$env:TEMP\python-installer.exe"
$LogPath = "$env:TEMP\python-install.log"

function Get-LatestPythonVersion {
    # Try to fetch latest from python.org releases page
    try {
        $response = Invoke-RestMethod -Uri "https://www.python.org/downloads/" -TimeoutSec 10
        # Extract first Windows 64-bit link
        if ($response -match 'href="(https://www\.python\.org/ftp/python/(\d+\.\d+\.\d+)/python-\d+\.\d+\.\d+-amd64\.exe)"') {
            $url = $matches[1]
            $version = $matches[2]
            return @{ Url = $url; Version = $version }
        }
    } catch {
        Write-Warning "Could not fetch latest version automatically. Using default 3.12.10"
    }

    # Fallback to known recent version
    return @{
        Url = "https://www.python.org/ftp/python/3.12.10/python-3.12.10-amd64.exe"
        Version = "3.12.10"
    }
}

function Test-Admin {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# ============================================
# PHASE 1: Check Admin Rights
# ============================================
Write-Host "🔐 Checking privileges..." -ForegroundColor Yellow
if (-not (Test-Admin)) {
    Write-Host "❌ Administrator rights required to install to D:\Program Files" -ForegroundColor Red
    Write-Host "   Please run PowerShell as Administrator and retry." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Running as Administrator" -ForegroundColor Green

# ============================================
# PHASE 2: Get Download URL
# ============================================
Write-Host "🔍 Determining latest Python version..." -ForegroundColor Cyan
$versionInfo = Get-LatestPythonVersion
$DownloadUrl = $versionInfo.Url
$PythonVersion = $versionInfo.Version

Write-Host "   Target version: $PythonVersion" -ForegroundColor Gray
Write-Host "   Download URL: $DownloadUrl" -ForegroundColor Gray

# ============================================
# PHASE 3: Download Installer
# ============================================
Write-Host "⬇️  Downloading Python installer..." -ForegroundColor Cyan

# Show progress
try {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $InstallerPath -UseBasicParsing
    $fileSize = [math]::Round((Get-Item $InstallerPath).Length / 1MB, 2)
    Write-Host "✅ Downloaded: $fileSize MB" -ForegroundColor Green
} catch {
    Write-Host "❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Check internet connection or proxy settings." -ForegroundColor Yellow
    exit 1
}

# ============================================
# PHASE 4: Silent Install
# ============================================
Write-Host "⚙️  Installing Python to $InstallDir (this may take 2-5 minutes)..." -ForegroundColor Cyan

# Installer arguments for silent install:
# /quiet - no UI
# /norestart - don't reboot
# InstallAllUsers=1 - install for all users
# TargetDir - custom install path
# PrependPath=1 - add to PATH
# Associate=.py,.pyw - file associations
# InstallLauncherAllUsers=1 - install py launcher

$installArgs = @(
    '/quiet'
    'InstallAllUsers=1'
    "TargetDir=`"$InstallDir`""
    'PrependPath=1'
    'Associate=.py;.pyw'
    'InstallLauncherAllUsers=1'
    'Shortcuts=0'
    'Include_doc=0'
    'Include_ssl=1'
    'Include_test=0'
    'Include_tools=1'
) -join ' '

Write-Host "   Command: $InstallerPath $installArgs" -ForegroundColor Gray

try {
    $process = Start-Process -FilePath $InstallerPath -ArgumentList $installArgs -Wait -PassThru -NoNewWindow
    Write-Host "✅ Installation completed (exit code: $($process.ExitCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    # Try to read log
    if (Test-Path $LogPath) {
        Write-Host "   Installer log (last 20 lines):" -ForegroundColor Yellow
        Get-Content $LogPath -Tail 20 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    }
    exit 1
}

# ============================================
# PHASE 5: Post-Install Verification
# ============================================
Write-Host "🔍 Verifying installation..." -ForegroundColor Cyan

# Refresh PATH for current session
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

# Test python
$pythonExe = Join-Path $InstallDir "python.exe"
if (-not (Test-Path $pythonExe)) {
    Write-Host "❌ python.exe not found at $pythonExe" -ForegroundColor Red
    exit 1
}

try {
    $versionOutput = & $pythonExe --version 2>&1
    Write-Host "✅ Python version: $versionOutput" -ForegroundColor Green

    # Test pip
    $pipOutput = & $pythonExe -m pip --version 2>&1
    Write-Host "✅ Pip: $pipOutput" -ForegroundColor Green

    # Test import
    & $pythonExe -c "import sys; print('Python path:', sys.executable)" 2>&1 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }

} catch {
    Write-Host "❌ Verification failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ============================================
# PHASE 6: PATH Validation
# ============================================
Write-Host "`n📋 Checking PATH..." -ForegroundColor Cyan
$pathEntries = $env:Path -split ';' | Where-Object { $_ -like '*Python*' }
if ($pathEntries) {
    Write-Host "   Python found in PATH:" -ForegroundColor Green
    $pathEntries | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
} else {
    Write-Host "   ⚠️  Python not in current session PATH. You may need to restart PowerShell." -ForegroundColor Yellow
}

# ============================================
# SUMMARY
# ============================================
Write-Host @"

╔════════════════════════════════════════════════╗
║                                                ║
║   🎉 Python $PythonVersion Installed Successfully! ║
║                                                ║
║   📍 Install location: $InstallDir
║   🐍 Executable:      $pythonExe
║   📦 Package manager: pip (included)
║                                                ║
║   Next steps:                                  ║
║   1. Restart PowerShell (to update PATH)      ║
║   2. Test: python --version                    ║
║   3. Upgrade pip: python -m pip install --upgrade pip
║                                                ║
╚════════════════════════════════════════════════╝
"@ -ForegroundColor Green

exit 0