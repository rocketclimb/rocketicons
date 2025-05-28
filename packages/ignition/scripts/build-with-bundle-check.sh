#!/bin/bash

# Build with Bundle Check Script for RocketIcons Ignition
# This script handles the complete build process with bundle size checking

set -e

echo "🚀 Building project with bundle size checking..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the ignition directory"
    exit 1
fi

# Run the install script first
echo "📦 Installing dependencies with authentication..."
./scripts/install-with-auth.sh

# Generate content collections and statics
echo "🔧 Generating content collections and statics..."
npm run generate-content-collections
npm run generate-statics

# Build the project
echo "🏗️  Building the project..."
npm run build

# Check bundle size
echo "📊 Checking bundle size..."
npm run size-check

# Generate bundle report
echo "📋 Generating bundle report..."
npm run size-report

# Display summary
echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "📊 Bundle Size Summary:"
if [ -f "bundle-reports/bundle-report-$(date +%Y%m%d).json" ]; then
    node -e "
    const fs = require('fs');
    const files = fs.readdirSync('bundle-reports/');
    const latest = files.filter(f => f.startsWith('bundle-report-')).sort().pop();
    if (latest) {
        const report = JSON.parse(fs.readFileSync('bundle-reports/' + latest, 'utf8'));
        const totalMB = (report.summary.totalSize / (1024 * 1024)).toFixed(2);
        const usagePercent = ((report.summary.totalSize / (220 * 1024 * 1024)) * 100).toFixed(1);
        console.log('Total Size: ' + totalMB + ' MB (' + usagePercent + '% of 220 MB limit)');
        console.log('Files: ' + report.summary.totalFiles);
        console.log('Status: ' + (parseFloat(usagePercent) > 100 ? '❌ EXCEEDS LIMIT' : '✅ WITHIN LIMIT'));
    }
    "
else
    echo "⚠️  Bundle report not found"
fi

echo ""
echo "✅ Ready for deployment!" 