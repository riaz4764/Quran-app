#!/bin/bash
set -e

echo "=== Quran App - GitHub Pages Deploy Script ==="
echo ""

echo "Step 1: Installing dependencies..."
pnpm install --no-frozen-lockfile

echo ""
echo "Step 2: Building web app..."
cd artifacts/quran-app
EXPO_PUBLIC_BASE_URL=/Quran-app pnpm exec expo export --platform web
cd ../..

echo ""
echo "Step 3: Copying to root folder..."
cp -r artifacts/quran-app/dist/. .
touch .nojekyll

echo ""
echo "=== Build complete! ==="
echo ""
echo "Ab yeh commands chalao:"
echo "  git add ."
echo "  git commit -m 'Build: web app for GitHub Pages'"
echo "  git push"
echo ""
echo "App live hogi: https://riaz4764.github.io/Quran-app/"
