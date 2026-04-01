# ChurnBuster

> Recover failed payments automatically. Built for OpenClaw.

---

## Installation

```bash
openclaw skill install churnbuster
```

## Configuration

Set these secrets in OpenClaw:

```bash
openclaw secrets set STRIPE_WEBHOOK_SECRET whsec_...
openclaw secrets set SMTP_USER apikey
openclaw secrets set SMTP_PASS your-sendgrid-api-key
openclaw secrets set NOTIFY_EMAIL you@example.com
```

## Usage

```bash
# Test configuration
openclaw skill run churnbuster --test

# Start webhook server
openclaw skill run churnbuster --port 3000

# View dashboard
openclaw skill dashboard churnbuster
```

## Stripe Setup

1. Get webhook signing secret from Stripe Dashboard
2. Add endpoint: `https://your-server/webhook` (or use ngrok for testing)
3. Select event: `payment_intent.payment_failed`
4. Copy secret to `STRIPE_WEBHOOK_SECRET`

## How It Works

1. Stripe sends `payment_intent.payment_failed` to your webhook
2. ChurnBuster verifies signature and schedules retries
3. Customer receives email with update link
4. Retry runs at 1h, 6h, 24h, 3d intervals
5. Successful payment → remove from queue
6. All failures after 4 retries → mark as lost

## Support

Email: support@your-domain.com

---

Price: $49/month | 7-day free trial
