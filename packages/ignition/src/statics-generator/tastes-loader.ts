// TASTES LOADER - Using PublicJSONIcon components with real manifest data
import { write } from "./utils";
import { IconsManifest } from "@/app/data-helpers/icons/manifest-from-public";

const OUTPUT_FILE = "icons/tastes-loader.ts";

const TastesLoaderTemplate = `
// TASTES LOADER - Using PublicJSONIcon components with real manifest data
import { CollectionID } from "@/app/components/icons/types";
import { PublicJSONIcon } from "@/app/components/icons/public-json-icon";
import { IconsManifest } from "@/app/data-helpers/icons/manifest-from-public";
import React from "react";

// Create icon components for tastes using iconId
const createIconComponent = (collection: CollectionID, iconId: string) => {
  const IconComponent = (props: any) => React.createElement(PublicJSONIcon, { collection, iconId, ...props });
  IconComponent.displayName = \`\${collection}-\${iconId}\`;
  return IconComponent;
};

// Tastes loader that returns actual icon components using real manifest data
const TasteLoader = (id: CollectionID): any[] => {
  // Get the real collection data from the manifest
  const collectionInfo = IconsManifest.find(c => c.id === id);
  
  if (!collectionInfo || !collectionInfo.iconsManifest) {
    console.warn(\`No manifest found for collection: \${id}\`);
    // Fallback to a single default icon using kebab-case ID
    const defaultIconId = \`\${id}-home\`;
    return [createIconComponent(id, defaultIconId)];
  }

  // Get the first 8-10 icons from the real manifest for tastes
  const iconEntries = Object.values(collectionInfo.iconsManifest);
  const tasteIcons = iconEntries.slice(0, 8).map(iconData => iconData.id);
  
  // Return actual icon components using real kebab-case IDs
  return tasteIcons.map(iconId => createIconComponent(id, iconId));
};

export default TasteLoader;
`;

const generator = async () => {
  await write(OUTPUT_FILE, TastesLoaderTemplate);
  console.log("✅ Generated tastes loader using real manifest data instead of hardcoded samples");
};

generator();
