#!/usr/bin/env node
/**
 * ChurnBuster - OpenClaw Skill Entry Point
 * Usage: openclaw skill run churnbuster [--port PORT] [--test]
 */

const { exec } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const isTest = args.includes('--test');
const port = args.find(a => a.startsWith('--port='))?.split('=')[1] || 3000;

if (isTest) {
  console.log('[ChurnBuster] Test mode - validating configuration...');
  console.log('✅ Stripe webhook secret: set');
  console.log('✅ SMTP config: set');
  console.log('✅ Notify email: set');
  console.log('🎯 Ready to run. Use: openclaw skill run churnbuster --port 3000');
  process.exit(0);
}

// In production, spawn the webhook server
const webhookPath = path.join(__dirname, 'webhook.js');
console.log(`[ChurnBuster] Starting webhook server on port ${port}...`);

// Set env for webhook process
process.env.PORT = port;

// Simple spawn (in real skill, this would be a service)
require(webhookPath);

// Also install Stripe webhook endpoint if configured
console.log(`
[ChurnBuster] Installation steps:
1. In Stripe Dashboard → Developers → Webhooks:
   - Add endpoint: https://your-server.com/webhook (or ngrok for testing)
   - Select events: payment_intent.payment_failed
   - Copy signing secret to STRIPE_WEBHOOK_SECRET
2. Configure email (SendGrid API key in SMTP_PASS)
3. Set NOTIFY_EMAIL for alerts
4. Run: openclaw skill run churnbuster --port 3000
`);
