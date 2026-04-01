const axios = require('axios');

const clientId = 'AaHszY2Kn2lF3FeUybv1ax5H7YLJ9kDe-_Djp14KrV95Aj6qhu0drL4hDEdgo5gLJ7KdzfRqGIzpJPuj';
const clientSecret = 'EC6-TbKj2WfqpoTNYQv6HQoFbOin7d6QRnEMT5_e0rIXVWbPmU-xkiWmgZStwC-vSe2DAneSEF7S7gLq';

// Test both sandbox and live
async function testAuth(useSandbox) {
  const base = useSandbox
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const res = await axios.post(
      `${base}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    console.log(`✅ ${useSandbox ? 'Sandbox' : 'Live'} auth OK`);
    console.log('  Token expires in:', res.data.expires_in, 'seconds');
    return true;
  } catch (err) {
    if (err.response) {
      console.log(`❌ ${useSandbox ? 'Sandbox' : 'Live'} auth FAILED: ${err.response.status}`);
      console.log('  ', err.response.data?.error_description || err.response.data);
    } else {
      console.log(`❌ ${useSandbox ? 'Sandbox' : 'Live'} auth ERROR:`, err.message);
    }
    return false;
  }
}

async function run() {
  console.log('Testing PayPal credentials...\n');
  const sandboxOk = await testAuth(true);
  const liveOk = await testAuth(false);

  console.log('\n📊 Summary:');
  console.log(`  Sandbox: ${sandboxOk ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`  Live: ${liveOk ? '✅ Valid' : '❌ Invalid'}`);

  if (sandboxOk) {
    console.log('\n🔧 Recommendation: Set PAYPAL_SANDBOX=true for testing');
  } else if (liveOk) {
    console.log('\n🔧 Recommendation: Keep PAYPAL_SANDBOX=false (live credentials)');
  } else {
    console.log('\n🚨 Both failed - credentials may be incorrect or account issues');
  }
}

run();