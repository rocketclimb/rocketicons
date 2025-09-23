import { join, resolve } from "node:path";
import { CollectionID, License } from "rocketicons/data";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

type CollectionAsJson = {
  id: CollectionID;
  name: string;
  license: License;
  projectUrl: string;
  licenseUrl: string;
  totalIcons: number;
};

const DATA_DIR = "./src/app/data-helpers/svgs/";
const DATA_DB = resolve(DATA_DIR, "svgs.db");

export const svgAsJson = async (collectionId: CollectionID, iconId: string) => {
  const filename = join(collectionId, `${iconId}.json`);
  const db = await open({ filename: DATA_DB, driver: sqlite3.cached.Database });
  const { svg } = (await db.get("SELECT svg FROM svgs WHERE id = ?", filename)) || {
    svg: "false"
  };
  return JSON.parse(svg);
};

export const svgInfoAsJson = async (collectionId: CollectionID, iconId: string) => {
  const filename = join(collectionId, `${iconId}.json`);
  const db = await open({ filename: DATA_DB, driver: sqlite3.cached.Database });
  const { id, name, compName, svg } = (await db.get(
    "SELECT id, name, compName, svg FROM svgs WHERE id = ?",
    filename
  )) || {
    svg: "false"
  };
  return { id, name, compName, data: JSON.parse(svg) };
};

export const svgInfoByCompNameAsJson = async (collectionId: CollectionID, compName: string) => {
  const db = await open({ filename: DATA_DB, driver: sqlite3.cached.Database });
  const { id, name, svg } = (await db.get(
    "SELECT id, name, compName, svg FROM svgs WHERE id like ? and compName = ?",
    `${collectionId}%`,
    compName
  )) || {
    svg: "false"
  };
  return { id, name, compName, data: JSON.parse(svg) };
};

export const svgsAsJson = async (id: string, limit: number = 10) => {
  const db = await open({ filename: DATA_DB, driver: sqlite3.cached.Database });
  const svgs = await db.all(
    "SELECT id, name, compName, svg FROM svgs WHERE id like ? LIMIT ?",
    `${id}%`,
    limit
  );
  return svgs.map(({ id, name, compName, svg }: any) => ({
    id,
    iconId: id.split("/").pop().replace(".json", ""),
    name,
    compName,
    data: JSON.parse(svg)
  }));
};

export const collectionsAsJson = async () => {
  const db = await open({ filename: DATA_DB, driver: sqlite3.cached.Database });
  const collections = await db.all(
    "SELECT id, name, license, projectUrl, licenseUrl, totalIcons FROM collections"
  );
  return collections.map(
    ({ id, name, license, projectUrl, licenseUrl, totalIcons }: CollectionAsJson) => ({
      id,
      name,
      license,
      projectUrl,
      licenseUrl,
      totalIcons
    })
  );
};

export const totalIcons = async () => {
  const db = await open({ filename: DATA_DB, driver: sqlite3.cached.Database });
  const { total } = await db.get("SELECT SUM(totalIcons) as total FROM collections");
  return total;
};

export const totalCollections = async () => {
  const db = await open({ filename: DATA_DB, driver: sqlite3.cached.Database });
  const { total } = await db.get("SELECT count(1) as total FROM collections");
  return total;
};

export const collectionAsJson = async (id: CollectionID) => {
  const db = await open({ filename: DATA_DB, driver: sqlite3.cached.Database });
  const collection = await db.get("SELECT * FROM collections WHERE id = ?", id);
  return collection as CollectionAsJson;
};
