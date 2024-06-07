import { existsSync, readFileSync, copyFileSync, readdirSync, rmSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
import { getContents } from "./utils";

const SOURCE_SVGS = "../generator/svgs";
const DEST_SVGS = "./src/app/data-helpers/svgs/";
const DEST_SQL_SVGS = resolve("./src/app/data-helpers/svgs/svg.db");

const hasChanges = () =>
  readFileSync(`${SOURCE_SVGS}/.lock`).toString() !==
  readFileSync(`${DEST_SVGS}/.lock`).toString();

const handleFiles = async (files: string[], collection: string, db: Database) => {
  for (const filename of files.filter((filename) => filename.endsWith(".json"))) {
    const contents = getContents(join(SOURCE_SVGS, collection, filename), true);
    await db.run("INSERT INTO svgs VALUES (?, ?)", [join(collection, filename), contents]);
  }
};

const generator = async () => {
  if (!existsSync(`${DEST_SVGS}/.lock`) || hasChanges()) {
    rmSync(DEST_SVGS, { recursive: true, force: true });
    const collections = readdirSync(SOURCE_SVGS, { withFileTypes: true });
    mkdirSync(DEST_SVGS, { recursive: true });
    const db = await open({ filename: DEST_SQL_SVGS, driver: sqlite3.cached.Database });
    await db.exec("CREATE TABLE svgs (id STRING PRIMARY KEY, svg TEXT)");
    for (const { name } of collections.filter((entry) => entry.isDirectory())) {
      const files = readdirSync(join(SOURCE_SVGS, name));
      await handleFiles(files, name, db);
    }

    await db.close();
    copyFileSync(`${SOURCE_SVGS}/.lock`, `${DEST_SVGS}/.lock`);
  }
};

generator();
