#!/bin/bash

# Install with Authentication Script for RocketIcons Ignition
# This script handles GitHub npm authentication and dependency installation

set -e

echo "🚀 Installing dependencies with GitHub authentication..."

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN environment variable is not set"
    echo "Please set GITHUB_TOKEN in your deployment environment variables"
    exit 1
fi

echo "✅ GITHUB_TOKEN found"

# Determine the correct directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IGNITION_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔍 Script directory: $SCRIPT_DIR"
echo "🔍 Ignition directory: $IGNITION_DIR"

# Navigate to ignition directory
cd "$IGNITION_DIR"

# Verify we're in the right place
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in $IGNITION_DIR"
    echo "Make sure this script is run from the correct location"
    exit 1
fi

echo "✅ Found package.json in $(pwd)"

# Configure npm for GitHub packages
echo "🔧 Configuring npm for GitHub packages..."
npm config set @rocketclimb:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken $GITHUB_TOKEN

echo "✅ npm configuration complete"

# Install root dependencies first (if we're in a monorepo)
if [ -f "../../package.json" ]; then
    echo "📦 Installing root dependencies..."
    cd ../..
    npm ci
    cd "$IGNITION_DIR"
    echo "✅ Root dependencies installed"
fi

# Install ignition dependencies
echo "📦 Installing ignition dependencies..."
npm ci

echo "✅ All dependencies installed successfully"

# Verify installation
echo "🔍 Verifying installation..."
if npm list @rocketclimb/icons > /dev/null 2>&1; then
    echo "✅ @rocketclimb/icons package verified"
else
    echo "⚠️  Warning: @rocketclimb/icons package not found"
fi

echo "🎉 Dependencies installed with authentication successfully!" 