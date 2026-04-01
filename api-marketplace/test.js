#!/usr/bin/env node
/**
 * Local test script for API marketplace
 */

const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testHealth() {
  const res = await fetch(`${API_URL}/api/health`);
  console.log('Health:', await res.json());
}

async function testRunSkill(licenseKey) {
  const res = await fetch(`${API_URL}/api/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      skill: 'node-connection-doctor',
      input: { verbose: false },
      licenseKey
    })
  });
  const data = await res.json();
  console.log('API Response:', JSON.stringify(data, null, 2));
}

async function main() {
  const licenseKey = process.env.TEST_LICENSE_KEY;

  console.log('=== API Marketplace Test ===\n');

  console.log('1. Health check');
  await testHealth();

  if (!licenseKey) {
    console.log('\n2. Skipping skill test (no TEST_LICENSE_KEY)');
    console.log('   Set env var or purchase a key to test');
    return;
  }

  console.log('\n2. Run node-connection-doctor');
  await testRunSkill(licenseKey);
}

main().catch(console.error);
