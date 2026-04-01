# Automation Scripts - Utility Functions
# This file is dot-sourced by other PowerShell scripts

function Get-EnvVar {
    param([string]$Name, [string]$Default = "")
    $value = [Environment]::GetEnvironmentVariable($Name, "Process")
    if (-not $value) { $value = $Default }
    return $value
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Send-TelegramMessage {
    param([string]$Text, [string]$BotToken, [string]$ChatId)
    $uri = "https://api.telegram.org/bot$BotToken/sendMessage"
    $body = @{chat_id=$ChatId; text=$Text} | ConvertTo-Json
    Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType "application/json" | Out-Null
}

function Get-GitStatus {
    param([string]$RepoPath = ".")
    Set-Location $RepoPath
    $branch = git branch --show-current
    $status = git status --porcelain
    return @{
        Branch = $branch
        HasChanges = $status.Length -gt 0
        Status = $status
    }
}

function Invoke-Retry {
    param(
        [scriptblock]$Script,
        [int]$MaxAttempts = 3,
        [int]$DelaySeconds = 5
    )
    $attempt = 0
    while ($attempt -lt $MaxAttempts) {
        try {
            & $Script
            return $true
        } catch {
            $attempt++
            if ($attempt -eq $MaxAttempts) { throw }
            Write-Warning "Attempt $attempt failed, retrying in $DelaySeconds s..."
            Start-Sleep -Seconds $DelaySeconds
        }
    }
}

Export-ModuleMember -Function Get-EnvVar, Test-Command, Send-TelegramMessage, Get-GitStatus, Invoke-Retry