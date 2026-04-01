const { spawn } = require('child_process');

const env = {
  ...process.env,
  PAYPAL_CLIENT_ID: 'AaHszY2Kn2lF3FeUybv1ax5H7YLJ9kDe-_Djp14KrV95Aj6qhu0drL4hDEdgo5gLJ7KdzfRqGIzpJPuj',
  PAYPAL_CLIENT_SECRET: 'EC6-TbKj2WfqpoTNYQv6HQoFbOin7d6QRnEMT5_e0rIXVWbPmU-xkiWmgZStwC-vSe2DAneSEF7S7gLq',
  PAYPAL_SANDBOX: 'false',
  PAYPAL_WEBHOOK_URL: 'https://api-marketplace-red.vercel.app/api/paypal/webhook'
};

const child = spawn('node', ['scripts/register-paypal-webhook.js'], {
  cwd: 'D:/Program Files/openclaw/data/.openclaw/workspace/projects/api-marketplace',
  env,
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  console.log(`Webhook registration exited with code ${code}`);
  process.exit(code);
});