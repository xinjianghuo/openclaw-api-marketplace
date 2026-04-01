/**
 * Simulate OxaPay webhook for successful payment
 * POST to local server for testing
 */

const https = require('https');

const webhookUrl = 'https://api-marketplace-red.vercel.app/api/oxapay/webhook';

// Simulate webhook payload from OxaPay
const payload = {
  order_id: 'order_1774914660231_2u64mbb0e',
  trackId: '117611411',
  status: 'paid',
  amount: '9.90',
  currency: 'USDT',
  tx_hash: '0x1234567890abcdef',
  email: 'test@example.com',
  description: 'Node Doctor API - 100 Calls',
  pay_time: Date.now() / 1000
};

const options = {
  hostname: 'api-marketplace-red.vercel.app',
  path: '/api/oxapay/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(payload))
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
});

req.write(JSON.stringify(payload));
req.end();
