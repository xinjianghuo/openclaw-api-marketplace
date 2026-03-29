# OpenClaw API Marketplace

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd api-marketplace
npm install
```

### 2. Configure Environment

Create `.env.local`:

```bash
JWT_SECRET=your-random-secret-here
# Vercel KV (optional, for persistence)
VERCEL_KV_REST_API_URL=your_kv_url
VERCEL_KV_REST_API_TOKEN=your_kv_token
GUMROUD_WEBHOOK_SECRET=your_gumroad_webhook_secret
```

Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 4. Setup Gumroad

1. Create product "Node Doctor API - 100 Calls" ($9.9)
2. Enable License Keys (Random 16 chars)
3. Add webhook: `https://your-app.vercel.app/api/webhook/gumroad`
4. Set webhook secret in env

---

## 📡 API Endpoints

### POST `/api/run`

Run a skill with license verification.

**Body**:
```json
{
  "skill": "node-connection-doctor",
  "input": { "verbose": true },
  "licenseKey": "OC-xxxxx"
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "timestamp": "2026-03-27T...",
    "healthScore": 95,
    "summary": "Healthy",
    "steps": [...]
  },
  "remainingCalls": 99,
  "licenseType": "calls"
}
```

### GET `/api/health`

Health check endpoint.

---

## 🧪 Test Locally

```bash
# Start dev server
npm run dev

# Test health
curl http://localhost:3000/api/health

# Test API (需先购买获取 licenseKey)
curl -X POST http://localhost:3000/api/run \
  -H "Content-Type: application/json" \
  -d '{"skill":"node-connection-doctor","input":{},"licenseKey":"YOUR_KEY"}'
```

---

## 💰 Pricing

| Plan | Price | Calls |
|------|-------|-------|
| Starter | $9.9 | 100 |
| Pro | $49 | Unlimited (monthly) |
| Enterprise | $99 | SLA + support |

---

## 📝 License Key System

- Each key is a JWT token signed with `JWT_SECRET`
- Keys are rate-limited per user
- Remaining calls stored in Vercel KV (or memory for dev)
- Automatic webhook issuance on Gumroad purchase

---

## 🔧 Available Skills

1. **node-connection-doctor** - Diagnose OpenClaw node connection issues
   - Input: `{ "verbose": boolean }`
   - Returns: health score, step-by-step results

---

## 📞 Support

For issues or custom skill requests: support@yourdomain.com
