# ClawHub API 发布命令 (clawhub.ai)

## Node Connection Doctor

```bash
curl -X POST https://clawhub.ai/api/v1/skills \
  -H "Authorization: Bearer clh_2iRFN2GxdihpjcLUd6Ig6iwStzDa8Bi6PH69Ee9Hr1E" \
  -F "name=Node Connection Doctor" \
  -F "description=Automatically diagnose OpenClaw node connection issues and generate fix commands. Supports Android, iOS, macOS pairing problems, QR code failures, tunnel connectivity, and more. One-click troubleshooting for your OpenClaw deployment." \
  -F "category=System & Infrastructure" \
  -F "tags=openclaw,node,connection,troubleshooting,pairing,qr-code,tailscale" \
  -F "price=29" \
  -F "trial_days=7" \
  -F "file=@D:/OpenClaw/.openclaw/workspace/releases/node-connection-doctor-v1.0.zip"
```

## Security Audit Assistant

```bash
curl -X POST https://clawhub.ai/api/v1/skills \
  -H "Authorization: Bearer clh_2iRFN2GxdihpjcLUd6Ig6iwStzDa8Bi6PH69Ee9Hr1E" \
  -F "name=Security Audit Assistant" \
  -F "description=Run CIS-inspired security audits on any OpenClaw-managed node. Checks SSH, firewall, updates, passwords, logging, and more. Generates human-readable reports with one-line fix commands. Schedule weekly scans via cron. Perfect for DevOps and small teams." \
  -F "category=Security" \
  -F "tags=security,audit,compliance,cis,ssh,firewall,hardening" \
  -F "price=29" \
  -F "trial_days=7" \
  -F "file=@D:/OpenClaw/.openclaw/workspace/releases/security-audit-assistant-v1.0.zip"
```

---

**执行**：
1. 复制上面的第一条命令，粘贴到 PowerShell 执行
2. 等待响应：`{"status":"success","skill_url":"..."}`
3. 复制第二条命令，执行

注意：确保文件路径正确（使用 / 而非 \）
