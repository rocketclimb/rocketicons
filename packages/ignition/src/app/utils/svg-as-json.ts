import AdmZip from "adm-zip";
import { join, resolve } from "node:path";
import { CollectionID } from "rocketicons/data";
import sqlite3 from "sqlite3";

const DATA_DIR = "./src/app/data-helpers/svgs/";
const DATA_FILE = join(DATA_DIR, "jsons.zip");
const DB_FILE = resolve(DATA_DIR, "svg.db");

export const svgAsJson = (collectionId: CollectionID, iconId: string) => {
  const filename = join(collectionId, `${iconId}.json`);
  const db = new sqlite3.Database(DB_FILE, sqlite3.OPEN_READWRITE);
  db.serialize(() => {
    db.each(`SELECT svg FROM svgs WHERE id = "${filename}"`, (err, row) => console.log(row));
  });
  db.close();

  const zip = new AdmZip(resolve(DATA_FILE));

  return JSON.parse(zip.readAsText(filename));
};
