#!/bin/bash
# ForgeFlow Deployment Script
# This script deploys the backend to a cloud provider

echo "🚀 ForgeFlow Backend Deployment"
echo "================================"

# Check if backend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Set environment variables
export NODE_ENV=production
export PORT=${PORT:-3001}

# Start the server
echo "🌐 Starting server on port $PORT..."
npm start
