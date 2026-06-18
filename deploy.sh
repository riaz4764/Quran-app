#!/bin/bash
set -e

echo "=== Quran App - GitHub Pages Deploy Script ==="
echo ""

echo "Step 1: Installing dependencies..."
pnpm install --no-frozen-lockfile

echo ""
echo "Step 2: Building web app..."
cd artifacts/quran-app
pnpm exec expo export --platform web
cd ../..

echo ""
echo "Step 3: Copying to docs/ folder..."
rm -rf docs
cp -r artifacts/quran-app/dist docs

echo ""
echo "Step 4: Adding .nojekyll (GitHub Pages fix)..."
touch docs/.nojekyll

echo ""
echo "=== Build complete! ==="
echo ""
echo "Ab yeh commands chalao:"
echo "  git add docs/"
echo "  git commit -m 'Build web app for GitHub Pages'"
echo "  git push"
echo ""
echo "Phir GitHub pe:"
echo "  Settings > Pages > Source: 'Deploy from a branch'"
echo "  Branch: main  |  Folder: /docs"
echo "  Save karo"
echo ""
echo "App live hogi: https://riaz4764.github.io/Quran-app/"
