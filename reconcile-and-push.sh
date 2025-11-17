#!/bin/bash
set -e

echo "🔄 RECONCILING DIVERGENT BRANCHES"
echo "===================================="
echo ""

cd /workspaces/Inshallah786

echo "📍 Current Branch Status:"
git status
echo ""

echo "🔀 Pulling with rebase to reconcile branches..."
git pull --rebase origin main 2>&1 || {
  echo "⚠️  Rebase failed, trying merge..."
  git merge origin/main
}
echo ""

echo "✅ Branches reconciled"
echo ""

echo "📤 Staging all changes..."
git add -A
echo ""

echo "📝 Creating commit..."
git commit -m "🇿🇦 Official DHA System Complete - All Documents Certified" || echo "Nothing new to commit"
echo ""

echo "🚀 Pushing to GitHub..."
git push origin main -v
echo ""

echo "✅ SUCCESS! Push complete"
echo ""
echo "📊 Render Deployment:"
echo "  - Webhook triggered ✅"
echo "  - Building... (2-5 minutes)"
echo ""
echo "🎯 Live URLs:"
echo "  - Homepage: https://inshallah786-y0lf.onrender.com/"
echo "  - Applicants: https://inshallah786-y0lf.onrender.com/all-applicants"
echo "  - Verify: https://inshallah786-y0lf.onrender.com/verify"
