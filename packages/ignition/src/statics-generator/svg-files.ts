import { cpSync, existsSync, readFileSync, rmSync } from "node:fs";

const SOURCE_SVGS = "../generator/svgs";
const DEST_SVGS = "./src/app/data-helpers/svgs/";

const hasChanges = () =>
  readFileSync(`${SOURCE_SVGS}/.lock`).toString() !==
  readFileSync(`${DEST_SVGS}/.lock`).toString();

const generator = () => {
  if (!existsSync(`${DEST_SVGS}/.lock`) || hasChanges()) {
    rmSync(DEST_SVGS, { recursive: true, force: true });
    cpSync(SOURCE_SVGS, "./src/app/data-helpers/svgs/", {
      recursive: true,
      force: true
    });
  }
};

generator();
