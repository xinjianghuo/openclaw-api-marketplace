# ChurnBuster

**Type**: Finance & Revenue  
**Audience**: E-commerce, SaaS Startups, Digital Creators  
**Price**: $49/month (annual: $499)  
**Tags**: stripe, payments, recovery, churn, revenue, automation

---

## 🎯 What Problem Does This Solve?

Online businesses lose ~10% of revenue to failed payments. Manual recovery is time-consuming and error-prone. Existing tools are expensive ($79-99/month) and over-engineered.

ChurnBuster automates the entire recovery process:
- Detects Stripe payment failures in real-time
- Schedules intelligent retries (1h, 6h, 24h, 3d)
- Emails customers with one-click update links
- Tracks recovery rate and saved revenue

All for a fraction of the cost.

---

## ✨ Key Features

1. **Real-time webhook processing** - Instant detection via Stripe webhooks
2. **Smart retry engine** - Adaptive intervals based on failure reason
3. **Customer emails** - Pre-built templates, customizable branding
4. **Dashboard** - Recovery rate, revenue saved, customer trends
5. **OpenClaw native** - Runs on your existing infrastructure, zero extra cost
6. **5-minute setup** - Configure Stripe webhook and API keys, done

---

## 🚀 Quick Start

```bash
# Install from ClawHub
openclaw skill install churnbuster

# Configure secrets (Stripe webhook secret, SendGrid API key)
openclaw skill config churnbuster

# Test mode
openclaw skill run churnbuster --test

# Start webhook listener
openclaw skill run churnbuster --port 3000

# Add to cron (run on boot)
openclaw cron add "@reboot" "openclaw skill run churnbuster --port 3000"
```

---

## 📊 Dashboard

Access via: `openclaw skill dashboard churnbuster`

Shows:
- Recovery rate (%)
- Revenue saved (last 7/30 days)
- Active retries
- Customer email status

---

## 💰 Pricing & Value

- **Cost**: $49/month (or $499/year = 2 months free)
- **Time saved**: ~10 hours/month (manual dunning)
- **ROI**: Usually pays for itself in first week by recovering 1-2 failed payments
- **Trial**: 7 days free, no credit card required

---

## 🔐 Security

- All data stored locally (OpenClaw node)
- Stripe API keys stored in OpenClaw secrets (encrypted)
- No third-party servers (except SendGrid for email, optional)
- Webhook signature verification enforced

---

## 🧪 Trial & Onboarding

1. Sign up for Stripe test mode
2. Use test webhook secret (`whsec_test`)
3. Send test events via Stripe CLI: `stripe trigger payment_intent.payment_failed`
4. See email logs and retry queue

---

## 📞 Support

- Issues: https://github.com/your-username/churnbuster/issues
- Docs: `references/configuration.md`

---

**Ready?** `openclaw skill install churnbuster`
