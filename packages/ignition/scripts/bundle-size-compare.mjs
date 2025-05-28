#!/usr/bin/env node

import fs from "fs";
import path from "path";
import chalk from "chalk";
import { filesize } from "filesize";

// Configuration
const REPORT_DIR = "bundle-reports";

/**
 * Get all available reports
 */
function getAvailableReports() {
  if (!fs.existsSync(REPORT_DIR)) {
    return [];
  }

  return fs
    .readdirSync(REPORT_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const filePath = path.join(REPORT_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        file: file,
        path: filePath,
        date: stats.mtime
      };
    })
    .sort((a, b) => b.date - a.date);
}

/**
 * Load report data
 */
function loadReport(reportPath) {
  try {
    const content = fs.readFileSync(reportPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error(chalk.red(`Error loading report ${reportPath}:`, error.message));
    return null;
  }
}

/**
 * Compare two reports
 */
function compareReports(current, previous) {
  const comparison = {
    timestamp: new Date().toISOString(),
    current: {
      date: current.timestamp,
      size: current.summary.totalSize,
      sizeMB: current.summary.totalSizeMB
    },
    previous: {
      date: previous.timestamp,
      size: previous.summary.totalSize,
      sizeMB: previous.summary.totalSizeMB
    },
    changes: {
      totalSize: current.summary.totalSize - previous.summary.totalSize,
      totalSizePercent: (
        ((current.summary.totalSize - previous.summary.totalSize) / previous.summary.totalSize) *
        100
      ).toFixed(2),
      javascript: {
        current: current.breakdown.javascript.totalSize,
        previous: previous.breakdown.javascript.totalSize,
        change: current.breakdown.javascript.totalSize - previous.breakdown.javascript.totalSize
      },
      css: {
        current: current.breakdown.css.totalSize,
        previous: previous.breakdown.css.totalSize,
        change: current.breakdown.css.totalSize - previous.breakdown.css.totalSize
      },
      media: {
        current: current.breakdown.media.totalSize,
        previous: previous.breakdown.media.totalSize,
        change: current.breakdown.media.totalSize - previous.breakdown.media.totalSize
      }
    },
    fileChanges: {
      added: [],
      removed: [],
      modified: []
    }
  };

  // Analyze file changes
  const currentFiles = new Map();
  const previousFiles = new Map();

  // Build file maps
  Object.values(current.breakdown).forEach((category) => {
    if (category.files) {
      category.files.forEach((file) => {
        currentFiles.set(file.file, file);
      });
    }
  });

  Object.values(previous.breakdown).forEach((category) => {
    if (category.files) {
      category.files.forEach((file) => {
        previousFiles.set(file.file, file);
      });
    }
  });

  // Find added files
  currentFiles.forEach((file, filename) => {
    if (!previousFiles.has(filename)) {
      comparison.fileChanges.added.push({
        file: filename,
        size: file.size,
        sizeFormatted: filesize(file.size)
      });
    }
  });

  // Find removed files
  previousFiles.forEach((file, filename) => {
    if (!currentFiles.has(filename)) {
      comparison.fileChanges.removed.push({
        file: filename,
        size: file.size,
        sizeFormatted: filesize(file.size)
      });
    }
  });

  // Find modified files
  currentFiles.forEach((currentFile, filename) => {
    const previousFile = previousFiles.get(filename);
    if (previousFile && currentFile.size !== previousFile.size) {
      const change = currentFile.size - previousFile.size;
      comparison.fileChanges.modified.push({
        file: filename,
        currentSize: currentFile.size,
        previousSize: previousFile.size,
        change: change,
        changeFormatted: filesize(Math.abs(change)),
        changePercent: ((change / previousFile.size) * 100).toFixed(2),
        direction: change > 0 ? "increased" : "decreased"
      });
    }
  });

  // Sort modified files by absolute change
  comparison.fileChanges.modified.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  return comparison;
}

/**
 * Display comparison results
 */
function displayComparison(comparison) {
  console.log(chalk.blue.bold("\n📊 Bundle Size Comparison\n"));

  // Overall changes
  const totalChange = comparison.changes.totalSize;
  const totalChangePercent = comparison.changes.totalSizePercent;
  const changeIcon = totalChange > 0 ? "📈" : totalChange < 0 ? "📉" : "➡️";
  const changeColor = totalChange > 0 ? chalk.red : totalChange < 0 ? chalk.green : chalk.yellow;

  console.log(chalk.cyan("📅 Comparison Period:"));
  console.log(`   Previous: ${new Date(comparison.previous.date).toLocaleString()}`);
  console.log(`   Current:  ${new Date(comparison.current.date).toLocaleString()}\n`);

  console.log(chalk.cyan("📊 Size Changes:"));
  console.log(`   Previous: ${filesize(comparison.previous.size)}`);
  console.log(`   Current:  ${filesize(comparison.current.size)}`);
  console.log(
    `   ${changeIcon} Change: ${changeColor(filesize(Math.abs(totalChange)))} (${totalChangePercent}%)\n`
  );

  // Category breakdown
  console.log(chalk.yellow.bold("📦 Category Breakdown:"));

  const categories = ["javascript", "css", "media"];
  categories.forEach((category) => {
    const change = comparison.changes[category];
    if (change) {
      const changeIcon = change.change > 0 ? "📈" : change.change < 0 ? "📉" : "➡️";
      const changeColor =
        change.change > 0 ? chalk.red : change.change < 0 ? chalk.green : chalk.yellow;
      const changePercent =
        change.previous > 0 ? ((change.change / change.previous) * 100).toFixed(2) : "0.00";

      console.log(`   ${category.charAt(0).toUpperCase() + category.slice(1)}:`);
      console.log(`     Previous: ${filesize(change.previous)}`);
      console.log(`     Current:  ${filesize(change.current)}`);
      console.log(
        `     ${changeIcon} Change: ${changeColor(filesize(Math.abs(change.change)))} (${changePercent}%)`
      );
    }
  });

  // File changes
  if (comparison.fileChanges.added.length > 0) {
    console.log(chalk.green.bold("\n➕ Added Files:"));
    comparison.fileChanges.added.slice(0, 10).forEach((file) => {
      console.log(`   + ${file.file} (${file.sizeFormatted})`);
    });
    if (comparison.fileChanges.added.length > 10) {
      console.log(`   ... and ${comparison.fileChanges.added.length - 10} more`);
    }
  }

  if (comparison.fileChanges.removed.length > 0) {
    console.log(chalk.red.bold("\n➖ Removed Files:"));
    comparison.fileChanges.removed.slice(0, 10).forEach((file) => {
      console.log(`   - ${file.file} (${file.sizeFormatted})`);
    });
    if (comparison.fileChanges.removed.length > 10) {
      console.log(`   ... and ${comparison.fileChanges.removed.length - 10} more`);
    }
  }

  if (comparison.fileChanges.modified.length > 0) {
    console.log(chalk.blue.bold("\n🔄 Modified Files (Top 10):"));
    comparison.fileChanges.modified.slice(0, 10).forEach((file) => {
      const changeIcon = file.direction === "increased" ? "📈" : "📉";
      const changeColor = file.direction === "increased" ? chalk.red : chalk.green;
      console.log(`   ${changeIcon} ${file.file}`);
      console.log(
        `     ${changeColor(file.changeFormatted)} (${file.changePercent}%) ${file.direction}`
      );
    });
  }

  // Recommendations
  if (totalChange > 0) {
    console.log(chalk.yellow.bold("\n💡 Recommendations:"));
    console.log("   • Bundle size has increased - consider investigating large changes");
    console.log("   • Review added files and their necessity");
    console.log("   • Check for dependency updates that might have increased size");
    console.log("   • Consider code splitting for large increases");
  } else if (totalChange < 0) {
    console.log(chalk.green.bold("\n🎉 Great job!"));
    console.log("   • Bundle size has decreased - excellent optimization work!");
  }

  console.log();
}

/**
 * Main comparison function
 */
async function runComparison() {
  const reports = getAvailableReports();

  if (reports.length < 2) {
    console.error(
      chalk.red(
        '❌ Need at least 2 reports to compare. Run "npm run size-report" to generate reports.'
      )
    );
    process.exit(1);
  }

  // Use the two most recent reports
  const currentReport = loadReport(reports[0].path);
  const previousReport = loadReport(reports[1].path);

  if (!currentReport || !previousReport) {
    console.error(chalk.red("❌ Failed to load reports for comparison."));
    process.exit(1);
  }

  const comparison = compareReports(currentReport, previousReport);
  displayComparison(comparison);

  // Save comparison report
  const comparisonFile = path.join(
    REPORT_DIR,
    `comparison-${new Date().toISOString().split("T")[0]}.json`
  );
  fs.writeFileSync(comparisonFile, JSON.stringify(comparison, null, 2));

  console.log(chalk.gray(`Comparison report saved to: ${comparisonFile}`));
}

// Run the comparison
runComparison().catch((error) => {
  console.error(chalk.red("Error during comparison:"), error);
  process.exit(1);
});
