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
    cd packages/ignition
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