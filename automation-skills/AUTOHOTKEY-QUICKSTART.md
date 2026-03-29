# AutoHotkey v2 Quick Start for Windows Automation

## 📦 Installation

```powershell
# Using winget (recommended)
winget install AutoHotkey

# Or download from https://www.autohotkey.com/
```

---

## 🎯 Core Concepts

### Script Structure (AHK v2)

```ahk
; Single-line comment
/*
Multi-line comment
*/

#Requires AutoHotkey v2.0  ; Ensure v2

; Hotkeys (keyboard shortcuts)
^!s::  ; Ctrl+Alt+S
    MsgBox("Hello, World!")
return

; Hotstrings (text expansion)
::btw::by the way
::omw::on my way

; Mouse automation
#IfWinActive("Notepad")  ; Context: only in Notepad
F1::
    MouseMove(100, 200)
    Click()
    Send("Hello")
return
```

---

## 🔧 Common Tasks

### 1. Application Control

```ahk
; Launch app
Run("notepad.exe")
Run("C:\Program Files\App\app.exe")

; Wait for window
WinWait("Untitled - Notepad")
WinActivate("Untitled - Notepad")

; Send keystrokes to specific window
ControlSend("Edit1", "Hello{Enter}", "Untitled - Notepad")

; Close app
WinClose("Untitled - Notepad")
```

---

### 2. Window Management

```ahk
; Arrange windows
WinMove("A", , 0, 0, 800, 600)  ; Active window to position 0,0 size 800x600
WinMaximize("A")
WinMinimize("A")

; Wait for window to appear
WinWaitActive("Calculator")

; Get window info
WinGetPos(&x, &y, &w, &h, "A")
MsgBox("Window at " x "," y " size " w "x" h)
```

---

### 3. File Operations

```ahk
; Read file
file := FileOpen("C:\test.txt", "r")
content := file.Read()
file.Close()

; Write file
file := FileOpen("C:\output.txt", "w")
file.Write("Hello`r`nWorld")
file.Close()

; Get folder contents
Loop Files "C:\Logs\*.log"
{
    MsgBox(A_LoopFileFullPath " size: " A_LoopFileSize)
}
```

---

### 4. Registry Manipulation

```ahk
; Read registry
val := RegRead("HKEY_CURRENT_USER\Software\MyApp", "Setting")
MsgBox("Value: " val)

; Write registry
RegWrite("REG_SZ", "HKEY_CURRENT_USER\Software\MyApp", "NewSetting", "Enabled")

; Delete registry key/value
RegDelete("HKEY_CURRENT_USER\Software\MyApp", "OldSetting")
```

---

### 5. Network Requests

```ahk
; HTTP GET
whr := ComObject("WinHttp.WinHttpRequest.5.1")
whr.Open("GET", "https://api.example.com/health")
whr.Send()
response := whr.ResponseText
MsgBox(response)

; With headers
whr.SetRequestHeader("Authorization", "Bearer TOKEN")
```

---

## 📋 Useful Scripts for Node Doctor

### Script 1: **Daily Backup Hotkey**

```ahk
^!b::  ; Ctrl+Alt+B
    ; Compress Node Doctor logs
    RunWait('powershell -Command "Compress-Archive -Path D:\Logs\* -DestinationPath D:\Backups\logs_$(FormatTime(, 'yyyyMMdd')).zip -Force"')
    ; Upload to backup drive
    FileCopy("D:\Backups\logs_*.zip", "E:\OffsiteBackup\", 1)
    TrayTip("Backup", "Daily logs backed up successfully", 1)
return
```

---

### Script 2: **API Health Monitor Tray**

```ahk
#SingleInstance Force
#Persistent
CoordMode("ToolTip", "Screen")

; Check API every 30 minutes
SetTimer(CheckAPI, 30 * 60 * 1000)
return

CheckAPI() {
    whr := ComObject("WinHttp.WinHttpRequest.5.1")
    try {
        whr.Open("GET", "https://api-marketplace-pearl.vercel.app/api/health")
        whr.SetTimeouts(5000, 5000, 5000, 10000)
        whr.Send()
        status := whr.Status

        if (status = 200) {
            TrayTip("API Health", "✅ Healthy", 1, 1)
        } else {
            TrayTip("API Health", "❌ Down! Status: " status, 1, 17)  ; Icon error
            ; Play alert sound
            SoundBeep(1000, 500)
        }
    } catch {
        TrayTip("API Health", "❌ Error: " A_LastError, 1, 17)
    }
}

; Right-click tray icon for menu
TraySetIcon("shell32.dll", 1)
Menu Tray, Standard
Menu Tray, Add, "Check Now", CheckAPI
Menu Tray, Add, "Open API Health", (*) => Run("https://api-marketplace-pearl.vercel.app/api/health")
Menu Tray, Add, "Exit", (*) => ExitApp()
return
```

---

### Script 3: **Quick Log Viewer**

```ahk
^!l::  ; Ctrl+Alt+L
    ; Open today's log file with filtering
    logFile := "C:\Logs\health-" FormatTime(, "yyyyMMdd") ".txt"
    if FileExist(logFile) {
        Run("notepad.exe " logFile)
    } else {
        MsgBox("No log file for today yet.")
    }
return
```

---

### Script 4: **Automated Deployment Assistant**

```ahk
; Deploy Node Doctor API hotkey
^!d::  ; Ctrl+Alt+D
    MsgBox("Deployment Steps:`n`n1. Pull latest code`n2. Build`n3. Deploy to Vercel`n`nStart now?", , "YesNo")
    if (MsgResult = "Yes") {
        ; Step 1: Git pull
        RunWait("powershell -Command `"cd 'D:\OpenClaw\.openclaw\workspace\api-marketplace'; git pull origin main`"", , "Hide")
        ; Step 2: Install deps
        RunWait("powershell -Command `"cd 'D:\OpenClaw\.openclaw\workspace\api-marketplace'; npm install`"", , "Hide")
        ; Step 3: Deploy
        RunWait("powershell -Command `"cd 'D:\OpenClaw\.openclaw\workspace\api-marketplace'; vercel --prod --force`"")
        TrayTip("Deploy", "✅ Deployment completed", 2)
    }
return
```

---

## 🎨 Compiling Scripts to EXE

```powershell
# Using Ahk2Exe (comes with AutoHotkey)
# Right-click .ahk file → Compile Script (GUI)
# Or command line:
Ahk2Exe.exe /in "myscript.ahk" /out "myscript.exe" /icon "icon.ico"
```

---

## 📚 Resources

- **Official Docs**: https://www.autohotkey.com/docs/
- **AHK v2 Migration**: https://www.autohotkey.com/v2/
- **Community**: https://www.autohotkey.com/boards/
- **IDE**: VS Code + AutoHotkey Plus extension

---

**Best for**:  
✅ Simple GUI automation (form filling, clicks)  
✅ Global hotkeys  
✅ Quick text expansion  
❌ Complex web automation (use Playwright instead)  
❌ Headless scripting (use PowerShell)

---

*Last Updated: 2026-03-28 17:00*