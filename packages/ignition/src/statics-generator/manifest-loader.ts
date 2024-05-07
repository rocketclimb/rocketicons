import { version } from "rocketicons/package.json";
import { templateBuilder, write, MANIFEST_LENGTH } from "./utils";
import { IconsManifest } from "rocketicons/data";
import { siteConfig } from "@/config/site";

const OUTPUT_FILE = "icons/manifest.ts";

const ManifestTemplate = `
// THIS FILE IS AUTO GENERATED
import { IconsManifest as Manifest } from "rocketicons/data";
import { siteConfig } from "@/config/site";

export const pkgVersion = "{0}";

const manifest = [...Manifest];
export const IconsManifest =
  siteConfig.env === "local" ? manifest.slice(0, {1}) : manifest;

export const total = IconsManifest.reduce((reduced, { icons }) => reduced + icons.length, 0);

export const collectionsCounts: Map<string, number> = IconsManifest.reduce(
  (reduced, { id, icons }) => {
    reduced.set(id, icons.length);
    return reduced;
  },
  new Map()
);
`;

const generator = async () => {
  await write(OUTPUT_FILE, templateBuilder(ManifestTemplate, version, `${MANIFEST_LENGTH}`));
};

generator();
