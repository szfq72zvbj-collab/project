#!/bin/bash
echo "🚀 Deploying Math Learning Platform..."

echo "1. Building frontend..."
cd apps/web
npm run build

echo "2. Creating frontend zip..."
zip -r ../web-build.zip dist/

echo "3. Creating backend zip..."
cd ../api
zip -r ../api-build.zip . -x "node_modules/*" ".env"

echo "✅ Done! Upload these files:"
echo "   - Frontend: apps/web-build.zip → Vercel Drag & Drop"
echo "   - Backend:  apps/api-build.zip → Railway Upload"
echo ""
echo "📦 Or use CLI commands:"
echo "   Frontend: cd apps/web && vercel"
echo "   Backend:  cd apps/api && railway up"