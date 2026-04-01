# MEMORY.md - Long-term Memory

## 2026-03-31: API Marketplace - Production Timeout Fix

### Problem
Vercel production deployment: `/api/run` timed out after 300 seconds.

### Root Cause
`lib/skills/node-doctor.js` used `child_process.exec` to run:
- `openclaw gateway status`
- `ping -n 1 gateway.openclaw.ai`

These subprocess calls are **blocked in Vercel serverless environment**, causing the function to hang until timeout.

### Fixes Applied (2026-03-31)
1. **KV Timeout** (`lib/license-manager.js`):
   - Added `AbortController` with 5s timeout to all `fetch` calls to Upstash KV
   - Prevents indefinite waiting on KV REST API

2. **Vercel-Compatible Skill** (`lib/skills/node-doctor.js`):
   - Removed all `child_process.exec` usage
   - `checkGatewayStatus()`: Returns environment-based result (Vercel vs local)
   - `testConnectivity()`: Uses `fetch` to self-health endpoint with 3s timeout
   - Fully async, no blocking calls

3. **Code Cleanup** (`api/index.js`):
   - Removed unused `verifyPurchase` (Gumroad) function
   - Simplified main handler

### Deployment
- Re-deployed to Vercel: https://api-marketplace-red.vercel.app
- Production URL alias: https://api-marketplace-red.vercel.app

### Verification
- Health check endpoint: `/api/health` responds quickly
- Test mode: `test=true` bypasses license, runs `node-connection-doctor` without exec
- Expected: No more 300s timeouts; functions complete within seconds

### Next Steps
1. Perform end-to-end test with real purchase (small amount via OxaPay)
2. Monitor Vercel logs for any remaining edge cases
3. If more timeouts occur, add more granular logging around KV ops

### Technical Notes
- Vercel Functions timeout: 300s (5min)
- Upstash KV typical latency: <100ms
- With timeouts, worst-case failure: ~6s (KV 5s + health check 3s)

---

## 2026-03-31: API Marketplace Testing Blocked (24h)

### Blocker
- User's OxaPay account restrictions require 24h wait before testing
- End-to-end validation (payment → license → quota) cannot proceed immediately
- Show HN publication postponed pending successful test

### Current State
- ✅ Production deployed: https://api-marketplace-red.vercel.app
- ✅ Code fixes applied (create-order logic, health check oxapay flag)
- ✅ Price adjusted to $1.00 (meets OxaPay minimum)
- ⏳ User testing scheduled: ~2026-04-01 09:57 (Asia/Shanghai)

### Action Items
- Assistant to proceed with autonomous work (new project exploration)
- User will notify when testing completes
- Show HN draft ready in `SHOW-HN-DRAFT.md` (pure English)

---

## 2026-03-31: Hourly Status Reporting (10:15)

### Instruction
User requested: "每隔一小时汇报一下工作状态" (Report work status every hour)

### Implementation
- Will provide concise status updates approximately every hour
- Covers: current project, progress, blockers, next steps
- Format: brief bullet points, actionable

### First Report Due
- 11:15 Asia/Shanghai (1 hour from 10:15)
- Subsequent reports every hour thereafter

---

## 2026-03-31: ClawHub Skills Upload Preparation (15:46)

### Action
Created 4 skill packages ready for ClawHub upload (all free + donation-funded).

### Skills Prepared
1. **idea-validator** - Mom Test validation, free, Tron/PayPal donations
2. **opportunity-scanner** - Micro-SaaS opportunity finder, free, donation-supported
3. **node-connection-doctor** - OpenClaw diagnostics, free, donation-supported
4. **vercel-deploy** - Vercel CLI wrapper, free, donation-supported

### Package Structure (per skill)
- SKILL.md (full spec, pure English)
- scripts/ (executable code)
- references/ (docs)
- screenshots/ (placeholder)
- README.md (with donation info)
- .clawhub/meta.json (pricing: free, funding: Tron + PayPal)

### Funding Details
- PayPal: algea@163.com
- Tron (TRX/USDT): TBFKnXJtdMu3SbY8q6Z8ikuGY3aPUGQQih

### Upload Status
- ❌ **DEPRECATED** (2026-04-01 10:55) – No API automation, manual upload burden too high
- ✅ Alternative: All 4 skills published to npm (free + donation-funded)
- ✅ Source code on GitHub: xinjianghuo/openclaw-api-marketplace

### Reason for Deprecation
- No API for automated upload
- Manual web form filing + screenshots required
- Automation cost >> benefits
- npm + GitHub provide better reach and automation

### Next Steps (Post-ClawHub)
1. Promote npm packages via docs, tutorials, social
2. Focus on GitHub stars/forks for discoverability
3. Consider Docker Hub container publishing (optional)

---

## 2026-04-01: API Marketplace - Pre-Test Status (06:52)

### Current Status
- OxaPay 24h account restriction still in effect; testing window opens ~09:57 (Asia/Shanghai)
- Production deployment stable at https://api-marketplace-red.vercel.app
- Nightly learning (01:00-04:00) completed: reviewed Vercel serverless constraints and KV timeout handling
- Opportunity scanning attempted but Brave API key missing; need to configure `BRAVE_API_KEY`
- Next action: Run end-to-end test once OxaPay accessible
- Hourly status reports ongoing (next ~07:52)

### Notes
- API key for web search not available in environment; opportunity scanning requires fix
- Continue monitoring; proceed with manual checks until resolved

---

## 2026-04-01: ClawHub Deprecation (10:55)

### Decision
ClawHub platform marked **deprecated** for automated distribution.

### Reason
- **No API**: Cannot automate upload process
- **Manual overhead**: Packaging, screenshots, web form submission
- **Low ROI**: 4 skills ready but manual effort > automation benefits
- **Alternatives available**: npm + GitHub provide better automation

### Current State
- ✅ All 4 skills already published to **npm**:
  - `openclaw-idea-validator`
  - `openclaw-opportunity-scanner`
  - `openclaw-node-connection-doctor`
  - `ocl-vercel-deploy`
- ✅ Code pushed to **GitHub**: `xinjianghuo/openclaw-api-marketplace`
- ❌ ClawHub upload: **Aborted** – no automation, no manual execution

### Impact
- Skills distribution now via npm (package managers) + GitHub (source)
- ClawHub-related documentation moved to `CLAUHUB-UPLOAD-MANIFEST.md` (deprecated status)
- No future ClawHub uploads unless API becomes available

### Action Taken
- Updated `CLAUHUB-UPLOAD-MANIFEST.md` with deprecation notice
- Updated `HEARTBEAT.md` to remove ClawHub checks
- Focus shifted to npm/GitHub promotion strategies
