import * as fs from "fs";
import * as path from "path";

const DATA_APP = "./src/app/";
const DATA_DIR = `${DATA_APP}data-helpers/`;

const write = async (filename: string, content: string, noDataApp?: boolean): Promise<void> => {
  filename = `${noDataApp ? "" : DATA_DIR}${filename}`;

  await fs.mkdirSync(path.dirname(filename), { recursive: true });
  await fs.writeFileSync(filename, content);
};

const OUTPUT_FILE = "icons/manifest-from-public.ts";
const PKG_VERSION = "0.2.8";

// Collection metadata (licenses, URLs, etc.)
const collectionMetadata: Record<
  string,
  {
    name: string;
    projectUrl: string;
    license: { type: string; url: string };
  }
> = {
  fa: {
    name: "Font Awesome",
    projectUrl: "https://fontawesome.com",
    license: { type: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" }
  },
  md: {
    name: "Material Design",
    projectUrl: "https://material.io/icons",
    license: { type: "Apache 2.0", url: "https://www.apache.org/licenses/LICENSE-2.0" }
  },
  bi: {
    name: "Bootstrap Icons",
    projectUrl: "https://icons.getbootstrap.com",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  bs: {
    name: "Bootstrap",
    projectUrl: "https://getbootstrap.com",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  io: {
    name: "Ionicons",
    projectUrl: "https://ionic.io/ionicons",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  lu: {
    name: "Lucide",
    projectUrl: "https://lucide.dev",
    license: { type: "ISC", url: "https://opensource.org/licenses/ISC" }
  },
  hi: {
    name: "Heroicons",
    projectUrl: "https://heroicons.com",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  tb: {
    name: "Tabler Icons",
    projectUrl: "https://tabler-icons.io",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  ai: {
    name: "Ant Design",
    projectUrl: "https://ant.design/components/icon",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  ri: {
    name: "Remix Icon",
    projectUrl: "https://remixicon.com",
    license: { type: "Apache 2.0", url: "https://www.apache.org/licenses/LICENSE-2.0" }
  },
  rc: {
    name: "RocketClimb",
    projectUrl: "https://rocketicons.com",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  cg: {
    name: "CSS.gg",
    projectUrl: "https://css.gg",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  ci: {
    name: "Circum Icons",
    projectUrl: "https://circumicons.com",
    license: { type: "MPL-2.0", url: "https://mozilla.org/MPL/2.0/" }
  },
  di: {
    name: "Devicons",
    projectUrl: "https://devicons.github.io/devicon",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  fa6: {
    name: "Font Awesome 6",
    projectUrl: "https://fontawesome.com",
    license: { type: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" }
  },
  fc: {
    name: "Flat Color Icons",
    projectUrl: "https://icons8.com/icons/color",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  fi: {
    name: "Feather Icons",
    projectUrl: "https://feathericons.com",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  gi: {
    name: "Game Icons",
    projectUrl: "https://game-icons.net",
    license: { type: "CC BY 3.0", url: "https://creativecommons.org/licenses/by/3.0/" }
  },
  go: {
    name: "Github Octicons",
    projectUrl: "https://primer.style/octicons",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  gr: {
    name: "Grommet Icons",
    projectUrl: "https://icons.grommet.io",
    license: { type: "Apache 2.0", url: "https://www.apache.org/licenses/LICENSE-2.0" }
  },
  hi2: {
    name: "Heroicons 2",
    projectUrl: "https://heroicons.com",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  im: {
    name: "IcoMoon Free",
    projectUrl: "https://icomoon.io",
    license: { type: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" }
  },
  io5: {
    name: "Ionicons 5",
    projectUrl: "https://ionic.io/ionicons",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  lia: {
    name: "Line Awesome",
    projectUrl: "https://icons8.com/line-awesome",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  pi: {
    name: "Phosphor Icons",
    projectUrl: "https://phosphoricons.com",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  rx: {
    name: "Radix Icons",
    projectUrl: "https://icons.radix-ui.com",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  si: {
    name: "Simple Icons",
    projectUrl: "https://simpleicons.org",
    license: { type: "CC0 1.0", url: "https://creativecommons.org/publicdomain/zero/1.0/" }
  },
  sl: {
    name: "Simple Line Icons",
    projectUrl: "https://simplelineicons.github.io",
    license: { type: "MIT", url: "https://opensource.org/licenses/MIT" }
  },
  tfi: {
    name: "Themify Icons",
    projectUrl: "https://themify.me/themify-icons",
    license: { type: "SIL OFL 1.1", url: "https://scripts.sil.org/OFL" }
  },
  ti: {
    name: "Typicons",
    projectUrl: "https://www.s-ings.com/typicons",
    license: { type: "CC BY-SA 3.0", url: "https://creativecommons.org/licenses/by-sa/3.0/" }
  },
  vsc: {
    name: "VS Code Icons",
    projectUrl: "https://github.com/microsoft/vscode-codicons",
    license: { type: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" }
  },
  wi: {
    name: "Weather Icons",
    projectUrl: "https://erikflowers.github.io/weather-icons",
    license: { type: "SIL OFL 1.1", url: "https://scripts.sil.org/OFL" }
  }
};

// Read manifest from icons package
const readIconsManifest = (collectionId: string) => {
  try {
    const manifestPath = path.resolve(__dirname, `../../../icons/${collectionId}/manifest.js`);
    if (!fs.existsSync(manifestPath)) {
      console.warn(`Manifest not found for ${collectionId}: ${manifestPath}`);
      return null;
    }

    // Clear require cache to ensure fresh read
    delete require.cache[manifestPath];
    const { manifest } = require(manifestPath);
    return manifest;
  } catch (error) {
    console.warn(`Failed to read manifest for ${collectionId}:`, error);
    return null;
  }
};

// Generate collection info from icons package
const generateCollectionInfo = (collectionId: string) => {
  const manifest = readIconsManifest(collectionId);
  const metadata = collectionMetadata[collectionId];

  if (!manifest || !metadata) {
    console.warn(`Missing data for collection ${collectionId}`);
    return null;
  }

  // Preserve the complete manifest structure with kebab-case IDs as keys
  const iconsManifest: Record<string, any> = {};
  Object.entries(manifest.icons).forEach(([compName, iconData]: [string, any]) => {
    iconsManifest[iconData.id] = {
      id: iconData.id,
      name: iconData.name,
      compName: iconData.compName,
      variant: iconData.variant
    };
  });

  const iconCount = Object.keys(iconsManifest).length;

  return {
    id: collectionId,
    name: metadata.name,
    jsonCount: iconCount,
    totalIcons: iconCount,
    projectUrl: metadata.projectUrl,
    license: metadata.license,
    licenseUrl: metadata.license.url,
    iconsManifest: iconsManifest // PRIMARY DATA SOURCE - Complete manifest with kebab-case IDs as keys
  };
};

const generator = async () => {
  console.log("🔍 Reading icons from package manifests...");

  const iconsDir = path.resolve(__dirname, "../../../icons");
  const collections = fs
    .readdirSync(iconsDir)
    .filter((item) => {
      const itemPath = path.join(iconsDir, item);
      return (
        fs.statSync(itemPath).isDirectory() &&
        !["core", "tailwind", "data"].includes(item) &&
        collectionMetadata[item]
      ); // Only include collections we have metadata for
    })
    .sort();

  console.log(`📦 Found ${collections.length} collections:`, collections.join(", "));

  const collectionsData = [];
  let totalIcons = 0;

  for (const collectionId of collections) {
    const collectionInfo = generateCollectionInfo(collectionId);
    if (collectionInfo) {
      collectionsData.push(collectionInfo);
      totalIcons += collectionInfo.jsonCount;
      console.log(`✅ ${collectionId}: ${collectionInfo.jsonCount} icons`);
    }
  }

  console.log(`📊 Total: ${totalIcons} icons across ${collectionsData.length} collections`);

  // Generate the TypeScript file
  const ManifestTemplate = `// THIS FILE IS AUTO-GENERATED FROM ICONS PACKAGE MANIFESTS
// Generated on: ${new Date().toISOString()}
// Total icons: ${totalIcons}

import { CollectionID, License } from "@/app/components/icons/types";

export const pkgVersion = "${PKG_VERSION}";

// Collection info with complete icon data from icons package
export interface CollectionInfo {
  id: CollectionID;
  name: string;
  jsonCount: number;
  totalIcons: number;
  projectUrl: string;
  license: License;
  licenseUrl: string;
  iconsManifest: Record<string, { id: string; name: string; compName: string; variant: string }>; // Complete manifest with kebab-case IDs as keys
}

// Load manifest from public folder at runtime (fallback)
export const loadPublicManifest = async (): Promise<{
  collections: CollectionInfo[];
  totalJSONs: number;
  generated: string;
}> => {
  try {
    const basePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "";
    const response = await fetch(\`\${basePath}/icons/manifest.json\`);
    if (!response.ok) {
      throw new Error("Failed to load public manifest");
    }
    return await response.json();
  } catch (error) {
    console.warn("Failed to load public manifest, using static collections:", error);

    return {
      collections: IconsManifest,
      totalJSONs: total,
      generated: new Date().toISOString()
    };
  }
};

// Static collections with complete icon lists from icons package
const staticCollections: CollectionInfo[] = ${JSON.stringify(collectionsData, null, 2)};

// For build-time usage (complete icon lists)
export const IconsManifest = staticCollections;

export const total = ${totalIcons};

export const collectionsCounts: Map<string, number> = staticCollections.reduce(
  (map, { id, jsonCount }) => {
    map.set(id, jsonCount);
    return map;
  },
  new Map()
);
`;

  await write(OUTPUT_FILE, ManifestTemplate);
  console.log(`✅ Generated manifest with complete icon lists: ${OUTPUT_FILE}`);
  console.log(
    `📈 Bundle impact: ~${Math.round((totalIcons * 20) / 1024)}KB of icon names (text data)`
  );
};

generator();
