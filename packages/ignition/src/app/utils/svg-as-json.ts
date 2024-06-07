import { join, resolve } from "node:path";
import { CollectionID } from "rocketicons/data";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const DATA_DIR = "./src/app/data-helpers/svgs/";
const DATA_DB = resolve(DATA_DIR, "svg.db");

export const svgAsJson = async (collectionId: CollectionID, iconId: string) => {
  const filename = join(collectionId, `${iconId}.json`);
  const db = await open({ filename: DATA_DB, driver: sqlite3.cached.Database });
  const { svg } = await db.get("SELECT svg FROM svgs WHERE id = ?", filename);
  return JSON.parse(svg);
};
