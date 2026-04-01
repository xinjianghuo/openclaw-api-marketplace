// Comprehensive test suite for API Marketplace
const https = require('https');

const BASE = 'https://api-marketplace-red.vercel.app';

function fetch(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}

async function runTests() {
  console.log('=== API Marketplace Test Suite ===\n');

  // Test 1: Health check
  console.log('Test 1: Health Check');
  try {
    const health = await fetch('/api/health');
    console.log(`Status: ${health.status}`);
    console.log('Body:', health.body.substring(0, 500));
    console.log();
  } catch (e) {
    console.log('Error:', e.message);
    console.log();
  }

  // Test 2: OxaPay test endpoint
  console.log('Test 2: OxaPay Connectivity');
  try {
    const test = await fetch('/api/oxapay/test');
    console.log(`Status: ${test.status}`);
    console.log('Body:', test.body.substring(0, 500));
    console.log();
  } catch (e) {
    console.log('Error:', e.message);
    console.log();
  }

  // Test 3: License manager health via KV
  console.log('Test 3: KV Connection (via health check details)');
  try {
    const health = await fetch('/api/health');
    if (health.status === 200) {
      const info = JSON.parse(health.body);
      console.log('KV Rest URL configured:', !!info.kvRestUrl);
      console.log('KV Token configured:', !!info.kvToken);
      console.log('KV Connection valid:', info.kv === true);
      console.log('JWT Secret configured:', !!info.jwtSecret);
    }
    console.log();
  } catch (e) {
    console.log('Error:', e.message);
    console.log();
  }

  console.log('=== Tests Complete ===');
}

runTests().catch(console.error);