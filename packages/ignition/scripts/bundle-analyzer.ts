import * as fs from "fs";
import * as path from "path";

interface DirectoryStats {
  files: number;
  size: number;
}

function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function getDirectorySize(dirPath: string): DirectoryStats {
  let totalSize = 0;
  let totalFiles = 0;

  function calculateSize(currentPath: string): void {
    try {
      const stats = fs.statSync(currentPath);

      if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        files.forEach((file) => {
          calculateSize(path.join(currentPath, file));
        });
      } else {
        totalSize += stats.size;
        totalFiles++;
      }
    } catch (error) {
      console.warn(`Warning: Could not access ${currentPath}:`, (error as Error).message);
    }
  }

  if (fs.existsSync(dirPath)) {
    calculateSize(dirPath);
  }

  return { files: totalFiles, size: totalSize };
}

function analyzeBundleSizes(): void {
  console.log("🔍 Analyzing bundle sizes...\n");

  const directories = [
    { name: "Next.js Build (.next)", path: ".next" },
    { name: "Static Assets (.next/static)", path: ".next/static" },
    { name: "Server Bundle (.next/server)", path: ".next/server" },
    { name: "Build Cache (.next/cache)", path: ".next/cache" },
    { name: "Public Icons (public/icons)", path: "public/icons" },
    { name: "Source Code (src)", path: "src" },
    { name: "Node Modules (node_modules)", path: "node_modules" }
  ];

  let totalDeploymentSize = 0;
  const deploymentDirs = [".next/static", ".next/server"];
  // Note: public/icons is excluded as it's generated during build and ignored in git

  directories.forEach(({ name, path: dirPath }) => {
    const stats = getDirectorySize(dirPath);
    const sizeFormatted = formatBytes(stats.size);
    const filesFormatted = stats.files.toLocaleString();

    console.log(`📁 ${name}:`);
    console.log(`   Size: ${sizeFormatted}`);
    console.log(`   Files: ${filesFormatted}`);

    // Add note for generated content
    if (dirPath === "public/icons") {
      console.log(`   Note: Generated during build (excluded from deployment size)`);
    }
    console.log("");

    // Calculate deployment size (exclude cache, node_modules, and generated public/icons)
    if (deploymentDirs.some((deployDir) => dirPath.startsWith(deployDir))) {
      totalDeploymentSize += stats.size;
    }
  });

  console.log("📊 Summary:");
  console.log(`   Total Deployment Size: ${formatBytes(totalDeploymentSize)}`);
  console.log(`   Target Limit: 220 MB`);

  const percentageOfLimit = (totalDeploymentSize / (220 * 1024 * 1024)) * 100;
  console.log(`   Percentage of Limit: ${percentageOfLimit.toFixed(1)}%`);

  if (totalDeploymentSize > 220 * 1024 * 1024) {
    console.log("❌ Bundle size exceeds 220MB limit!");
    process.exit(1);
  } else {
    console.log("✅ Bundle size is within limits!");
  }
}

// Run the analyzer
analyzeBundleSizes();
