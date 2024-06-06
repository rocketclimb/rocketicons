import AdmZip from "adm-zip";
import { join, resolve } from "node:path";
import { CollectionID } from "rocketicons/data";

const DATA_DIR = "./src/app/data-helpers/svgs/";
const DATA_FILE = join(DATA_DIR, "jsons.zip");

export const svgAsJson = (collectionId: CollectionID, iconId: string) => {
  const zip = new AdmZip(resolve(DATA_FILE));
  const filename = join(collectionId, `${iconId}.json`);
  return JSON.parse(zip.readAsText(filename));
};
