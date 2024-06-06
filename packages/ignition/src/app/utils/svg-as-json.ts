import AdmZip from "adm-zip";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { CollectionID } from "rocketicons/data";

const DATA_DIR = "./src/app/data-helpers/svgs/";
const DATA_FILE = join(DATA_DIR, "jsons.zip");

const getContents = (filename: string, skipUnzip?: boolean): string => {
  try {
    return readFileSync(join(DATA_DIR, filename), { encoding: "utf8", flag: "r" });
  } catch (e) {
    if (skipUnzip) {
      throw e;
    } else {
      const zip = new AdmZip(resolve(DATA_FILE));
      zip.extractAllTo(resolve(DATA_DIR), true);
      return getContents(filename, true);
    }
  }
};

export const svgAsJson = (collectionId: CollectionID, iconId: string) => {
  const filename = join(collectionId, `${iconId}.json`);
  return JSON.parse(getContents(filename));
};
