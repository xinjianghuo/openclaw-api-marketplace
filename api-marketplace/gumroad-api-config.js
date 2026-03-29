#!/usr/bin/env node
/**
 * Gumroad API Configuration Script (No external deps)
 * Uses native fetch (Node 18+)
 */

// 配置
const CONFIG = {
  productId: '6F0E4C97-B72A4E69-A11BF6C4-AF6517E7',
  apiToken: 'xZ17v1PyQpQDBwkIm3OmPA==',
  webhookUrl: 'https://api-marketplace-ln1v0o44t-algea-foks-projects.vercel.app/api/webhook/gumroad',
  webhookSecret: 'd68816554d9ef606c6252054a9e7c99f58e6baf0aa077a68'
};

// 简化的 HTTP 请求 (使用内置 fetch)
async function gumroadRequest(method, path, body = null) {
  const url = `https://api.gumroad.com/v2${path}`;
  const headers = {
    'Authorization': `Bearer ${CONFIG.apiToken}`,
    'Content-Type': 'application/json'
  };
  
  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const res = await fetch(url, options);
  const data = await res.json();
  
  if (!res.ok || !data.success) {
    throw new Error(`Gumroad API Error: ${res.status} - ${JSON.stringify(data)}`);
  }
  
  return data;
}

async function main() {
  console.log('🚀 Configuring Gumroad product via API...\n');

  try {
    // 1. 获取产品
    console.log('1. Fetching product...');
    const productRes = await gumroadRequest('GET', `/products/${CONFIG.productId}`);
    const product = productRes.product;
    console.log(`   Product: ${product.name}`);
    console.log(`   Permalink: ${product.permalink}`);

    // 2. 启用 License Keys
    console.log('\n2. Enabling License Keys...');
    const updateData = {
      product: {
        name: product.name,
        price: product.price,
        description: product.description,
        license_keys_enabled: true,
        license_key_generation_type: 'random',
        license_key_length: 16,
        license_key_auto_deliver: true
      }
    };
    
    await gumroadRequest('PUT', `/products/${CONFIG.productId}`, updateData);
    console.log('   ✅ License Keys enabled');
    console.log('   - Format: Random characters');
    console.log('   - Length: 16');
    console.log('   - Auto-deliver: true');

    // 3. 配置 Webhook
    console.log('\n3. Configuring Webhook...');
    const webhooksRes = await gumroadRequest('GET', `/products/${CONFIG.productId}/webhooks`);
    const existing = webhooksRes.webhooks || [];
    
    const exists = existing.find(w => w.url === CONFIG.webhookUrl);
    if (exists) {
      console.log(`   ℹ️  Webhook already exists (ID: ${exists.id})`);
    } else {
      const webhookData = {
        webhook: {
          url: CONFIG.webhookUrl,
          events: ['purchase_completed'],
          secret: CONFIG.webhookSecret
        }
      };
      await gumroadRequest('POST', `/products/${CONFIG.productId}/webhooks`, webhookData);
      console.log(`   ✅ Webhook created: ${CONFIG.webhookUrl}`);
      console.log(`   - Event: purchase_completed`);
    }

    // 4. 发布产品
    console.log('\n4. Publishing product...');
    try {
      await gumroadRequest('PUT', `/products/${CONFIG.productId}`, {
        product: { published: true }
      });
      console.log('   ✅ Product published successfully!');
      console.log(`   🌐 Public URL: https://gumroad.com/l/${product.permalink}`);
    } catch (pubErr) {
      console.log('   ⚠️  Publish may require KYC verification');
      console.log('   Product saved. Complete KYC in Gumroad dashboard.');
    }

    console.log('\n🎉 Configuration complete!');
    console.log('\nNext steps:');
    console.log('1. Verify in Gumroad Dashboard');
    console.log('2. Complete KYC (identity verification)');
    console.log('3. Test purchase flow');
    console.log('\n📊 Expected revenue:');
    console.log('  Week 1-2: $20-50');
    console.log('  Month 1: $100-200');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('401')) {
      console.error('   → Authentication failed. Check API token.');
    } else if (error.message.includes('404')) {
      console.error('   → Product not found. Check product ID.');
    }
    process.exit(1);
  }
}

main();
