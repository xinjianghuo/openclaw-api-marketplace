#!/usr/bin/env node
/**
 * ChurnBuster - Stripe Payment Failure Recovery
 * MVP v1.0 - Core webhook listener
 */

const http = require('http');
const crypto = require('crypto');

// Configuration from OpenClaw secrets
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.sendgrid.net';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER || 'apikey';
const SMTP_PASS = process.env.SMTP_PASS || process.env.SENDGRID_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'admin@example.com';

// Simple in-memory store (MVP, will use DB later)
const retryQueue = [];
const recoveryLog = [];

function verifySignature(payload, signature) {
  const expected = crypto.createHmac('sha256', STRIPE_WEBHOOK_SECRET)
                         .update(payload)
                         .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature.replace('t=', '').split(',')[1], 'hex'), Buffer.from(expected, 'hex'));
}

function parseEvent(payload, signature) {
  if (!verifySignature(payload, signature)) {
    throw new Error('Invalid signature');
  }
  return JSON.parse(payload);
}

function scheduleRetry(customerId, paymentIntentId, attempt = 1) {
  const delays = [3600, 21600, 86400, 259200]; // 1h, 6h, 24h, 3d
  if (attempt > delays.length) return; // give up after 4 retries
  
  retryQueue.push({
    customerId,
    paymentIntentId,
    attempt,
    scheduledAt: Date.now() + delays[attempt-1]
  });
  
  console.log(`[ChurnBuster] Scheduled retry #${attempt} for payment ${paymentIntentId}`);
}

function sendRecoveryEmail(customerEmail, paymentIntentId, retryUrl) {
  // Simplified: use SendGrid or SMTP
  const subject = 'Action required: Your payment failed';
  const html = `
    <h1>Payment Failed</h1>
    <p>We couldn't process your recent payment. Please update your payment method to continue your service.</p>
    <p><a href="${retryUrl}">Update Payment</a></p>
    <p>Or reply to this email for assistance.</p>
  `;
  
  // In MVP, just log
  console.log(`[ChurnBuster] Would send email to ${customerEmail} for ${paymentIntentId}`);
  recoveryLog.push({ email: customerEmail, paymentIntentId, sentAt: new Date() });
}

function processPaymentFailed(event) {
  const pi = event.data.object;
  const customerId = pi.customer;
  const email = event.data.object.receipt_email || 'no-email@example.com';
  
  console.log(`[ChurnBuster] Payment failed for customer ${customerId}, amount ${pi.amount}`);
  
  // Schedule retries
  scheduleRetry(customerId, pi.id, 1);
  
  // Send email notification
  sendRecoveryEmail(email, pi.id, `https://your-site.com/update-payment?pi=${pi.id}`);
  
  return { status: 'scheduled', retries: 4 };
}

function processWebhook(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const signature = req.headers['stripe-signature'];
    try {
      const event = parseEvent(body, signature);
      
      if (event.type === 'payment_intent.payment_failed') {
        const result = processPaymentFailed(event);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', ...result }));
      } else {
        res.writeHead(200);
        res.end('Ignored event type');
      }
    } catch (e) {
      console.error('[ChurnBuster] Error:', e.message);
      res.writeHead(400);
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}

// Start server
const port = process.env.PORT || 3000;
http.createServer(processWebhook).listen(port, () => {
  console.log(`[ChurnBuster] Webhook listener running on port ${port}`);
  console.log('Ready to receive Stripe events.');
});

// Export for OpenClaw skill integration
module.exports = { processPaymentFailed, scheduleRetry, sendRecoveryEmail };
