#!/usr/bin/env env bash
# 部署脚本 - 一键部署到 Vercel

echo "=== Deploying OpenClaw API Marketplace to Vercel ==="

# 1. 检查依赖
if ! command -v vercel &> /dev/null; then
  echo "Installing Vercel CLI..."
  npm install -g vercel
fi

# 2. 环境变量检查
if [ ! -f .env.local ]; then
  echo "Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo "⚠️  Please edit .env.local and add your secrets"
  echo "   Required: JWT_SECRET"
  echo "   Optional: VERCEL_KV_REST_API_URL, VERCEL_KV_REST_API_TOKEN"
  exit 1
fi

# 3. 部署
echo "Deploying..."
vercel --prod

echo "✅ Deployment complete!"
echo "📝 Next steps:"
echo "   1. Create Gumroad product"
echo "   2. Configure webhook to https://your-app.vercel.app/api/webhook/gumroad"
echo "   3. Set GUMROUD_WEBHOOK_SECRET in Vercel dashboard"
