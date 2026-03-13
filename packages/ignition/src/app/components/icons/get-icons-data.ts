import * as changeCase from "change-case";
import { CollectionID } from "@/app/components/icons/types";
import { IconsManifest, CollectionInfo } from "@/app/data-helpers/icons/manifest-from-public";

type IconsManifestMap = Map<CollectionID, CollectionInfo>;

let iconsManifest: IconsManifestMap;

export const asCompName = (icon: string) =>
  !icon.includes("-") ? icon : changeCase.pascalCase(icon, { mergeAmbiguousCharacters: true });

export const getIconsManifest = () => IconsManifest;

export const getCollectionsInfo = (id: CollectionID) => {
  if (!iconsManifest) {
    iconsManifest = IconsManifest.reduce(
      (map, manifest) => map.set(manifest.id, manifest),
      new Map()
    );
  }

  return {
    exists: (icon?: string) => {
      if (!iconsManifest.has(id)) return false;
      if (!icon) return true;

      const collection = iconsManifest.get(id);
      if (!collection?.iconsManifest) return false;

      // Check if the component name exists in the iconsManifest
      const componentName = asCompName(icon);
      return Object.values(collection.iconsManifest).some(
        (iconData) => iconData.compName === componentName
      );
    },
    get: () => iconsManifest.get(id)
  };
};
