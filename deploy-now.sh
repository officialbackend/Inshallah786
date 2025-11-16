#!/bin/bash
# Deployment script - Run this to push changes and deploy

echo "🚀 DHA Back Office - Production Deployment Script"
echo "=================================================="
echo ""

# Navigate to repo
cd /workspaces/Inshallah786

echo "1️⃣  Checking git status..."
git status

echo ""
echo "2️⃣  Adding changes..."
git add server/services/permit-service.js
git add server/config/secrets.js
git add server/index.js

echo ""
echo "3️⃣  Committing changes..."
git commit -m "Fix: Syntax error in permit-service.js and PKI configuration"

echo ""
echo "4️⃣  Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Changes pushed to GitHub!"
echo ""
echo "5️⃣  Next steps:"
echo "   - Go to: https://dashboard.render.com"
echo "   - Click your service"
echo "   - Click 'Deploy' button"
echo "   - Wait 5-10 minutes"
echo "   - Test: curl https://your-service.onrender.com/api/health"
echo ""
echo "🎉 System will be LIVE in 15 minutes!"
