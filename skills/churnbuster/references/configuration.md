# ChurnBuster Configuration Reference

## Secrets

| Secret | Description | Example |
|--------|-------------|---------|
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (from Dashboard) | `whsec_123...` |
| `SMTP_HOST` | SMTP server host (default: smtp.sendgrid.net) | `smtp.sendgrid.net` |
| `SMTP_PORT` | SMTP port (default: 587) | `587` |
| `SMTP_USER` | SMTP username (SendGrid: `apikey`) | `apikey` |
| `SMTP_PASS` | SMTP password or SendGrid API key | `SG.xxxxx` |
| `NOTIFY_EMAIL` | Admin alert email | `admin@example.com` |

## CLI Commands

```bash
# Test configuration and exit
openclaw skill run churnbuster --test

# Run webhook listener on port 3000
openclaw skill run churnbuster --port 3000

# Run with custom port
openclaw skill run churnbuster --port 8080

# View dashboard (reads log file)
openclaw skill dashboard churnbuster
```

## cron Integration

Start on boot (Linux):

```bash
@reboot /usr/bin/openclaw skill run churnbuster --port 3000 >> /var/log/churnbuster.log 2>&1
```

Or via OpenClaw cron:

```bash
openclaw cron add "@reboot" "openclaw skill run churnbuster --port 3000"
```

## Webhook Setup (Stripe)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.com/webhook` (or ngrok for testing)
4. Version: latest
5. Select events: `payment_intent.payment_failed`
6. Copy "Signing secret" to `STRIPE_WEBHOOK_SECRET`

## Testing with Stripe CLI

```bash
# Forward webhook to localhost:3000
stripe listen --forward-to localhost:3000/webhook

# Trigger test event
stripe trigger payment_intent.payment_failed
```

## Email Templates

ChurnBuster uses simple HTML templates. To customize:

1. Edit `templates/email.html` in skill directory
2. Variables: `{{customer_email}}`, `{{payment_intent_id}}`, `{{retry_url}}`
3. Reload skill to pick up changes

## Troubleshooting

**Webhook signature mismatch**:
- Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check that webhook URL is correct (no trailing slash issues)

**Emails not sending**:
- Verify SendGrid API key has "Mail Send" permission
- Check SMTP credentials
- Look at logs for SMTP errors

**Port already in use**:
- Choose another port: `--port 8081`
- Or stop existing process on port 3000

---

*MVP configuration - will expand in future versions*
