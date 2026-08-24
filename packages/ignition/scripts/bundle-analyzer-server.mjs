#!/usr/bin/env node

import fs from "fs";
import path from "path";
import http from "http";
import chalk from "chalk";

// Configuration
const PORT = 3001;
const BUILD_DIR = ".next";
const REPORT_DIR = "bundle-reports";

/**
 * Generate HTML for bundle analyzer
 */
function generateAnalyzerHTML() {
  const reports = getAvailableReports();
  const latestReport = reports.length > 0 ? loadReport(reports[0].path) : null;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bundle Analyzer - Ignition</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 0;
            text-align: center;
            margin-bottom: 30px;
            border-radius: 10px;
        }
        .card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .metric { text-align: center; padding: 20px; }
        .metric-value { font-size: 2em; font-weight: bold; color: #667eea; }
        .metric-label { color: #666; margin-top: 5px; }
        .chart-container { height: 300px; margin: 20px 0; }
        .file-list { max-height: 400px; overflow-y: auto; }
        .file-item {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
        .file-item:hover { background: #f9f9f9; }
        .size-bar {
            height: 20px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 10px;
            margin: 5px 0;
        }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; color: #721c24; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; color: #155724; }
        .nav { display: flex; gap: 10px; margin-bottom: 20px; }
        .nav-item {
            padding: 10px 20px;
            background: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .nav-item.active { background: #667eea; color: white; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Bundle Analyzer</h1>
            <p>Comprehensive analysis of your Next.js bundle</p>
        </div>

        <div class="nav">
            <button class="nav-item active" onclick="showTab('overview')">Overview</button>
            <button class="nav-item" onclick="showTab('files')">Files</button>
            <button class="nav-item" onclick="showTab('insights')">Insights</button>
            <button class="nav-item" onclick="showTab('reports')">Reports</button>
        </div>

        <div id="overview" class="tab-content active">
            ${latestReport ? generateOverviewTab(latestReport) : '<div class="error">No reports available. Run "npm run size-report" to generate a report.</div>'}
        </div>

        <div id="files" class="tab-content">
            ${latestReport ? generateFilesTab(latestReport) : '<div class="error">No reports available.</div>'}
        </div>

        <div id="insights" class="tab-content">
            ${latestReport ? generateInsightsTab(latestReport) : '<div class="error">No reports available.</div>'}
        </div>

        <div id="reports" class="tab-content">
            ${generateReportsTab(reports)}
        </div>
    </div>

    <script>
        function showTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });

            // Show selected tab
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }

        function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    </script>
</body>
</html>`;
}

/**
 * Generate overview tab content
 */
function generateOverviewTab(report) {
  const totalSizeMB = (report.summary.totalSize / (1024 * 1024)).toFixed(2);
  const compressionSavingsMB = (report.summary.compressionSavings / (1024 * 1024)).toFixed(2);
  const limitMB = 220;
  const usagePercent = ((report.summary.totalSize / (220 * 1024 * 1024)) * 100).toFixed(1);

  return `
    <div class="grid">
        <div class="card metric">
            <div class="metric-value">${totalSizeMB} MB</div>
            <div class="metric-label">Total Bundle Size</div>
        </div>
        <div class="card metric">
            <div class="metric-value">${usagePercent}%</div>
            <div class="metric-label">of 220MB Limit</div>
        </div>
        <div class="card metric">
            <div class="metric-value">${compressionSavingsMB} MB</div>
            <div class="metric-label">Compression Savings</div>
        </div>
        <div class="card metric">
            <div class="metric-value">${report.summary.totalFiles}</div>
            <div class="metric-label">Total Files</div>
        </div>
    </div>

    <div class="card">
        <h3>Size Breakdown</h3>
        <div style="margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>JavaScript: ${formatBytes(report.breakdown.javascript.totalSize)}</span>
                <span>${((report.breakdown.javascript.totalSize / report.summary.totalSize) * 100).toFixed(1)}%</span>
            </div>
            <div class="size-bar" style="width: ${(report.breakdown.javascript.totalSize / report.summary.totalSize) * 100}%"></div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>CSS: ${formatBytes(report.breakdown.css.totalSize)}</span>
                <span>${((report.breakdown.css.totalSize / report.summary.totalSize) * 100).toFixed(1)}%</span>
            </div>
            <div class="size-bar" style="width: ${(report.breakdown.css.totalSize / report.summary.totalSize) * 100}%"></div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Media: ${formatBytes(report.breakdown.media.totalSize)}</span>
                <span>${((report.breakdown.media.totalSize / report.summary.totalSize) * 100).toFixed(1)}%</span>
            </div>
            <div class="size-bar" style="width: ${(report.breakdown.media.totalSize / report.summary.totalSize) * 100}%"></div>
        </div>
    </div>

    ${
      parseFloat(usagePercent) > 90
        ? '<div class="error"><strong>⚠️ Warning:</strong> Bundle size is approaching the 220MB limit!</div>'
        : parseFloat(usagePercent) > 75
          ? '<div class="recommendations"><strong>💡 Notice:</strong> Bundle size is getting large. Consider optimization.</div>'
          : '<div class="success"><strong>✅ Good:</strong> Bundle size is within acceptable limits.</div>'
    }
  `;
}

/**
 * Generate files tab content
 */
function generateFilesTab(report) {
  const allFiles = [
    ...report.breakdown.javascript.files.map((f) => ({ ...f, type: "JavaScript" })),
    ...report.breakdown.css.files.map((f) => ({ ...f, type: "CSS" })),
    ...report.breakdown.media.files.map((f) => ({ ...f, type: "Media" }))
  ].sort((a, b) => b.size - a.size);

  return `
    <div class="card">
        <h3>Largest Files</h3>
        <div class="file-list">
            ${allFiles
              .slice(0, 50)
              .map(
                (file) => `
                <div class="file-item">
                    <div>
                        <strong>${file.file}</strong>
                        <div style="font-size: 0.9em; color: #666;">${file.type}</div>
                    </div>
                    <div style="text-align: right;">
                        <div>${formatBytes(file.size)}</div>
                        ${file.gzipSize ? `<div style="font-size: 0.9em; color: #666;">Gzipped: ${formatBytes(file.gzipSize)}</div>` : ""}
                    </div>
                </div>
            `
              )
              .join("")}
        </div>
    </div>
  `;
}

/**
 * Generate insights tab content
 */
function generateInsightsTab(report) {
  return `
    <div class="card">
        <h3>Performance Insights</h3>
        ${report.insights
          .map(
            (insight) => `
            <div class="${insight.type === "warning" ? "error" : "recommendations"}" style="margin-bottom: 15px;">
                <strong>${insight.type === "warning" ? "⚠️" : "ℹ️"} ${insight.title}:</strong>
                <p>${insight.description}</p>
                ${insight.recommendation ? `<p><em>Recommendation: ${insight.recommendation}</em></p>` : ""}
            </div>
        `
          )
          .join("")}
    </div>

    <div class="card">
        <h3>Optimization Recommendations</h3>
        <ul style="padding-left: 20px;">
            ${report.recommendations.map((rec) => `<li style="margin-bottom: 10px;">${rec}</li>`).join("")}
        </ul>
    </div>
  `;
}

/**
 * Generate reports tab content
 */
function generateReportsTab(reports) {
  return `
    <div class="card">
        <h3>Available Reports</h3>
        <div class="file-list">
            ${reports
              .map(
                (report) => `
                <div class="file-item">
                    <div>
                        <strong>${report.file}</strong>
                        <div style="font-size: 0.9em; color: #666;">${new Date(report.date).toLocaleString()}</div>
                    </div>
                    <div>
                        <a href="/report/${report.file}" style="color: #667eea; text-decoration: none;">View JSON</a>
                    </div>
                </div>
            `
              )
              .join("")}
        </div>
    </div>
  `;
}

/**
 * Helper functions
 */
function getAvailableReports() {
  if (!fs.existsSync(REPORT_DIR)) {
    return [];
  }
  return fs
    .readdirSync(REPORT_DIR)
    .filter((file) => file.endsWith(".json") && !file.startsWith("comparison-"))
    .map((file) => ({
      file: file,
      path: path.join(REPORT_DIR, file),
      date: fs.statSync(path.join(REPORT_DIR, file)).mtime
    }))
    .sort((a, b) => b.date - a.date);
}

function loadReport(reportPath) {
  try {
    return JSON.parse(fs.readFileSync(reportPath, "utf8"));
  } catch (error) {
    return null;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Start the server
 */
function startServer() {
  const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "text/html");

    if (req.url === "/") {
      res.writeHead(200);
      res.end(generateAnalyzerHTML());
    } else if (req.url.startsWith("/report/")) {
      const reportFile = req.url.replace("/report/", "");
      const reportPath = path.join(REPORT_DIR, reportFile);

      if (fs.existsSync(reportPath)) {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end(fs.readFileSync(reportPath));
      } else {
        res.writeHead(404);
        res.end("Report not found");
      }
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  server.listen(PORT, () => {
    console.log(chalk.green(`🚀 Bundle Analyzer Server running at http://localhost:${PORT}`));
    console.log(chalk.cyan("📊 View your bundle analysis in the browser"));
    console.log(chalk.gray("Press Ctrl+C to stop the server\n"));
  });
}

// Start the server
startServer();
