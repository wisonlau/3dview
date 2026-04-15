#!/bin/bash

# 3D Model Viewer Build Script

echo "🏆 3D Model Viewer Build Script"
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

# Clean previous build
if [ -d "build/bin" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf build/bin/*
fi

# Build the application
echo "🔨 Building 3D Model Viewer..."
echo ""
wails build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    
    # Show the build output
    if [ -d "build/bin" ]; then
        echo "📦 Build output:"
        ls -lh build/bin/
        echo ""
        echo "🚀 You can now run the application from the build/bin directory"
    fi
else
    echo ""
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi
