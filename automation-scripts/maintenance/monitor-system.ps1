#!/usr/bin/env powershell
# System Health Monitor for Node Doctor API Production
# Checks: disk space, services, API health, logs, and sends alerts
#
# Usage: .\monitor-system.ps1
# Schedule: Daily at 9:00 AM via Task Scheduler

$ErrorActionPreference = "Stop"

# Configuration
$LogDir = "C:\Logs\NodeDoctor"
$ReportFile = "$LogDir\health-$(Get-Date -Format 'yyyyMMdd').txt"
$AlertEmail = "xinjiang.huo@gmail.com"  # Change to your email
$ApiHealthUrl = "https://api-marketplace-pearl.vercel.app/api/health"
$ApiUsageUrl = "https://api-marketplace-pearl.vercel.app/api/metrics"

# Ensure log directory exists
if (-not (Test-Path $LogDir)) {
    New-Item -Path $LogDir -ItemType Directory -Force | Out-Null
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp [$Level] $Message" | Out-File -FilePath $ReportFile -Append -Encoding UTF8
    Write-Host "$timestamp [$Level] $Message"
}

function Send-Alert {
    param([string]$Subject, [string]$Body, [string]$Level = "WARNING")
    Write-Log "ALERT: $Subject - $Body" $Level

    # Send email (requires SMTP configured)
    # Uncomment and configure if needed:
    # Send-MailMessage -To $AlertEmail -From "monitor@yourdomain.com" `
    #   -Subject $Subject -Body $Body -SmtpServer "smtp.gmail.com" -Port 587 `
    #   -UseSsl -Credential (Get-Credential)

    # For now, just write to log
    Write-Host "🛎️  Alert: $Subject" -ForegroundColor Yellow
}

# Main check
try {
    Write-Log "=== System Health Check Started ==="

    # 1. Disk Space Check
    Write-Log "Checking disk space..."
    $disks = Get-CimInstance Win32_LogicalDisk | Where-Object {$_.DriveType -eq 3}
    foreach ($disk in $disks) {
        $freeGB = [math]::Round($disk.FreeSpace / 1GB, 2)
        $freePct = [math]::Round(($disk.FreeSpace / $disk.Size) * 100, 1)
        Write-Log "Drive $($disk.DeviceID): $freeGB GB free ($freePct%)"

        if ($freePct -lt 10) {
            Send-Alert "Low Disk Space" "Drive $($disk.DeviceID) has only $freePct% free ($freeGB GB)" "CRITICAL"
        } elseif ($freePct -lt 15) {
            Send-Alert "Disk Space Warning" "Drive $($disk.DeviceID) at $freePct%" "WARNING"
        }
    }

    # 2. Service Check (critical services)
    Write-Log "Checking critical services..."
    $criticalServices = @("wuauserv", "Spooler", "EventLog", "VErrorReports")
    foreach ($svcName in $criticalServices) {
        $svc = Get-Service $svcName -ErrorAction SilentlyContinue
        if ($svc) {
            if ($svc.Status -ne 'Running') {
                Send-Alert "Service Not Running" "$svcName is $($svc.Status)" "CRITICAL"
                # Try restart
                try {
                    Start-Service $svcName -ErrorAction Stop
                    Write-Log "Started service $svcName"
                } catch {
                    Send-Alert "Failed to Start Service" "$svcName restart failed: $($_.Exception.Message)" "CRITICAL"
                }
            } else {
                Write-Log "Service $svcName is running"
            }
        } else {
            Write-Log "Service $svcName not found"
        }
    }

    # 3. API Health Check
    Write-Log "Checking API health..."
    try {
        $apiResponse = Invoke-RestMethod -Uri $ApiHealthUrl -Method Get -TimeoutSec 10
        Write-Log "API Health: $($apiResponse.status) | Uptime: $($apiResponse.uptime)s | Users: $($apiResponse.rateLimitStats.totalKeys)"
    } catch {
        Send-Alert "API Health Check Failed" "Cannot reach $ApiHealthUrl : $($_.Exception.Message)" "CRITICAL"
    }

    # 4. API Metrics Check (usage, errors)
    Write-Log "Checking API metrics..."
    try {
        $metricsResponse = Invoke-RestMethod -Uri $ApiApiUsageUrl -Method Get -TimeoutSec 10
        Write-Log "API Metrics: Requests: $($metricsResponse.requests) | Active Windows: $($metricsResponse.activeWindows)"
    } catch {
        Send-Alert "API Metrics Failed" "Cannot fetch metrics: $($_.Exception.Message)" "WARNING"
    }

    # 5. Event Log Errors (last 24h)
    Write-Log "Scanning system event errors..."
    $errors = Get-WinEvent -LogName System -MaxEvents 500 -ErrorAction SilentlyContinue |
        Where-Object { $_.Level -eq 2 -and $_.TimeCreated -gt (Get-Date).AddHours(-24) }

    if ($errors.Count -gt 10) {
        Send-Alert "High System Error Count" "$($errors.Count) errors in System log (last 24h)" "WARNING"
        # Log top 5 errors
        $errors | Select-Object -First 5 | ForEach-Object {
            Write-Log "  Event: $($_.ProviderName) - $($_.Message.Substring(0, [Math]::Min(100, $_.Message.Length)))"
        }
    } else {
        Write-Log "System errors: $($errors.Count) (OK)"
    }

    # 6. Application Log Check (Node Doctor specific)
    Write-Log "Checking application logs..."
    $appLogPattern = "C:\Logs\*.log"
    $appLogs = Get-ChildItem $appLogPattern -ErrorAction SilentlyContinue
    foreach ($log in $appLogs) {
        $errorsInLog = Select-String -Path $log.FullName -Pattern "ERROR|CRITICAL|Failed" -CaseSensitive -ErrorAction SilentlyContinue
        if ($errorsInLog) {
            Write-Log "Found errors in $($log.Name): $($errorsInLog.Count) lines"
            # Send alert if > 5 error lines in last log
            if ($errorsInLog.Count -gt 5) {
                Send-Alert "Log Errors Detected" "$($log.Name) has $($errorsInLog.Count) error lines" "WARNING"
            }
        }
    }

    # 7. Memory Usage
    $mem = Get-CimInstance Win32_OperatingSystem
    $totalGB = [math]::Round($mem.TotalVisibleMemorySize / 1MB, 2)
    $freeGB = [math]::Round($mem.FreePhysicalMemory / 1MB, 2)
    $usedPct = [math]::Round((($totalGB - $freeGB) / $totalGB) * 100, 1)
    Write-Log "Memory: $freeGB GB free of $totalGB GB ($usedPct% used)"

    if ($usedPct -gt 85) {
        Send-Alert "High Memory Usage" "$usedPct% memory used" "WARNING"
    }

    Write-Log "=== System Health Check Completed ==="

} catch {
    Write-Log "FATAL ERROR: $($_.Exception.Message)" "FATAL"
    Send-Alert "Monitor Script Crashed" $_.Exception.Message "CRITICAL"
    exit 1
}

exit 0