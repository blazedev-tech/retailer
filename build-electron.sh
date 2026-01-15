#!/bin/bash

# Retailer Management System - Electron Build Script
# This script builds the Electron application for Windows, Mac, and Linux

set -e

echo "=================================="
echo "Retailer Management System Builder"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "NPM version: $(npm --version)"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install --legacy-peer-deps
    print_success "Dependencies installed!"
    echo ""
fi

# Build Next.js application
print_status "Building Next.js application..."
npm run build
print_success "Next.js build complete!"
echo ""

# Prompt user for platform selection
echo "Select platform to build:"
echo "1) Windows only"
echo "2) macOS only"
echo "3) Linux only"
echo "4) All platforms (Windows, macOS, Linux)"
echo "5) Windows + Linux (recommended for most users)"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        print_status "Building for Windows..."
        npx electron-builder --win
        ;;
    2)
        print_status "Building for macOS..."
        npx electron-builder --mac
        ;;
    3)
        print_status "Building for Linux..."
        npx electron-builder --linux
        ;;
    4)
        print_status "Building for all platforms..."
        npx electron-builder -mwl
        ;;
    5)
        print_status "Building for Windows and Linux..."
        npx electron-builder --win --linux
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
print_success "Build complete!"
echo ""
echo "Your application has been built and can be found in the 'dist' directory:"
ls -lh dist/ 2>/dev/null || echo "No dist folder found yet"
echo ""
echo "Installation instructions:"
echo "  - Windows: Run the .exe installer from dist/"
echo "  - macOS: Open the .dmg file from dist/"
echo "  - Linux: Install the .AppImage or .deb from dist/"
echo ""
print_success "Thank you for using Retailer Management System!"
