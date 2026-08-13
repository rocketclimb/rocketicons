#!/usr/bin/env node

import fs from "fs";
import path from "path";
import chalk from "chalk";
import { filesize } from "filesize";

const OPTIMIZATION_LOG = "bundle-optimization-log.json";
const BUILD_DIR = ".next";

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
 * Load optimization history
 */
function loadOptimizationHistory() {
  if (fs.existsSync(OPTIMIZATION_LOG)) {
    try {
      return JSON.parse(fs.readFileSync(OPTIMIZATION_LOG, "utf8"));
    } catch (error) {
      return { actions: [], totalSaved: 0, baselines: [] };
    }
  }
  return { actions: [], totalSaved: 0, baselines: [] };
}

/**
 * Save optimization history
 */
function saveOptimizationHistory(history) {
  fs.writeFileSync(OPTIMIZATION_LOG, JSON.stringify(history, null, 2));
}

/**
 * Record a new optimization action
 */
function recordOptimization(description, beforeSize, afterSize, details = {}) {
  const history = loadOptimizationHistory();
  const savedBytes = beforeSize - afterSize;

  const action = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    description,
    beforeSize,
    afterSize,
    savedBytes,
    savedFormatted: filesize(savedBytes),
    details,
    timestamp: Date.now()
  };

  history.actions.push(action);
  history.totalSaved += savedBytes;

  saveOptimizationHistory(history);

  console.log(chalk.green.bold("✅ Optimization Recorded!"));
  console.log(`   Action: ${description}`);
  console.log(
    `   Size Reduction: ${chalk.yellow(filesize(beforeSize))} → ${chalk.green(filesize(afterSize))}`
  );
  console.log(`   Saved: ${chalk.green(filesize(savedBytes))}`);
  console.log(`   Total Saved: ${chalk.green(filesize(history.totalSaved))}`);

  return action;
}

/**
 * Set a baseline measurement
 */
function setBaseline(label = "baseline") {
  if (!fs.existsSync(BUILD_DIR)) {
    console.error(chalk.red('❌ Build directory not found. Please run "npm run build" first.'));
    process.exit(1);
  }

  const currentSize = getDirectorySize(BUILD_DIR);
  const history = loadOptimizationHistory();

  const baseline = {
    id: Date.now().toString(),
    label,
    size: currentSize,
    sizeFormatted: filesize(currentSize),
    date: new Date().toISOString(),
    timestamp: Date.now()
  };

  history.baselines.push(baseline);
  saveOptimizationHistory(history);

  console.log(chalk.blue.bold("📊 Baseline Set!"));
  console.log(`   Label: ${label}`);
  console.log(`   Size: ${chalk.yellow(filesize(currentSize))}`);

  return baseline;
}

/**
 * Compare current size with baseline
 */
function compareWithBaseline(baselineLabel = null) {
  if (!fs.existsSync(BUILD_DIR)) {
    console.error(chalk.red('❌ Build directory not found. Please run "npm run build" first.'));
    process.exit(1);
  }

  const currentSize = getDirectorySize(BUILD_DIR);
  const history = loadOptimizationHistory();

  if (history.baselines.length === 0) {
    console.log(
      chalk.yellow(
        "⚠️  No baselines found. Set a baseline first with: npm run optimization:baseline"
      )
    );
    return;
  }

  // Find baseline
  let baseline;
  if (baselineLabel) {
    baseline = history.baselines.find((b) => b.label === baselineLabel);
    if (!baseline) {
      console.log(chalk.red(`❌ Baseline "${baselineLabel}" not found.`));
      return;
    }
  } else {
    baseline = history.baselines[history.baselines.length - 1]; // Latest baseline
  }

  const difference = currentSize - baseline.size;
  const isImprovement = difference < 0;
  const changePercent = ((Math.abs(difference) / baseline.size) * 100).toFixed(2);

  console.log(chalk.blue.bold("📊 Bundle Size Comparison"));
  console.log(`   Baseline (${baseline.label}): ${chalk.yellow(baseline.sizeFormatted)}`);
  console.log(`   Current Size: ${chalk.yellow(filesize(currentSize))}`);

  if (isImprovement) {
    console.log(
      `   Change: ${chalk.green(`-${filesize(Math.abs(difference))} (-${changePercent}%)`)}`
    );
    console.log(`   Status: ${chalk.green("✅ IMPROVEMENT")}`);
  } else if (difference === 0) {
    console.log(`   Change: ${chalk.gray("No change")}`);
    console.log(`   Status: ${chalk.gray("➡️ UNCHANGED")}`);
  } else {
    console.log(`   Change: ${chalk.red(`+${filesize(difference)} (+${changePercent}%)`)}`);
    console.log(`   Status: ${chalk.red("⚠️ SIZE INCREASED")}`);
  }

  return {
    baseline,
    currentSize,
    difference,
    isImprovement,
    changePercent
  };
}

/**
 * Show optimization history
 */
function showHistory() {
  const history = loadOptimizationHistory();

  console.log(chalk.blue.bold("📊 Optimization History\n"));

  if (history.baselines.length > 0) {
    console.log(chalk.cyan("📍 Baselines:"));
    history.baselines.forEach((baseline, index) => {
      console.log(
        `   ${index + 1}. ${baseline.label} - ${chalk.yellow(baseline.sizeFormatted)} (${new Date(baseline.date).toLocaleDateString()})`
      );
    });
    console.log();
  }

  if (history.actions.length > 0) {
    console.log(chalk.cyan("🔧 Optimization Actions:"));
    console.log(`   Total Saved: ${chalk.green(filesize(history.totalSaved))}\n`);

    history.actions.slice(-10).forEach((action, index) => {
      const date = new Date(action.date).toLocaleDateString();
      console.log(`   ${history.actions.length - 10 + index + 1}. ${action.description}`);
      console.log(`      Date: ${date}`);
      console.log(`      Saved: ${chalk.green(action.savedFormatted)}`);
      console.log(
        `      Before: ${chalk.yellow(filesize(action.beforeSize))} → After: ${chalk.green(filesize(action.afterSize))}`
      );
      if (action.details && Object.keys(action.details).length > 0) {
        console.log(
          `      Details: ${JSON.stringify(action.details, null, 2).replace(/\n/g, "\n        ")}`
        );
      }
      console.log();
    });
  } else {
    console.log(chalk.gray("   No optimization actions recorded yet."));
  }
}

/**
 * Suggest optimizations based on current bundle
 */
function suggestOptimizations() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.error(chalk.red('❌ Build directory not found. Please run "npm run build" first.'));
    process.exit(1);
  }

  const currentSize = getDirectorySize(BUILD_DIR);
  const sizeMB = currentSize / (1024 * 1024);
  const limitMB = 220;
  const usagePercent = (currentSize / (limitMB * 1024 * 1024)) * 100;

  console.log(chalk.blue.bold("💡 Optimization Suggestions\n"));
  console.log(
    `Current Size: ${chalk.yellow(filesize(currentSize))} (${usagePercent.toFixed(1)}% of ${limitMB}MB limit)\n`
  );

  const suggestions = [
    {
      title: "Dynamic Imports",
      description: "Convert large components to dynamic imports",
      command:
        "npm run optimization:record 'Implemented dynamic imports' <before_size> <after_size>",
      estimatedSavings: "2-8MB",
      priority: usagePercent > 75 ? "HIGH" : "MEDIUM"
    },
    {
      title: "Remove Unused Dependencies",
      description: "Audit and remove unused npm packages",
      command:
        "npm run optimization:record 'Removed unused dependencies' <before_size> <after_size>",
      estimatedSavings: "1-5MB",
      priority: "MEDIUM"
    },
    {
      title: "Image Optimization",
      description: "Optimize images and use Next.js Image component",
      command: "npm run optimization:record 'Optimized images' <before_size> <after_size>",
      estimatedSavings: "1-3MB",
      priority: "LOW"
    },
    {
      title: "Code Splitting",
      description: "Split large pages into smaller chunks",
      command:
        "npm run optimization:record 'Implemented code splitting' <before_size> <after_size>",
      estimatedSavings: "3-10MB",
      priority: usagePercent > 80 ? "HIGH" : "MEDIUM"
    }
  ];

  suggestions.forEach((suggestion, index) => {
    const priorityColor =
      suggestion.priority === "HIGH"
        ? chalk.red
        : suggestion.priority === "MEDIUM"
          ? chalk.yellow
          : chalk.green;

    console.log(
      `${index + 1}. ${chalk.bold(suggestion.title)} (${priorityColor(suggestion.priority)})`
    );
    console.log(`   ${suggestion.description}`);
    console.log(`   Estimated Savings: ${chalk.green(suggestion.estimatedSavings)}`);
    console.log(`   Record Command: ${chalk.gray(suggestion.command)}`);
    console.log();
  });
}

/**
 * Main CLI handler
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "baseline":
      const label = args[1] || `baseline-${new Date().toISOString().split("T")[0]}`;
      setBaseline(label);
      break;

    case "compare":
      const baselineLabel = args[1];
      compareWithBaseline(baselineLabel);
      break;

    case "record":
      if (args.length < 4) {
        console.log(
          chalk.red(
            "❌ Usage: npm run optimization:record '<description>' <before> <after> [details]"
          )
        );
        console.log(
          "   Example: npm run optimization:record 'Removed unused deps' 35000000 32000000"
        );
        process.exit(1);
      }
      const description = args[1];
      const beforeSize = parseInt(args[2]);
      const afterSize = parseInt(args[3]);
      const details = args[4] ? JSON.parse(args[4]) : {};
      recordOptimization(description, beforeSize, afterSize, details);
      break;

    case "history":
      showHistory();
      break;

    case "suggest":
      suggestOptimizations();
      break;

    default:
      console.log(chalk.blue.bold("🔧 Bundle Optimization Tracker\n"));
      console.log("Available commands:");
      console.log("  baseline [label]           - Set a baseline measurement");
      console.log("  compare [baseline_label]   - Compare current size with baseline");
      console.log("  record <desc> <before> <after> [details] - Record an optimization");
      console.log("  history                    - Show optimization history");
      console.log("  suggest                    - Get optimization suggestions");
      console.log("\nExamples:");
      console.log("  npm run optimization:baseline");
      console.log("  npm run optimization:record 'Dynamic imports' 35000000 32000000");
      console.log("  npm run optimization:compare");
      console.log("  npm run optimization:history");
  }
}

main();
