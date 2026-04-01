# 🔧 Clash Optimization for Browser Automation

## Problem Summary
- Playwright/Chromium fails via Clash mixed-port (7890)
- Chrome itself cannot access Reddit through Clash
- SOCKS5 (7891) connection fails too

## Root Causes
1. Clash's mixed-port HTTPS CONNECT implementation may not fully comply with RFC, causing Playwright to drop connection.
2. Some proxy nodes are dead for Reddit (blocked by Reddit or network issues).
3. System-wide proxy may interfere with Clash's DIRECT routing.

## Solutions (Try in Order)

---

### **Solution 1: Use SOCKS5 Only (Simplest)**

1. Open Clash Party → Settings (⚙️) → Mixed Port
2. **Disable** "Enable Mixed Port"
3. **Enable** "Enable SOCKS Port" (ensure port 7891)
4. Save & Restart Clash

5. **Test SOCKS5 manually**:
   ```powershell
   # In PowerShell, test with curl (if available)
   curl -x socks5://127.0.0.1:7891 https://www.reddit.com -I
   ```
   Should return HTTP 200.

6. **Update Playwright scripts** to use SOCKS5:
   ```javascript
   await browser.newContext({
     proxy: { server: 'socks5://127.0.0.1', port: 7891 }
   });
   ```

---

### **Solution 2: Create Dedicated "Automation" Policy Group**

Edit your profile configuration (remote or local) and add:

```yaml
proxy-groups:
  - name: "🔄 Automation"
    type: select
    proxies:
      - "\U0001F1FA\U0001F1F8US_1|1.8MB/s"
      - "\U0001F1FA\U0001F1F8US_2|1.3MB/s"
      - DIRECT
    # Use this group for automation only

rules:
  # High priority: force automation traffic to use the dedicated group
  - DOMAIN-SUFFIX,reddit.com,🔄 Automation
  - DOMAIN-SUFFIX,www.reddit.com,🔄 Automation
  - DOMAIN-SUFFIX,old.reddit.com,🔄 Automation
  - DOMAIN-SUFFIX,redditmedia.com,🔄 Automation
  - DOMAIN-SUFFIX,redd.it,🔄 Automation

  # Your other rules follow...
```

Then in Clash, set "Auto" policy to "🔄 Automation" or just apply the profile.

**Why this works**: You control exactly which node Reddit traffic uses, instead of default MATCH.

---

### **Solution 3: Enable TUN Mode (Advanced)**

TUN mode bypasses application proxy completely.

1. In Clash Party → Settings → TUN/Tap (TUN 模式)
2. Enable TUN
3. Set "Stack" to `mixed` (or `system`)
4. Enable "Auto Route"
5. Restart Clash and your computer (sometimes needed)

Now all traffic goes through Clash at OS level, including Playwright's direct connections (no proxy settings needed).

**Note**: Windows TUN driver may need installation (Clash Party includes it).

---

### **Solution 4: Switch to Clash.Meta or sing-box**

Clash.Meta (mihomo) is more up-to-date. If your Clash Party is old, upgrade:

1. Download latest Clash.Meta from: https://github.com/MetaCubeX/mihomo/releases
2. Replace `Clash Party.exe` (or use standalone core)
3. Import your config
4. Test again

Expected: SOCKS5 and mixed-port both work perfectly.

---

## 🎯 **My Recommendation**

**Do Solution 1 + Solution 2**:

1. Disable mixed-port, use SOCKS5 only (7891) → simpler protocol
2. Create an "Automation" policy group with 2-3 US nodes + DIRECT fallback
3. Assign reddit.com rules to that group
4. Restart Clash and test

This gives you:
- ✅ Clean separation of automation traffic
- ✅ Ability to quickly switch nodes if one fails
- ✅ No mixed-port compatibility issues

---

## 📝 **How to Edit Profile in Clash Party**

1. Open Clash Party
2. Go to "Profiles" (配置文件)
3. Click the "✏️" edit icon next to active profile
4. Scroll to `proxy-groups:` section → add new group
5. Scroll to `rules:` → add Reddit rules at the very top
6. Click "Save" → "Reload" profile
7. Switch to the new group in "Proxy" tab

---

## ⏱️ **Estimated Fix Time**: 10 minutes

After fixing, run:

```powershell
cd D:\OpenClaw\.openclaw\workspace\affiliate-site
node scripts/reddit-socks5.js
```

Should work.

---

## 🆘 **Still Not Working?**

If all fails:
1. Use the **Desktop Auto-Poster** (AutoHotkey/PowerShell) which simulates real mouse/keyboard, bypassing network restrictions entirely (but still needs network).
2. Or **deploy to cloud** (Railway/Render) where network isn't restricted.

---

*Last updated: 2026-03-28 by JARVIS*
