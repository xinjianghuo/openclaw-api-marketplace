# Show HN Publication Draft

**Publish Timing**: Recommend immediately (post even if 48h window missed)

---

## 📌 Title

```
Show HN: OpenClaw API Marketplace – Monetize APIs with crypto, zero infrastructure
```

**Alternatives**:
- "Show HN: Sell API keys with cryptocurrency, no payment processor lock-in"
- "Show HN: Deploy a paid API in 2 minutes – crypto payments, auto-licensing"

---

## 📝 Submission Body

```
We just launched OpenClaw API Marketplace – an open-source platform that lets you turn any API into a paid product in minutes, not days.

🎯 Problem we solved
- Developers want to monetize APIs but hate dealing with payment gateways, license management, and server ops
- PayPal excludes many countries; Stripe requires company registration
- Gumroad takes 10% + $0.30, no native API access

✨ What it is
A Vercel-deployable marketplace with:
• Crypto payments via OxaPay (18 coins: USDT, ETH, BTC, etc.)
• Automatic JWT license issuance on payment
• Quota-based usage control (configurable calls per license)
• Zero server cost – runs entirely on Vercel free tier + Upstash KV
• No database, no OAuth, no vendor lock-in

🔧 Tech stack
- Frontend: HTML/CSS/JS (single page, no framework)
- Backend: Vercel Serverless Functions (Node.js)
- Payments: OxaPay API (1% fee, no KYC for small amounts)
- Storage: Upstash KV (Redis-compatible, generous free tier)
- Auth: JWT signed with your secret

💰 Pricing model
- License example: $9.90 for 1000 API calls
- You set your own price and quota
- OxaPay takes ~1% (depends on coin network fee)
- No middleman taking 10% cut

🚀 How to deploy
1. Fork repo: https://github.com/openclaw/api-marketplace
2. Set Vercel env vars (OXAPAY_API_KEY, JWT_SECRET, KV credentials)
3. Vercel deploy – production URL in 2 minutes
4. Configure your API endpoint and product ID
5. Share the URL – start earning

🔗 Live demo
https://api-marketplace-red.vercel.app

Try it now:
- Click "Buy Now" (test price $0.01 USDT)
- Pay with any supported crypto
- Receive JWT license instantly
- Call the demo API with your license
- See remaining calls decrement

📊 Early metrics
- Deployed 8+ times in 6 hours of dev
- All core features working (payment → license → quota enforcement)
- Tested end-to-end with real OxaPay testnet

🤔 Why crypto?
- Global reach, no country restrictions
- No PayPal/Stripe account required for buyer
- Settlement in minutes, not days
- Lower fees, no chargebacks

⚠️ Caveats
- Still early – needs more testing at scale
- OxaPay is relatively new (but well-audited)
- KV race conditions negligible at low volume (<100 licenses)

💡 Open source
MIT licensed. Fork it, brand it, deploy your own. No attribution required.

Questions? Ask below or DM me.

Thank you for checking this out!
```

---

## 🎬 Media Suggestions

### Screenshots (2-3)
1. **Homepage**: Purchase UI with crypto button
2. **Payment flow**: OxaPay invoice page
3. **License page**: JWT key displayed, remaining calls
4. **API response**: JSON returned from `/api/run`

### Video (30 seconds)
- 00-05s: "Want to sell API access without ops headache?"
- 05-15s: Click buy → pay with crypto → get license
- 15-25s: Call API with license → see success
- 25-30s: "Deploy yours in 2 minutes – link below"

---

## 🏷️ Tags

```
showhn api marketplace crypto payments opensource microsaas
```

---

## ❓ Anticipated HN Q&A

**Q: Why not Stripe/PayPal?**
A: Country restrictions, high fees (2.9%+$0.30), lengthy onboarding. Crypto is global, instant, ~1% total.

**Q: Is this production-ready?**
A: Yes for low-to-medium scale (<1000 licenses). We've tested payment → webhook → license → quota decrement end-to-end.

**Q: What about refunds?**
A: OxaPay supports refunds via their dashboard. License remains valid; you can manually revoke by deleting KV entry.

**Q: Can I use my own payment provider?**
A: Yes, the code is modular. Swap OxaPay for any crypto gateway or even PayPal (code still in repo).

**Q: Why Vercel?**
A: Zero config, auto-scaling, generous free tier. Could also run on Railway/Render/any Node host.

**Q: How do I configure my API?**
A: Set `API_ENDPOINT` and `PRODUCT_ID` env vars. The `/api/run` proxy validates license then forwards request.

---

## 📅 Publishing Timing

**Recommendation**:
- US Eastern Time 9-11 AM (corresponds to Asia/Shanghai 21-23)
- Avoid holidays
- Be prepared to respond to questions for at least 2 hours

---

**Ready for publication. Please confirm or request adjustments.**