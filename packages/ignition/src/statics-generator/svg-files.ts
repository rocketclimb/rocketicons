import { existsSync, readFileSync, copyFileSync, readdirSync, rmSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import sqlite3, { Statement } from "sqlite3";
import AdmZip from "adm-zip";

import { getContents } from "./utils";

const SOURCE_SVGS = "../generator/svgs";
const DEST_SVGS = "./src/app/data-helpers/svgs/";
const DEST_SQL_SVGS = resolve("./src/app/data-helpers/svgs/svg.db");

const hasChanges = () =>
  readFileSync(`${SOURCE_SVGS}/.lock`).toString() !==
  readFileSync(`${DEST_SVGS}/.lock`).toString();

const handleFilesS = (files: string[], collection: string, stmt: Statement) => {
  files
    .filter((filename) => filename.endsWith(".json"))
    .forEach((filename) => {
      const contents = getContents(join(SOURCE_SVGS, collection, filename), true);
      stmt.run([join(collection, filename), contents]);
    });
};

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
    mkdirSync(DEST_SVGS, { recursive: true });
    const db = new sqlite3.Database(DEST_SQL_SVGS, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

    db.serialize(() => {
      db.run("CREATE TABLE svgs (id STRING PRIMARY KEY, svg TEXT)");

      const stmt = db.prepare("INSERT INTO svgs VALUES (?, ?)");
      collections
        .filter((entry) => entry.isDirectory())
        .forEach(({ name }) => {
          const files = readdirSync(join(SOURCE_SVGS, name));
          handleFilesS(files, name, stmt);
        });
      stmt.finalize();
    });

    db.close();

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
