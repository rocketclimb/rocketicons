import * as changeCase from "change-case";
import { IconsManifestType } from "rocketicons";
import { CollectionID, License } from "rocketicons/data";
import { IconsManifest } from "@/app/data-helpers/icons/manifest";

type IconsManifest = Map<CollectionID, IconsManifestType<CollectionID, License>>;

let iconsManifest: IconsManifest;

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
    exists: (icon?: string) =>
      iconsManifest.has(id) && (!icon || iconsManifest.get(id)?.icons.includes(asCompName(icon))),
    get: () => iconsManifest.get(id)
  };
};
