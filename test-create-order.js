// Test OxaPay create-order endpoint
const https = require('https');

const BASE = 'https://api-marketplace-red.vercel.app';

function fetch(path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.write(body);
    req.end();
  });
}

async function testCreateOrder() {
  console.log('Testing OxaPay create-order...\n');

  try {
    const res = await fetch('/api/oxapay/create-order', JSON.stringify({
      amount: '0.01',
      description: 'API Marketplace Demo - 100 Calls',
      currency: 'USDT',
      productId: 'demo-100-calls'
    }));

    console.log(`Status: ${res.status}`);
    console.log('Response:', res.body);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testCreateOrder().catch(console.error);