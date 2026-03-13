import { getManifest, showList } from "./manifest";

const list = (packageName: string = "") => {
  if (!packageName) {
    console.log("Available packages:");
    showList();
    console.log("\nUse 'rocketicons list <package>' to see the available icons");
  } else {
    const pkg = getManifest(packageName);
    console.log(`Available icons for ${pkg.name} (@${pkg.id}):`);
    for (const icon of pkg.icons) {
      console.log(`  ${icon}`);
    }
    console.log(`\nUse 'rocketicons add @${packageName}/<icon>' to add an icon`);
  }
};

export default list;
