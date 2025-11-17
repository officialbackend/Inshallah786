#!/bin/bash

echo "🔍 GIT DIAGNOSTIC REPORT"
echo "========================"
echo ""

echo "📍 Working Directory:"
pwd
echo ""

echo "🔗 Remote Configuration:"
git remote -v
echo ""

echo "📊 Current Status:"
git status
echo ""

echo "📋 Recent Commits:"
git log --oneline -5
echo ""

echo "🌿 Branches:"
git branch -a
echo ""

echo "🔐 SSH Key Status:"
ssh -T git@github.com 2>&1 || echo "SSH not available"
echo ""

echo "📤 Attempting Push..."
git push origin main -v
echo ""

echo "✅ Diagnostic Complete"
