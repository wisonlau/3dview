#!/bin/bash

# Simple Multi-Platform Build Script
# Builds for Windows, macOS Intel, and macOS Apple Silicon

APP_NAME="3dview"
VERSION="v1.0.6"
BUILD_DIR="build"
OUTPUT_DIR="${BUILD_DIR}/releases"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "  Building ${APP_NAME} ${VERSION}"
echo "========================================="
echo ""

# Create output directory
mkdir -p "${OUTPUT_DIR}"

# Clean old builds
echo "Cleaning old builds..."
rm -rf "${BUILD_DIR}/bin/"*

# Build for Windows
echo "${BLUE}[1/3]${NC} Building for Windows..."
if wails build -platform windows/amd64; then
    cp "${BUILD_DIR}/bin/${APP_NAME}.exe" "${OUTPUT_DIR}/${APP_NAME}_${VERSION}_windows_64bit.exe"
    echo "${GREEN}✓${NC} Windows build completed"
else
    echo "${RED}✗${NC} Windows build failed"
fi
echo ""

# Build for macOS Intel
echo "${BLUE}[2/3]${NC} Building for macOS Intel..."
if wails build -platform darwin/amd64; then
    echo "Packaging macOS Intel..."
    cd "${BUILD_DIR}/bin"
    if zip -r "../releases/${APP_NAME}_${VERSION}_macos_intel.zip" "${APP_NAME}.app"; then
        echo "${GREEN}✓${NC} macOS Intel build completed"
    else
        echo "${RED}✗${NC} macOS Intel packaging failed"
        echo "${YELLOW}Error code: $?${NC}"
    fi
    cd - > /dev/null
else
    echo "${RED}✗${NC} macOS Intel build failed"
fi
echo ""

# Build for macOS Apple Silicon
echo "${BLUE}[3/3]${NC} Building for macOS Apple Silicon..."
if wails build -platform darwin/arm64; then
    echo "Packaging macOS Apple Silicon..."
    cd "${BUILD_DIR}/bin"
    if zip -r "../releases/${APP_NAME}_${VERSION}_macos_apple_silicon.zip" "${APP_NAME}.app"; then
        echo "${GREEN}✓${NC} macOS Apple Silicon build completed"
    else
        echo "${RED}✗${NC} macOS Apple Silicon packaging failed"
        echo "${YELLOW}Error code: $?${NC}"
    fi
    cd - > /dev/null
else
    echo "${RED}✗${NC} macOS Apple Silicon build failed"
fi
echo ""

# Create checksums
echo "Creating checksums..."
cd "${OUTPUT_DIR}"
if ls ${APP_NAME}_${VERSION}_* 1> /dev/null 2>&1; then
    shasum -a 256 ${APP_NAME}_${VERSION}_* > checksums.txt
    echo "${GREEN}✓${NC} Checksums created"
else
    echo "${RED}✗${NC} No files found for checksums"
fi
cd - > /dev/null
echo ""

# Summary
echo "========================================="
echo "  BUILD SUMMARY"
echo "========================================="
ls -lh "${OUTPUT_DIR}"
echo ""
echo "${GREEN}✓ Build process completed!${NC}"
