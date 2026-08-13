// JSON ICONS GENERATOR - Calls the existing copy-json-icons script
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const generator = async () => {
  console.log("📁 Generating JSON icon files...");

  try {
    // Call the TypeScript script using ts-node
    const { stdout, stderr } = await execAsync("npx ts-node scripts/copy-json-icons.ts", {
      cwd: process.cwd()
    });

    if (stdout) {
      console.log(stdout);
    }

    if (stderr) {
      console.error(stderr);
    }

    console.log("✅ JSON icon files generated successfully");
  } catch (error) {
    console.error("❌ Failed to generate JSON icon files:", error);
    throw error;
  }
};

generator().catch((error) => {
  console.error("❌ JSON icons generation failed:", error);
  process.exit(1);
});
