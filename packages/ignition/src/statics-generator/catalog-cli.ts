import { generateStaticCatalog } from "./collections-catalog";
import { readFileSync } from "node:fs";
import { IconsManifest } from "rocketicons/data";

// Release archives must include every collection, even when the site build
// defaults to a smaller development subset.
process.env.RI_GENERATE_ALL_ICONS = "true";

generateStaticCatalog()
  .then(() => {
    const catalog = JSON.parse(readFileSync("./public/ai/v1/catalog.json", "utf8"));
    if (catalog.collections.length !== IconsManifest.length) {
      throw new Error(
        `Generated ${catalog.collections.length} collections; expected ${IconsManifest.length}`
      );
    }
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
