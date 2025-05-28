#!/usr/bin/env node

import fs from "fs";
import path from "path";
import chalk from "chalk";
import zlib from "zlib";
import { filesize } from "filesize";

// Configuration
const BUILD_DIR = ".next";
const STATIC_DIR = path.join(BUILD_DIR, "static");
const SERVER_DIR = path.join(BUILD_DIR, "server");
const LIMIT_MB = 220;
const LIMIT_BYTES = LIMIT_MB * 1024 * 1024;
const OPTIMIZATION_LOG = "bundle-optimization-log.json";

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
 * Get directory size recursively, excluding cache and trace
 */
function getDirectorySize(dirPath, excludeDirs = ["cache", "trace"]) {
  let totalSize = 0;

  if (!fs.existsSync(dirPath)) {
    return totalSize;
  }

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    if (excludeDirs.includes(item)) {
      continue;
    }

    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      totalSize += getDirectorySize(itemPath, excludeDirs);
    } else {
      totalSize += stats.size;
    }
  }

  return totalSize;
}

/**
 * Analyze static pages generation
 */
function analyzeStaticPages() {
  const analysis = {
    totalPages: 0,
    pageTypes: {},
    largestPages: [],
    iconPages: 0,
    dynamicRoutes: 0
  };

  // Check server app directory for generated pages
  const serverAppDir = path.join(SERVER_DIR, "app");
  if (fs.existsSync(serverAppDir)) {
    const findPages = (dir, basePath = "") => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          findPages(itemPath, path.join(basePath, item));
        } else if (item.endsWith(".js") && (item.includes("page") || item.includes("route"))) {
          analysis.totalPages++;

          // Categorize page types
          const routePath = basePath;
          if (routePath.includes("icons")) {
            analysis.iconPages++;
          }
          if (routePath.includes("[") && routePath.includes("]")) {
            analysis.dynamicRoutes++;
          }

          // Track page types
          const pageType = item.includes("page") ? "page" : "route";
          analysis.pageTypes[pageType] = (analysis.pageTypes[pageType] || 0) + 1;

          // Track large pages
          if (stats.size > 50000) {
            // > 50KB
            analysis.largestPages.push({
              path: path.join(basePath, item),
              size: stats.size,
              sizeFormatted: filesize(stats.size)
            });
          }
        }
      }
    };

    findPages(serverAppDir);
  }

  // Sort largest pages
  analysis.largestPages.sort((a, b) => b.size - a.size);
  analysis.largestPages = analysis.largestPages.slice(0, 10);

  return analysis;
}

/**
 * Load optimization history
 */
function loadOptimizationHistory() {
  if (fs.existsSync(OPTIMIZATION_LOG)) {
    try {
      return JSON.parse(fs.readFileSync(OPTIMIZATION_LOG, "utf8"));
    } catch (error) {
      return { actions: [], totalSaved: 0 };
    }
  }
  return { actions: [], totalSaved: 0 };
}

/**
 * Generate optimization recommendations
 */
function generateOptimizationRecommendations(bundleSize, staticPages, assets) {
  const recommendations = [];
  const sizeMB = bundleSize / (1024 * 1024);
  const usagePercent = (bundleSize / LIMIT_BYTES) * 100;

  // Critical size warnings
  if (usagePercent > 90) {
    recommendations.push({
      priority: "CRITICAL",
      action: "IMMEDIATE_OPTIMIZATION_REQUIRED",
      description: `Bundle is at ${usagePercent.toFixed(1)}% of limit. Immediate action required.`,
      estimatedSavings: "Varies",
      steps: [
        "Run npm run build:analyze to identify largest chunks",
        "Implement dynamic imports for large components",
        "Review and remove unused dependencies",
        "Consider reducing static page generation"
      ]
    });
  } else if (usagePercent > 75) {
    recommendations.push({
      priority: "HIGH",
      action: "PROACTIVE_OPTIMIZATION",
      description: `Bundle is at ${usagePercent.toFixed(1)}% of limit. Proactive optimization recommended.`,
      estimatedSavings: "10-30MB",
      steps: [
        "Audit large JavaScript chunks",
        "Implement code splitting",
        "Optimize image assets"
      ]
    });
  }

  // Static pages analysis
  if (staticPages.iconPages > 1000) {
    recommendations.push({
      priority: "HIGH",
      action: "REDUCE_STATIC_ICON_PAGES",
      description: `Generating ${staticPages.iconPages} icon pages. Consider dynamic rendering.`,
      estimatedSavings: "5-15MB",
      steps: [
        "Convert icon pages to dynamic routes",
        "Use ISR (Incremental Static Regeneration)",
        "Implement client-side rendering for icon details"
      ]
    });
  }

  // Large file analysis
  const largeJSFiles = assets.javascript.filter((file) => file.size > 1024 * 1024);
  if (largeJSFiles.length > 0) {
    recommendations.push({
      priority: "MEDIUM",
      action: "OPTIMIZE_LARGE_JS_FILES",
      description: `Found ${largeJSFiles.length} JavaScript files larger than 1MB`,
      estimatedSavings: "2-8MB",
      steps: [
        "Implement dynamic imports for large components",
        "Use React.lazy() for code splitting",
        "Review and optimize large dependencies"
      ],
      files: largeJSFiles.map((f) => ({ name: f.file, size: filesize(f.size) }))
    });
  }

  // CSS optimization
  const totalCSS = assets.css.reduce((sum, file) => sum + file.size, 0);
  if (totalCSS > 2 * 1024 * 1024) {
    // > 2MB
    recommendations.push({
      priority: "MEDIUM",
      action: "OPTIMIZE_CSS",
      description: `CSS bundle is ${filesize(totalCSS)}. Consider optimization.`,
      estimatedSavings: "1-3MB",
      steps: [
        "Remove unused CSS with PurgeCSS",
        "Optimize Tailwind CSS configuration",
        "Use CSS-in-JS for component-specific styles"
      ]
    });
  }

  return recommendations;
}

/**
 * Analyze bundle assets
 */
async function analyzeAssets() {
  const assets = {
    javascript: [],
    css: [],
    media: [],
    other: []
  };

  if (!fs.existsSync(STATIC_DIR)) {
    return assets;
  }

  const staticFiles = fs.readdirSync(STATIC_DIR, { recursive: true });

  for (const file of staticFiles) {
    const filePath = path.join(STATIC_DIR, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      const gzipped = await getGzipSize(filePath);
      const fileInfo = {
        file: file,
        size: stats.size,
        gzipSize: gzipped
      };

      if (file.endsWith(".js")) {
        assets.javascript.push(fileInfo);
      } else if (file.endsWith(".css")) {
        assets.css.push(fileInfo);
      } else if (file.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2)$/i)) {
        assets.media.push(fileInfo);
      } else {
        assets.other.push(fileInfo);
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
 * Main analysis function
 */
async function analyzeBundleSize() {
  console.log(chalk.blue.bold("\n🔍 Comprehensive Bundle Analysis\n"));

  if (!fs.existsSync(BUILD_DIR)) {
    console.error(chalk.red('❌ Build directory not found. Please run "npm run build" first.'));
    process.exit(1);
  }

  // Get total bundle size
  const totalSize = getDirectorySize(BUILD_DIR);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  const usagePercent = ((totalSize / LIMIT_BYTES) * 100).toFixed(1);
  const isWithinLimit = totalSize <= LIMIT_BYTES;

  // Analyze static pages
  const staticPages = analyzeStaticPages();

  // Analyze assets
  const assets = await analyzeAssets();

  // Load optimization history
  const optimizationHistory = loadOptimizationHistory();

  // Generate recommendations
  const recommendations = generateOptimizationRecommendations(totalSize, staticPages, assets);

  // Display results
  console.log(chalk.cyan("📊 Bundle Size Summary:"));
  console.log(
    `   Total Size: ${chalk.yellow(totalSizeMB + " MB")} (${chalk.yellow(usagePercent + "%")} of ${LIMIT_MB}MB limit)`
  );
  console.log(
    `   Status: ${isWithinLimit ? chalk.green("✅ WITHIN LIMIT") : chalk.red("❌ EXCEEDS LIMIT")}`
  );

  if (optimizationHistory.totalSaved > 0) {
    console.log(
      `   Total Optimizations Saved: ${chalk.green(filesize(optimizationHistory.totalSaved))}`
    );
  }

  console.log(chalk.cyan("\n📄 Static Pages Analysis:"));
  console.log(`   Total Pages: ${chalk.yellow(staticPages.totalPages)}`);
  console.log(`   Icon Pages: ${chalk.yellow(staticPages.iconPages)}`);
  console.log(`   Dynamic Routes: ${chalk.yellow(staticPages.dynamicRoutes)}`);

  if (staticPages.largestPages.length > 0) {
    console.log(chalk.cyan("\n📦 Largest Pages:"));
    staticPages.largestPages.slice(0, 5).forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.path} - ${chalk.yellow(page.sizeFormatted)}`);
    });
  }

  // Asset breakdown
  const jsTotal = assets.javascript.reduce((sum, file) => sum + file.size, 0);
  const cssTotal = assets.css.reduce((sum, file) => sum + file.size, 0);
  const mediaTotal = assets.media.reduce((sum, file) => sum + file.size, 0);

  console.log(chalk.cyan("\n📈 Asset Breakdown:"));
  console.log(
    `   JavaScript: ${chalk.yellow(filesize(jsTotal))} (${((jsTotal / totalSize) * 100).toFixed(1)}%)`
  );
  console.log(
    `   CSS: ${chalk.yellow(filesize(cssTotal))} (${((cssTotal / totalSize) * 100).toFixed(1)}%)`
  );
  console.log(
    `   Media: ${chalk.yellow(filesize(mediaTotal))} (${((mediaTotal / totalSize) * 100).toFixed(1)}%)`
  );

  // Top JavaScript files
  if (assets.javascript.length > 0) {
    console.log(chalk.cyan("\n📦 Largest JavaScript Files:"));
    assets.javascript.slice(0, 5).forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.file}`);
      console.log(
        `      Raw: ${chalk.yellow(filesize(file.size))} | Gzipped: ${chalk.green(filesize(file.gzipSize))}`
      );
    });
  }

  // Optimization recommendations
  if (recommendations.length > 0) {
    console.log(chalk.blue.bold("\n💡 Optimization Recommendations:\n"));
    recommendations.forEach((rec, index) => {
      const priorityColor =
        rec.priority === "CRITICAL"
          ? chalk.red
          : rec.priority === "HIGH"
            ? chalk.yellow
            : chalk.cyan;

      console.log(`${index + 1}. ${priorityColor(rec.priority)}: ${chalk.bold(rec.action)}`);
      console.log(`   ${rec.description}`);
      console.log(`   Estimated Savings: ${chalk.green(rec.estimatedSavings)}`);
      console.log(`   Steps:`);
      rec.steps.forEach((step) => console.log(`     • ${step}`));

      if (rec.files) {
        console.log(`   Affected Files:`);
        rec.files
          .slice(0, 3)
          .forEach((file) => console.log(`     • ${file.name} (${file.size})`));
      }
      console.log();
    });
  }

  // Optimization history
  if (optimizationHistory.actions.length > 0) {
    console.log(chalk.blue.bold("📊 Recent Optimizations:"));
    optimizationHistory.actions.slice(-3).forEach((action) => {
      console.log(
        `   • ${action.date}: ${action.description} (Saved: ${chalk.green(filesize(action.savedBytes))})`
      );
    });
    console.log();
  }

  // Exit with appropriate code
  if (!isWithinLimit) {
    console.log(chalk.red.bold("❌ BUNDLE SIZE CHECK FAILED"));
    console.log(chalk.red(`Bundle size (${totalSizeMB}MB) exceeds the ${LIMIT_MB}MB limit.`));
    process.exit(1);
  } else {
    console.log(chalk.green.bold("✅ BUNDLE SIZE CHECK PASSED"));
    process.exit(0);
  }
}

// Run the analysis
analyzeBundleSize().catch((error) => {
  console.error(chalk.red("Error analyzing bundle:"), error);
  process.exit(1);
});
