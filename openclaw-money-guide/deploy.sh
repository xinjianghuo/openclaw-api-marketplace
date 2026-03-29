#!/usr/bin/env bash
# OpenClaw Money Guide - 部署到 GitHub Pages

set -e

echo "=== Deploying OpenClaw Money Guide to GitHub Pages ==="

# 1. 检查是否在正确目录
if [ ! -f "_config.yml" ]; then
  echo "Error: _config.yml not found. Please run this script from the site root."
  exit 1
fi

# 2. 初始化 Git (如果还没 init)
if [ ! -d .git ]; then
  git init
  git branch -M main
  echo "Git repository initialized."
fi

# 3. 提示设置远程仓库
echo ""
echo "Please create a new repository on GitHub named: openclaw-money-guide"
echo "Then add the remote:"
echo "  git remote add origin https://github.com/YOUR_USERNAME/openclaw-money-guide.git"
echo ""
read -p "Have you added the remote? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Please add remote first, then re-run this script."
  exit 1
fi

# 4. 提交文件
git add .
git commit -m "Deploy OpenClaw Money Guide site"
git push -u origin main

# 5. 提示启用 GitHub Pages
echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/YOUR_USERNAME/openclaw-money-guide/settings/pages"
echo "2. Set 'Source' to 'GitHub Actions' (recommended) or 'Deploy from a branch'"
echo "3. If using Actions, the workflow will run automatically"
echo "4. Wait 1-2 minutes, then visit:"
echo "   https://YOUR_USERNAME.github.io/openclaw-money-guide/"
echo ""
echo "Don't forget to update _config.yml with your username and email!"
