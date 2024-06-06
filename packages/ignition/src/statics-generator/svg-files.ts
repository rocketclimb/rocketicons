import { existsSync, readFileSync, copyFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import AdmZip from "adm-zip";

import { getContents } from "./utils";

const SOURCE_SVGS = "../generator/svgs";
const DEST_SVGS = "./src/app/data-helpers/svgs/";

const hasChanges = () =>
  readFileSync(`${SOURCE_SVGS}/.lock`).toString() !==
  readFileSync(`${DEST_SVGS}/.lock`).toString();

const handleFiles = (files: string[], collection: string, zip: AdmZip) => {
  files
    .filter((filename) => filename.endsWith(".json"))
    .forEach((filename) => {
      const contents = getContents(join(SOURCE_SVGS, collection, filename), true);
      zip.addFile(join(collection, filename), Buffer.from(contents));
    });
};

const generator = async () => {
  if (!existsSync(`${DEST_SVGS}/.lock`) || hasChanges()) {
    rmSync(DEST_SVGS, { recursive: true, force: true });
    const zip = new AdmZip();
    const collections = readdirSync(SOURCE_SVGS, { withFileTypes: true });
    collections
      .filter((entry) => entry.isDirectory())
      .forEach(({ name }) => {
        const files = readdirSync(join(SOURCE_SVGS, name));
        handleFiles(files, name, zip);
      });
    zip.writeZip("./src/app/data-helpers/svgs/jsons.zip");
    copyFileSync(`${SOURCE_SVGS}/.lock`, `${DEST_SVGS}/.lock`);
  }
};

generator();
