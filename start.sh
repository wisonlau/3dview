#!/bin/bash

# 3D Model Viewer Startup Script

echo "🏆 3D Model Viewer Startup Script"
echo "================================"

# Check if we're in the correct directory
if [ ! -f "wails.json" ]; then
    echo "❌ Error: wails.json not found. Please run this script from the 3dview directory."
    exit 1
fi

# Check if Wails is installed
if ! command -v wails &> /dev/null; then
    echo "❌ Error: Wails CLI is not installed."
    echo "Please install it with: go install github.com/wailsapp/wails/v2/cmd/wails@latest"
    exit 1
fi

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Error: Go is not installed or not in PATH."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH."
    exit 1
fi

echo "✅ All prerequisites met"
echo ""

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✅ Frontend dependencies installed"
    echo ""
fi

# Start Wails development server
echo "🚀 Starting 3D Model Viewer in development mode..."
echo ""
wails dev
