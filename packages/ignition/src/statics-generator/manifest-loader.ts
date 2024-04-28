import { version } from "rocketicons/package.json";
import { templateBuilder, write, MANIFEST_LENGTH } from "./utils";

const OUTPUT_FILE = "icons/manifest.ts";

const ManifestTemplate = `
// THIS FILE IS AUTO GENERATED
import { IconsManifest as Manifest } from "rocketicons/data";
import { siteConfig } from "@/config/site";

const manifest = [...Manifest];
export const IconsManifest =
  siteConfig.env === "local" ? manifest.slice(0, {0}) : manifest;

export const total = IconsManifest.reduce((reduced, { icons }) => reduced + icons.length, 0);

export const pkgVersion = "{1}";
`;

const generator = async () =>
  await write(OUTPUT_FILE, templateBuilder(ManifestTemplate, `${MANIFEST_LENGTH}`, version));

generator();
