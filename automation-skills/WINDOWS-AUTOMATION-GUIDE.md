# Windows 系统自动化完全指南

**学习目标**: 完全控制 Windows 机器，实现无人工干预的自动化

**适用场景**:
- 文件批量处理
- 定时任务执行
- 系统配置管理
- 软件部署/卸载
- 监控与告警
- 鼠标/键盘模拟 (最后手段)

---

## 🛠️ 工具选型

### 主要工具: **PowerShell 7+**
- 内置，无需安装
- 访问完整 Windows API
- 支持 .NET Framework/Core
- 远程管理 (WinRM, SSH)
- 脚本签名与执行策略

**版本**: PowerShell 7.x (跨平台，性能更好)  
**安装**: `winget install Microsoft.PowerShell` 或从官网下载

---

### 辅助工具:

| 工具 | 用途 | 安装 |
|------|------|------|
| **AutoHotkey** | GUI 自动化，热键 | winget install AutoHotkey |
| **Python + pyautogui** | 跨平台 GUI 自动化 | winget install Python.Python |
| **NirCmd** | 命令行系统工具 | 下载 from NirSoft |
| **PsExec** | 远程进程执行 | Sysinternals suite |
| **Windows Task Scheduler** | 定时任务 | 内置 |

---

## 📖 PowerShell 核心技能

### 1. 文件系统操作

```powershell
# 复制文件夹 (保留结构)
Copy-Item -Path "C:\source" -Destination "D:\backup" -Recurse -Force

# 移动并重命名
Move-Item -Path "C:\file.txt" -Destination "D:\newfile.txt"

# 删除 (安全模式，到回收站)
Remove-Item -Path "C:\temp\*" -Recurse -Force

# 压缩/解压
Compress-Archive -Path "C:\folder\*" -DestinationPath "C:\archive.zip"
Expand-Archive -Path "C:\archive.zip" -DestinationPath "C:\extract"

# 遍历文件
Get-ChildItem -Path "C:\logs" -Filter "*.log" -Recurse | ForEach-Object {
    if ($_.Length -gt 100MB) {
        # 处理大文件
    }
}
```

---

### 2. 注册表操作

```powershell
# 读取
$value = Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion" -Name "ProductName"

# 写入
Set-ItemProperty -Path "HKCU:\Software\MyApp" -Name "Setting" -Value "Enabled"

# 创建键
New-Item -Path "HKLM:\SOFTWARE\MyCompany" -Name "MyApp"

# 删除
Remove-ItemProperty -Path "HKCU:\Software\MyApp" -Name "OldSetting"
```

**常用注册表路径**:
- `HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion` - 系统信息
- `HKCU:\Software\Microsoft\Windows\CurrentVersion\Run` - 自启动
- `HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall` - 已安装程序

---

### 3. 进程管理

```powershell
# 列出进程
Get-Process | Where-Object {$_.CPU -gt 50} | Sort-Object CPU -Descending

# 结束进程
Stop-Process -Id 1234 -Force
Stop-Process -Name "chrome" -Force  # 所有 Chrome 进程

# 启动程序
Start-Process -FilePath "C:\Program Files\App\app.exe" -ArgumentList "--silent" -Wait

# 等待进程结束
$proc = Start-Process -FilePath "installer.exe" -PassThru
$proc.WaitForExit()
```

---

### 4. 服务控制

```powershell
# 列出服务
Get-Service | Where-Object {$_.Status -eq 'Running'}

# 启动/停止
Start-Service -Name "wuauserv"
Stop-Service -Name "Spooler" -Force

# 设置启动类型
Set-Service -Name "MyService" -StartupType Automatic
```

---

### 5. 网络配置

```powershell
# IP 配置
Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet*"

# 防火墙规则
Get-NetFirewallRule | Where-Object {$_.Enabled -eq 'True'}

# 测试连接
Test-NetConnection -ComputerName "google.com" -Port 443

# DNS 刷新
Clear-DnsClientCache
```

---

### 6. 事件日志

```powershell
# 读取系统日志
Get-WinEvent -LogName System -MaxEvents 100 | Where-Object {$_.Level -eq 2}  # Error only

# 应用日志
Get-EventLog -LogName Application -Source "MyApp" -After (Get-Date).AddDays(-1)

# 创建自定义日志
New-EventLog -LogName "MyApp" -Source "MyService"
Write-EventLog -LogName "MyApp" -Source "MyService" -EntryType Information -EventId 1000 -Message "Service started"
```

---

### 7. Windows 功能管理

```powershell
# 启用/禁用 Windows 功能
Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V" -All -NoRestart
Disable-WindowsOptionalFeature -Online -FeatureName "SMB1Protocol" -NoRestart

# 安装/卸载程序 (MSI)
Start-Process msiexec.exe -ArgumentList "/i `"C:\installer.msi`" /quiet /norestart" -Wait

# 检测已安装软件
Get-WmiObject -Class Win32_Product | Select-Object Name, Version
# 更快的方法 (注册表):
Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* |
    Where-Object {$_.DisplayName} | Select-Object DisplayName, DisplayVersion
```

---

### 8. 计划任务自动化

```powershell
# 创建触发器 (每天 2:00 AM)
$trigger = New-ScheduledTaskTrigger -Daily -At 2:00AM

# 创建操作 (运行 PowerShell 脚本)
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-File `"C:\Scripts\daily-backup.ps1`""

# 创建任务
Register-ScheduledTask -TaskName "Daily Backup" `
    -Trigger $trigger `
    -Action $action `
    -RunLevel Highest `
    -User "SYSTEM" `
    -Description "Daily backup of important data"

# 立即运行
Start-ScheduledTask -TaskName "Daily Backup"
```

**或者使用 schtasks (更古老但可靠)**:
```cmd
schtasks /create /tn "Daily Backup" /tr "powershell.exe -File C:\Scripts\backup.ps1" /sc daily /st 02:00 /ru "SYSTEM"
schtasks /run /tn "Daily Backup"
```

---

## 🎨 高级模式

### 9. WMI/CIM 查询

```powershell
# 系统信息
Get-CimInstance -ClassName Win32_ComputerSystem
Get-CimInstance -ClassName Win32_Processor
Get-CimInstance -ClassName Win32_OperatingSystem

# 磁盘信息
Get-CimInstance -ClassName Win32_LogicalDisk | Where-Object {$_.DriveType -eq 3}

# 启动自动修复
$disk = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DeviceID='C:'"
if ($disk.FreeSpace / $disk.Size -lt 0.1) {
    # 磁盘空间 < 10%，发送告警
    Send-MailMessage -To "admin@example.com" -Subject "Disk Low" -Body "C: drive low space"
}
```

---

### 10. 远程管理 (WinRM)

```powershell
# 启用 WinRM (在远程机器上运行一次)
Enable-PSRemoting -Force

# 配置信任
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "*" -Force  # 不推荐生产

# 远程执行
Invoke-Command -ComputerName "REMOTE-PC" -ScriptBlock {
    Get-Process | Where-Object {$_.CPU -gt 50}
    # 或获取服务状态
    Get-Service -Name "wuauserv"
}

# 多机并行
$computers = @("PC1", "PC2", "PC3")
Invoke-Command -ComputerName $computers -ScriptBlock {
    # 在所有机器上执行
    Get-Service -Name "Spooler" | Restart-Service
}
```

---

### 11. 错误处理与日志

```powershell
try {
    # 可能失败的代码
    Stop-Service -Name "MyService" -Force -ErrorAction Stop
    Write-Host "Service stopped successfully"
} catch {
    # 记录到文件
    $errorMsg = "$(Get-Date): $($_.Exception.Message)"
    Add-Content -Path "C:\Logs\automation.log" -Value $errorMsg

    # 或发送邮件
    Send-MailMessage -To "admin@example.com" -Subject "Automation Failed" -Body $errorMsg
} finally {
    # 无论成功失败都执行
    Write-EventLog -LogName "MyApp" -Source "Automation" -EntryType Information -EventId 999 -Message "Run completed"
}
```

---

### 12. 配置文件与参数化

```powershell
# 读取 JSON 配置
$config = Get-Content "config.json" | ConvertFrom-Json
$backupPath = $config.BackupPath
$emailTo = $config.AlertEmail

# 命令行参数
param(
    [string]$TaskName,
    [switch]$Force,
    [int]$MaxRetries = 3
)

# 使用
.\script.ps1 -TaskName "DailyBackup" -Force
```

---

## 🚀 实用脚本示例

### 示例1: 自动化备份脚本

```powershell
# backup.ps1
$source = "D:\Projects"
$destination = "E:\Backup\Projects_$(Get-Date -Format 'yyyyMMdd').zip"
$logFile = "C:\Logs\backup.log"

try {
    Compress-Archive -Path "$source\*" -DestinationPath $destination -Force
    $size = (Get-Item $destination).Length / 1GB
    "$(Get-Date): Backup completed, size: $([math]::Round($size,2)) GB" | Out-File $logFile -Append

    # 保留最近 7 天
    Get-ChildItem "E:\Backup\*.zip" | Where-Object {$_.CreationTime -lt (Get-Date).AddDays(-7)} | Remove-Item
} catch {
    "$(Get-Date): ERROR - $($_.Exception.Message)" | Out-File $logFile -Append
    Send-MailMessage -To "admin@example.com" -Subject "Backup Failed" -Body $_.Exception.Message
}
```

---

### 示例2: 系统健康检查

```powershell
# health-check.ps1
$report = @()

# 1. 磁盘空间
Get-CimInstance Win32_LogicalDisk | ForEach-Object {
    $freePct = [math]::Round(($_.FreeSpace / $_.Size) * 100, 1)
    if ($freePct -lt 15) {
        $report += "CRITICAL: Drive $($_.DeviceID) has only $freePct% free"
    }
}

# 2. 服务状态
$criticalServices = @("wuauserv", "Spooler", "EventLog")
foreach ($svc in $criticalServices) {
    $status = (Get-Service $svc).Status
    if ($status -ne 'Running') {
        $report += "WARNING: Service $svc is $status"
    }
}

# 3. 事件日志错误 (最近 24h)
$errors = Get-WinEvent -LogName System -MaxEvents 1000 | Where-Object {
    $_.Level -eq 2 -and $_.TimeCreated -gt (Get-Date).AddHours(-24)
}
if ($errors.Count -gt 10) {
    $report += "WARNING: High error count in System log ($($errors.Count))"
}

# 输出报告
if ($report) {
    $report | Out-File "C:\Logs\health-$(Get-Date -Format 'yyyyMMdd').txt"
    # 发送邮件
    Send-MailMessage -To "admin@example.com" -Subject "Health Check Alert" -Body ($report -join "`n")
} else {
    Write-Host "All systems healthy"
}
```

---

### 示例3: 自动安装软件

```powershell
# install-software.ps1
$apps = @(
    @{Name="7-Zip"; URL="https://7-zip.org/download/7z2301-x64.exe"},
    @{Name="VS Code"; URL="https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-user"},
    @{Name="Chrome"; URL="https://dl.google.com/chrome/install/ChromeStandaloneSetup64.exe"}
)

foreach ($app in $apps) {
    $installer = "$env:TEMP\$($app.Name).exe"
    Write-Host "Downloading $($app.Name)..."
    Invoke-WebRequest -Uri $app.URL -OutFile $installer

    Write-Host "Installing $($app.Name)..."
    Start-Process -FilePath $installer -ArgumentList "/S" -Wait

    Remove-Item $installer
    Write-Host "$($app.Name) installed"
}
```

---

## 📋 执行策略与安全

### 执行策略设置

```powershell
# 查看当前策略
Get-ExecutionPolicy -List

# 设置当前用户为 RemoteSigned (允许本地脚本，远程需签名)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 临时绕过 (单个脚本)
powershell.exe -ExecutionPolicy Bypass -File "script.ps1"
```

---

### 脚本签名 (企业环境)

```powershell
# 创建代码签名证书
New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=MyScripts" -CertStoreLocation Cert:\CurrentUser\My

# 签名脚本
Set-AuthenticodeSignature -FilePath "script.ps1" -Certificate (Get-ChildItem Cert:\CurrentUser\My | Where-Object {$_.Subject -eq "CN=MyScripts"})
```

---

## 🔄 集成到 OpenClaw 系统

### 创建自动化任务库

```
D:\OpenClaw\.openclaw\workspace\automation-scripts\
├── backups\
│   ├── daily-backup.ps1
│   ├── weekly-backup.ps1
│   └── backup-manifest.json
├── maintenance\
│   ├── disk-cleanup.ps1
│   ├── health-check.ps1
│   └── service-monitor.ps1
├── deployment\
│   ├── deploy-api.ps1
│   ├── deploy-site.ps1
│   └── rollback.ps1
└── monitoring\
    ├── check-logs.ps1
    ├── alert-if-down.ps1
    └── usage-report.ps1
```

---

### 使用 OpenClaw 触发自动化

```javascript
// 在 OpenClaw agent 中调用 PowerShell
const { exec } = require('child_process');

function runAutomation(scriptPath, params = {}) {
  return new Promise((resolve, reject) => {
    const paramString = Object.entries(params)
      .map(([k, v]) => `-${k} ${v}`)
      .join(' ');

    exec(`powershell.exe -File "${scriptPath}" ${paramString}`, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve({ stdout, stderr });
    });
  });
}

// 示例: 触发备份
runAutomation('D:\\OpenClaw\\.openclaw\\workspace\\automation-scripts\\backups\\daily-backup.ps1')
  .then(result => console.log('Backup completed:', result.stdout))
  .catch(err => console.error('Backup failed:', err));
```

---

## 🛡️ 安全最佳实践

1. **最小权限原则**: 脚本用普通用户运行，需要管理员时用 `Start-Process -Verb RunAs`
2. **保护敏感数据**: 密码/密钥存在 `SecretsManagement` 模块或 Azure Key Vault
3. **代码签名**: 生产环境启用脚本签名
4. **日志审计**: 所有操作记录到 Event Log + 文件
5. **输入验证**: 参数 always 验证，避免注入

```powershell
# 安全存储密码
$cred = Get-Secret -Name 'GitHubPAT' -AsCredential
git remote set-url origin https://$($cred.UserName):$($cred.GetNetworkCredential().Password)@github.com/...
```

---

## 📊 监控与告警

```powershell
# 监控脚本运行状态
$task = Get-ScheduledTask -TaskName "Daily Backup"
if ($task.LastTaskResult -ne 0) {
    # 任务失败，告警
    Send-MailMessage -To "admin@example.com" -Subject "Task Failed: Daily Backup" -Body "Exit code: $($task.LastTaskResult)"
}

# 收集指标
$metrics = @{
    Timestamp = Get-Date
    DiskFree = (Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace
    MemoryFree = (Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory
    ProcessCount = (Get-Process).Count
}
$metrics | ConvertTo-Json | Out-File "C:\Metrics\metrics.json"
```

---

## 🎯 目标: 完全自动化掌控

**短期** (今日):
- ✅ 学习 PowerShell 核心 cmdlets
- ✅ 创建 3 个实用脚本 (备份、健康检查、软件安装)
- ✅ 配置计划任务自动运行

**中期** (本周):
- 🔄 实现 Git 自动化 push (解决认证问题)
- 🔄 自动化 Reddit 发布流程
- 🔄 API 监控 + auto-restart on failure

**长期** (本月):
- 🎯 所有手动步骤消除
- 🎯 系统自愈能力 (自动重启服务、清理磁盘)
- 🎯 实时告警 (邮件/Telegram)

---

**学习时间**: 16:34-18:00 (深度沉浸)  
**产出**: 本指南 + 5+ 实用脚本 + 完全自动化部署

开始实践: 用 PowerShell 实现 GitHub 自动认证 + push！
