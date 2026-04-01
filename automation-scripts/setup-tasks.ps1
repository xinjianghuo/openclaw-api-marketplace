#!/usr/bin/env powershell
# Configure Windows Task Scheduler for Node Doctor Automation
#
# This script sets up the following scheduled tasks:
#  1. Daily System Health Check (9:00 AM)
#  2. Hourly API Health Check (every hour)
#  3. Daily Backup (2:00 AM)
#  4. Weekly Full System Audit (Sunday 3:00 AM)

param(
    [switch]$CreateAll,
    [switch]$RemoveAll,
    [switch]$List
)

$TaskPrefix = "NodeDoctor-"

$tasks = @(
    @{
        Name = "$TaskPrefix Daily Health Check"
        Script = "D:\OpenClaw\.openclaw\workspace\automation-scripts\maintenance\monitor-system.ps1"
        Trigger = New-ScheduledTaskTrigger -Daily -At 9:00AM
        Description = "Daily system health monitoring for Node Doctor API"
    },
    @{
        Name = "$TaskPrefix Hourly API Ping"
        Script = "D:\OpenClaw\.openclaw\workspace\automation-scripts\monitoring\api-ping.ps1"
        Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(5) -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Days 3650)
        Description = "Check API availability every hour"
    },
    @{
        Name = "$Task Prefix Daily Backup"
        Script = "D:\OpenClaw\.openclaw\workspace\automation-scripts\backups\daily-backup.ps1"
        Trigger = New-ScheduledTaskTrigger -Daily -At 2:00AM
        Description = "Daily backup of important data"
    },
    @{
        Name = "$TaskPrefix Weekly Audit"
        Script = "D:\OpenClaw\.openclaw\workspace\automation-scripts\maintenance\weekly-audit.ps1"
        Trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 3:00AM
        Description = "Weekly system audit and cleanup"
    }
)

function New-TaskAction {
    param([string]$ScriptPath)
    $arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`""
    return New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument $arguments
}

function New-TaskSettings {
    param([bool]$RunElevated)
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
        -StartWhenAvailable -RunOnlyIfNetworkAvailable
    if ($RunElevated) {
        $settings.ExecutionTimeLimit = [TimeSpan]::FromHours(2)
    }
    return $settings
}

function New-TaskPrincipal {
    param([string]$User = "SYSTEM", [bool]$RunElevated = $true)
    return New-ScheduledTaskPrincipal -UserId $User -LogonType ServiceAccount -RunLevel $(if ($RunElevated) { "Highest" } else { "Limited" })
}

if ($List) {
    Write-Host "📋 Scheduled Tasks for Node Doctor:" -ForegroundColor Cyan
    Get-ScheduledTask -TaskName "$TaskPrefix*" | Format-Table TaskName, State, LastTaskResult
    exit 0
}

if ($RemoveAll) {
    Write-Host "🗑️  Removing all Node Doctor scheduled tasks..." -ForegroundColor Yellow
    Get-ScheduledTask -TaskName "$TaskPrefix*" | Unregister-ScheduledTask -Confirm:$false
    Write-Host "✅ All tasks removed." -ForegroundColor Green
    exit 0
}

if ($CreateAll) {
    Write-Host "⚙️  Creating scheduled tasks..." -ForegroundColor Cyan

    foreach ($task in $tasks) {
        $existing = Get-ScheduledTask -TaskName $task.Name -ErrorAction SilentlyContinue
        if ($existing) {
            Write-Host "⚠️  Task '$($task.Name)' exists, updating..." -ForegroundColor Yellow
            Unregister-ScheduledTask -TaskName $task.Name -Confirm:$false
        }

        try {
            $action = New-TaskAction -ScriptPath $task.Script
            $settings = New-TaskSettings -RunElevated $true
            $principal = New-TaskPrincipal -User "SYSTEM" -RunElevated $true

            Register-ScheduledTask -TaskName $task.Name `
                -Action $action `
                -Trigger $task.Trigger `
                -Settings $settings `
                -Principal $principal `
                -Description $task.Description `
                -Force | Out-Null

            Write-Host "✅ Created: $($task.Name)" -ForegroundColor Green
        } catch {
            Write-Error "Failed to create task '$($task.Name)': $($_.Exception.Message)"
        }
    }

    Write-Host ""
    Write-Host "📊 Task Summary:" -ForegroundColor Cyan
    Get-ScheduledTask -TaskName "$TaskPrefix*" | Format-Table TaskName, State

    Write-Host ""
    Write-Host "🔧 To view task history, run: Get-ScheduledTaskInfo -TaskName 'NodeDoctor-*'" -ForegroundColor Yellow
    Write-Host "🔧 To run a task manually: Start-ScheduledTask -TaskName 'NodeDoctor-*'" -ForegroundColor Yellow
    Write-Host "🔧 To remove all tasks: .\setup-tasks.ps1 -RemoveAll" -ForegroundColor Yellow

    exit 0
}

# If no parameters, show help
Write-Host "Usage: .\setup-tasks.ps1 [-CreateAll] [-RemoveAll] [-List] [-Monitor] [-Help]" -ForegroundColor Yellow
Write-Host ""
Write-Host "Examples:" -ForegroundColor Cyan
Write-Host "  .\setup-tasks.ps1 -CreateAll    # Create all scheduled tasks"
Write-Host "  .\setup-tasks.ps1 -List         # List existing tasks"
Write-Host "  .\setup-tasks.ps1 -RemoveAll    # Remove all Node Doctor tasks"
Write-Host ""
Write-Host "Note: Run as Administrator for task creation." -ForegroundColor Yellow