#!/usr/bin/env node
/**
 * Gumroad API Config - Diagnostic Version
 */

const CONFIG = {
  productId: '6F0E4C97-B72A4E69-A11BF6C4-AF6517E7',
  apiToken: 'xZ17v1PyQpQDBwkIm3OmPA==',
  webhookUrl: 'https://api-marketplace-ln1v0o44t-algea-foks-projects.vercel.app/api/webhook/gumroad',
  webhookSecret: 'd68816554d9ef606c6252054a9e7c99f58e6baf0aa077a68'
};

async function testConnection() {
  console.log('🔍 Testing connectivity to Gumroad API...\n');
  
  try {
    // Test 1: Simple fetch to Gumroad
    console.log('Test 1: Fetching https://api.gumroad.com/v2/products');
    const testRes = await fetch('https://api.gumroad.com/v2/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CONFIG.apiToken}`
      }
    });
    console.log(`   Status: ${testRes.status} ${testRes.statusText}`);
    
    if (testRes.ok) {
      const data = await testRes.json();
      console.log(`   ✅ Connected. Response: ${JSON.stringify(data).substring(0, 100)}...`);
    } else {
      const text = await testRes.text();
      console.log(`   ❌ Response: ${text.substring(0, 200)}`);
    }
  } catch (err) {
    console.log(`   ❌ Fetch error: ${err.message}`);
    console.log(`   This usually means:`);
    console.log(`   - Network blocked (firewall/proxy)`);
    console.log(`   - Node.js version too old (need v18+ for native fetch)`);
    console.log(`   - TLS/SSL issues`);
  }
}

async function main() {
  console.log('🚀 Gumroad API Configuration (Diagnostic Mode)\n');
  console.log(`Product ID: ${CONFIG.productId}`);
  console.log(`API Token: ${CONFIG.apiToken.substring(0, 10)}...`);
  
  await testConnection();
  
  console.log('\n📝 Alternative: Manual Configuration');
  console.log('If API fails, please do manually:');
  console.log('1. Settings → License Keys → Enable');
  console.log('   - Format: Random characters');
  console.log('   - Length: 16');
  console.log('   - Auto-deliver: ON');
  console.log('2. Settings → Webhooks → Add:');
  console.log(`   URL: ${CONFIG.webhookUrl}`);
  console.log(`   Secret: ${CONFIG.webhookSecret}`);
  console.log('3. Publish product');
}

main();
