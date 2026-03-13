import * as fs from "fs";
import * as path from "path";

// Static manifest to avoid import issues
interface CollectionInfo {
  id: string;
  name: string;
}

const IconsManifest: CollectionInfo[] = [
  { id: "fa", name: "Font Awesome" },
  { id: "md", name: "Material Design" },
  { id: "bi", name: "Bootstrap Icons" },
  { id: "bs", name: "Bootstrap" },
  { id: "io", name: "Ionicons" },
  { id: "lu", name: "Lucide" },
  { id: "hi", name: "Heroicons" },
  { id: "tb", name: "Tabler Icons" },
  { id: "ai", name: "Ant Design" },
  { id: "ri", name: "Remix Icon" },
  { id: "rc", name: "RocketClimb" },
  { id: "cg", name: "CSS.gg" },
  { id: "ci", name: "Circum Icons" },
  { id: "di", name: "Devicons" },
  { id: "fa6", name: "Font Awesome 6" },
  { id: "fc", name: "Flat Color Icons" },
  { id: "fi", name: "Feather Icons" },
  { id: "gi", name: "Game Icons" },
  { id: "go", name: "Github Octicons" },
  { id: "gr", name: "Grommet Icons" },
  { id: "hi2", name: "Heroicons 2" },
  { id: "im", name: "IcoMoon Free" },
  { id: "io5", name: "Ionicons 5" },
  { id: "lia", name: "Line Awesome" },
  { id: "pi", name: "Phosphor Icons" },
  { id: "rx", name: "Radix Icons" },
  { id: "si", name: "Simple Icons" },
  { id: "sl", name: "Simple Line Icons" },
  { id: "tfi", name: "Themify Icons" },
  { id: "ti", name: "Typicons" },
  { id: "vsc", name: "VS Code Icons" },
  { id: "wi", name: "Weather Icons" }
];

// Paths
const GENERATOR_SVGS_DIR = path.resolve(__dirname, "../../../packages/generator/svgs");
const PUBLIC_ICONS_DIR = path.resolve(__dirname, "../public/icons");

// Ensure directory exists
const ensureDir = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

interface CopyResult {
  copied: number;
  errors: number;
}

// Copy JSON files for a single collection
const copyCollectionJSONs = async (collection: CollectionInfo): Promise<CopyResult> => {
  const sourceDir = path.join(GENERATOR_SVGS_DIR, collection.id);
  const destDir = path.join(PUBLIC_ICONS_DIR, collection.id);

  if (!fs.existsSync(sourceDir)) {
    console.warn(`⚠️  Source directory not found: ${sourceDir}`);
    return { copied: 0, errors: 0 };
  }

  console.log(`📁 Copying JSON files for: ${collection.id}`);
  ensureDir(destDir);

  const jsonFiles = fs.readdirSync(sourceDir).filter((file) => file.endsWith(".json"));
  let copiedCount = 0;
  let errorCount = 0;

  for (const jsonFile of jsonFiles) {
    try {
      const sourcePath = path.join(sourceDir, jsonFile);
      const destPath = path.join(destDir, jsonFile);

      // Simply copy the JSON file
      const jsonContent = fs.readFileSync(sourcePath, "utf8");
      fs.writeFileSync(destPath, jsonContent, "utf8");
      copiedCount++;
    } catch (error) {
      console.error(`❌ Error copying ${jsonFile}:`, (error as Error).message);
      errorCount++;
    }
  }

  console.log(`✅ ${collection.id}: ${copiedCount} JSON files copied, ${errorCount} errors`);
  return { copied: copiedCount, errors: errorCount };
};

interface ManifestData {
  generated: string;
  totalJSONs: number;
  collections: Array<{
    id: string;
    name: string;
    jsonCount: number;
  }>;
}

// Main function
export const copyJSONIcons = async (): Promise<void> => {
  console.log("🚀 Copying JSON icon files to public folder...\n");

  // Clean existing public/icons directory
  if (fs.existsSync(PUBLIC_ICONS_DIR)) {
    fs.rmSync(PUBLIC_ICONS_DIR, { recursive: true, force: true });
  }
  ensureDir(PUBLIC_ICONS_DIR);

  let totalCopied = 0;
  let totalErrors = 0;

  // Process each collection
  for (const collection of IconsManifest) {
    try {
      const result = await copyCollectionJSONs(collection);
      totalCopied += result.copied;
      totalErrors += result.errors;
    } catch (error) {
      console.error(
        `❌ Failed to process collection ${collection.id}:`,
        (error as Error).message
      );
      totalErrors++;
    }
  }

  console.log(`\n🎉 Copy complete!`);
  console.log(`📊 Total JSON files: ${totalCopied}`);
  console.log(`❌ Total errors: ${totalErrors}`);
  console.log(`📁 Output directory: ${PUBLIC_ICONS_DIR}`);

  // Generate a manifest file
  const manifest: ManifestData = {
    generated: new Date().toISOString(),
    totalJSONs: totalCopied,
    collections: IconsManifest.map((collection) => ({
      id: collection.id,
      name: collection.name,
      jsonCount: fs.existsSync(path.join(PUBLIC_ICONS_DIR, collection.id))
        ? fs.readdirSync(path.join(PUBLIC_ICONS_DIR, collection.id)).length
        : 0
    }))
  };

  fs.writeFileSync(
    path.join(PUBLIC_ICONS_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`📋 Manifest written to: ${path.join(PUBLIC_ICONS_DIR, "manifest.json")}`);

  // Calculate approximate size
  const totalSize = fs
    .readdirSync(PUBLIC_ICONS_DIR, { recursive: true })
    .filter((file) => typeof file === "string" && file.endsWith(".json"))
    .reduce((size, file) => {
      try {
        const filePath = path.join(PUBLIC_ICONS_DIR, file as string);
        return size + fs.statSync(filePath).size;
      } catch {
        return size;
      }
    }, 0);

  console.log(`📏 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`\n💡 Next steps:`);
  console.log(`1. Replace DynamicIcon with PublicJSONIcon in your components`);
  console.log(`2. Test the application`);
  console.log(`3. Run: npm run build`);
  console.log(`4. Check bundle size: npm run size-check`);
};

// Run if called directly
if (require.main === module) {
  copyJSONIcons().catch(console.error);
}
