import fs from "node:fs";
import path from "node:path";
import { IconsManifest } from "rocketicons/data";
import { siteConfig } from "@/config/site";

const DATA_DIR = "./src/app/data-helpers/";

export const MANIFEST_LENGTH = 5;

export const templateBuilder = (template: string, ...params: string[]) =>
  params.reduce(
    (parsed, param, i) => parsed.replace(RegExp(`\\{${i}\\}`, "g"), param),
    template
  );

export const write = async (
  filename: string,
  content: string
): Promise<void> => {
  filename = `${DATA_DIR}${filename}`;
  await fs.mkdirSync(path.dirname(filename), { recursive: true });
  await fs.writeFileSync(filename, content);
};

export const getManifest = () => {
  const manifest = [...IconsManifest];
  return siteConfig.isLocal ? manifest.slice(0, MANIFEST_LENGTH) : manifest;
};
