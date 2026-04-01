# ClawHub API 发布命令

## Node Connection Doctor

```bash
curl -X POST https://clawhub.com/api/v1/skills \
  -H "Authorization: Bearer clh_2iRFN2GxdihpjcLUd6Ig6iwStzDa8Bi6PH69Ee9Hr1E" \
  -F "file=@D:/OpenClaw/.openclaw/workspace/releases/node-connection-doctor-v1.0.zip" \
  -F "name=Node Connection Doctor" \
  -F "description=Automatically diagnose OpenClaw node connection issues and generate fix commands. Supports Android, iOS, macOS pairing problems, QR code failures, tunnel connectivity, and more. One-click troubleshooting for your OpenClaw deployment." \
  -F "category=System & Infrastructure" \
  -F "tags=openclaw,node,connection,troubleshooting,pairing,qr-code,tailscale" \
  -F "price=29" \
  -F "trial_days=7"
```

## Security Audit Assistant

```bash
curl -X POST https://clawhub.com/api/v1/skills \
  -H "Authorization: Bearer clh_2iRFN2GxdihpjcLUd6Ig6iwStzDa8Bi6PH69Ee9Hr1E" \
  -F "file=@D:/OpenClaw/.openclaw/workspace/releases/security-audit-assistant-v1.0.zip" \
  -F "name=Security Audit Assistant" \
  -F "description=Run CIS-inspired security audits on any OpenClaw-managed node. Checks SSH, firewall, updates, passwords, logging, and more. Generates human-readable reports with one-line fix commands. Schedule weekly scans via cron. Perfect for DevOps and small teams." \
  -F "category=Security" \
  -F "tags=security,audit,compliance,cis,ssh,firewall,hardening" \
  -F "price=29" \
  -F "trial_days=7"
```

---

## 执行步骤

1. 打开 PowerShell（管理员权限非必需）
2. 复制第一条命令 → 粘贴执行
3. 等待响应：`{"status":"success","skill_id":"..."}`
4. 复制第二条命令 → 粘贴执行
5. 记录返回的 skill_id（用于后续追踪）

预期输出：
- `201 Created` 或 `200 OK`
- JSON 包含 `skill_url`（ClawHub 页面链接）

要我直接在终端运行这些 curl 命令吗？
