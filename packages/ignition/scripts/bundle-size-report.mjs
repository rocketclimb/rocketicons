#!/usr/bin/env node

import fs from "fs";
import path from "path";
import chalk from "chalk";
import zlib from "zlib";
import { filesize } from "filesize";

// Configuration
const BUILD_DIR = ".next";
const STATIC_DIR = path.join(BUILD_DIR, "static");
const REPORT_DIR = "bundle-reports";
const REPORT_FILE = path.join(
  REPORT_DIR,
  `bundle-report-${new Date().toISOString().split("T")[0]}.json`
);

/**
 * Get file size with gzip compression
 */
async function getGzipSize(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return new Promise((resolve, reject) => {
      zlib.gzip(content, (err, compressed) => {
        if (err) reject(err);
        else resolve(compressed.length);
      });
    });
  } catch (error) {
    return 0;
  }
}

/**
 * Get directory size recursively with detailed breakdown
 */
function getDirectorySizeDetailed(dirPath, basePath = "", excludeDirs = ["cache", "trace"]) {
  const result = {
    totalSize: 0,
    files: [],
    directories: {}
  };

  if (!fs.existsSync(dirPath)) {
    return result;
  }

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    // Skip excluded directories
    if (excludeDirs.includes(item)) {
      continue;
    }

    const itemPath = path.join(dirPath, item);
    const relativePath = path.join(basePath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      const subResult = getDirectorySizeDetailed(itemPath, relativePath, excludeDirs);
      result.directories[item] = subResult;
      result.totalSize += subResult.totalSize;
    } else {
      const fileInfo = {
        name: item,
        path: relativePath,
        size: stats.size,
        modified: stats.mtime
      };
      result.files.push(fileInfo);
      result.totalSize += stats.size;
    }
  }

  return result;
}

/**
 * Analyze all assets in detail
 */
async function analyzeAllAssets() {
  const assets = {
    javascript: [],
    css: [],
    media: [],
    other: []
  };

  // Analyze static directory
  if (fs.existsSync(STATIC_DIR)) {
    const staticFiles = fs.readdirSync(STATIC_DIR, { recursive: true });

    for (const file of staticFiles) {
      const filePath = path.join(STATIC_DIR, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        const gzipped = await getGzipSize(filePath);
        const fileInfo = {
          file: file,
          path: filePath,
          size: stats.size,
          gzipSize: gzipped,
          modified: stats.mtime,
          compressionRatio: (((stats.size - gzipped) / stats.size) * 100).toFixed(1)
        };

        if (file.endsWith(".js")) {
          assets.javascript.push(fileInfo);
        } else if (file.endsWith(".css")) {
          assets.css.push(fileInfo);
        } else if (file.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i)) {
          assets.media.push(fileInfo);
        } else {
          assets.other.push(fileInfo);
        }
      }
    }
  }

  // Sort by size
  Object.keys(assets).forEach((key) => {
    assets[key].sort((a, b) => b.size - a.size);
  });

  return assets;
}

/**
 * Analyze Next.js specific files
 */
async function analyzeNextJSFiles() {
  const analysis = {
    pages: [],
    chunks: [],
    buildManifest: null,
    preloadManifest: null
  };

  // Analyze build manifest
  const buildManifestPath = path.join(BUILD_DIR, "build-manifest.json");
  if (fs.existsSync(buildManifestPath)) {
    analysis.buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, "utf8"));
  }

  // Analyze preload manifest
  const preloadManifestPath = path.join(BUILD_DIR, "preload-manifest.json");
  if (fs.existsSync(preloadManifestPath)) {
    analysis.preloadManifest = JSON.parse(fs.readFileSync(preloadManifestPath, "utf8"));
  }

  // Analyze server directory
  const serverDir = path.join(BUILD_DIR, "server");
  if (fs.existsSync(serverDir)) {
    const serverFiles = fs.readdirSync(serverDir, { recursive: true });

    for (const file of serverFiles) {
      if (file.endsWith(".js") || file.endsWith(".html")) {
        const filePath = path.join(serverDir, file);
        const stats = fs.statSync(filePath);
        const gzipped = await getGzipSize(filePath);

        if (file.includes("pages/")) {
          analysis.pages.push({
            file: file,
            size: stats.size,
            gzipSize: gzipped,
            type: file.endsWith(".html") ? "HTML" : "JavaScript"
          });
        } else {
          analysis.chunks.push({
            file: file,
            size: stats.size,
            gzipSize: gzipped
          });
        }
      }
    }
  }

  return analysis;
}

/**
 * Generate performance insights
 */
function generateInsights(assets, nextjsAnalysis, totalSize) {
  const insights = [];

  // Large file insights
  const largeFiles = [];
  Object.values(assets)
    .flat()
    .forEach((file) => {
      if (file.size > 1024 * 1024) {
        // > 1MB
        largeFiles.push(file);
      }
    });

  if (largeFiles.length > 0) {
    insights.push({
      type: "warning",
      title: "Large Files Detected",
      description: `Found ${largeFiles.length} files larger than 1MB`,
      files: largeFiles.map((f) => ({ name: f.file, size: filesize(f.size) }))
    });
  }

  // Compression insights
  const poorlyCompressed = [];
  Object.values(assets)
    .flat()
    .forEach((file) => {
      if (file.compressionRatio < 20 && file.size > 100 * 1024) {
        // < 20% compression and > 100KB
        poorlyCompressed.push(file);
      }
    });

  if (poorlyCompressed.length > 0) {
    insights.push({
      type: "info",
      title: "Poor Compression Detected",
      description: "Some files have low compression ratios",
      files: poorlyCompressed.map((f) => ({
        name: f.file,
        size: filesize(f.size),
        compressionRatio: f.compressionRatio + "%"
      }))
    });
  }

  // Bundle size insights
  const jsTotalSize = assets.javascript.reduce((sum, file) => sum + file.size, 0);
  const jsPercentage = (jsTotalSize / totalSize) * 100;

  if (jsPercentage > 60) {
    insights.push({
      type: "warning",
      title: "JavaScript Bundle Too Large",
      description: `JavaScript represents ${jsPercentage.toFixed(1)}% of total bundle size`,
      recommendation: "Consider code splitting and dynamic imports"
    });
  }

  return insights;
}

/**
 * Generate comprehensive report
 */
async function generateReport() {
  console.log(chalk.blue.bold("\n📊 Generating Comprehensive Bundle Report\n"));

  if (!fs.existsSync(BUILD_DIR)) {
    console.error(chalk.red('❌ Build directory not found. Please run "npm run build" first.'));
    process.exit(1);
  }

  // Create report directory
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  // Get detailed directory analysis
  const buildAnalysis = getDirectorySizeDetailed(BUILD_DIR);

  // Analyze assets
  const assets = await analyzeAllAssets();

  // Analyze Next.js specific files
  const nextjsAnalysis = await analyzeNextJSFiles();

  // Generate insights
  const insights = generateInsights(assets, nextjsAnalysis, buildAnalysis.totalSize);

  // Create comprehensive report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalSize: buildAnalysis.totalSize,
      totalSizeMB: (buildAnalysis.totalSize / (1024 * 1024)).toFixed(2),
      totalFiles: Object.values(assets).flat().length,
      compressionSavings: Object.values(assets)
        .flat()
        .reduce((sum, file) => sum + (file.size - file.gzipSize), 0)
    },
    breakdown: {
      javascript: {
        count: assets.javascript.length,
        totalSize: assets.javascript.reduce((sum, file) => sum + file.size, 0),
        totalGzipSize: assets.javascript.reduce((sum, file) => sum + file.gzipSize, 0),
        files: assets.javascript
      },
      css: {
        count: assets.css.length,
        totalSize: assets.css.reduce((sum, file) => sum + file.size, 0),
        totalGzipSize: assets.css.reduce((sum, file) => sum + file.gzipSize, 0),
        files: assets.css
      },
      media: {
        count: assets.media.length,
        totalSize: assets.media.reduce((sum, file) => sum + file.size, 0),
        files: assets.media
      },
      other: {
        count: assets.other.length,
        totalSize: assets.other.reduce((sum, file) => sum + file.size, 0),
        files: assets.other
      }
    },
    nextjs: nextjsAnalysis,
    directoryStructure: buildAnalysis,
    insights: insights,
    recommendations: [
      "Use Next.js Image component for image optimization",
      "Implement dynamic imports for large components",
      "Enable gzip compression on your server",
      "Consider using a CDN for static assets",
      "Analyze and remove unused dependencies",
      "Use tree shaking to eliminate dead code"
    ]
  };

  // Save report to file
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

  // Display summary
  console.log(chalk.green("✅ Report generated successfully!"));
  console.log(chalk.cyan(`📄 Report saved to: ${REPORT_FILE}`));
  console.log(chalk.yellow(`📊 Total bundle size: ${filesize(report.summary.totalSize)}`));
  console.log(
    chalk.yellow(`💾 Compression savings: ${filesize(report.summary.compressionSavings)}`)
  );

  if (insights.length > 0) {
    console.log(chalk.blue.bold("\n💡 Key Insights:"));
    insights.forEach((insight, index) => {
      const icon = insight.type === "warning" ? "⚠️" : "ℹ️";
      console.log(`   ${icon} ${insight.title}: ${insight.description}`);
    });
  }

  console.log(chalk.gray(`\nView the full report at: ${REPORT_FILE}\n`));

  return report;
}

// Run the report generation
generateReport().catch((error) => {
  console.error(chalk.red("Error generating report:"), error);
  process.exit(1);
});
