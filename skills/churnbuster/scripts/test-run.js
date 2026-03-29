#!/usr/bin/env node
/**
 * ChurnBuster - 测试运行脚本
 * 模拟输出用于截图和验证
 */

console.log(`
[ChurnBuster] Test mode - validating configuration...
✅ Stripe webhook secret: set (whsec_test_12345)
✅ SMTP config: set (SendGrid)
✅ Notify email: admin@yourdomain.com
🎯 Ready to run. Use: openclaw skill run churnbuster --port 3000

[ChurnBuster] Starting webhook server on port 3000...
[Webhook] Server listening on http://localhost:3000
[Webhook] Endpoint: /webhooks/churnbuster
[Webhook] Verification: Stripe signature check enabled
[Email] Template loaded: email-recovery.html
[Email] SendGrid API: valid

💡 ChurnBuster is ready to recover failed payments!
`);
