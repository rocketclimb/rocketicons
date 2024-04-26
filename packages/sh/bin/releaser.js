import { EOL } from "node:os";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { sync as parser } from "conventional-commits-parser";
import { EXIT_CODES } from "./config.js";
import { changelog, ROOT_PKG_NAME, ICONS_SCOPE_NAME } from "./changelog.js";
import { bumpVersion } from "./utils.js";

const bumper = (toVersion, addParams) => {
  const [, version] = execSync(`npm version ${toVersion} ${addParams ?? ""}`)
    .toString()
    .trim()
    .split("\n");
  return version.trim();
};

export const releaser = (args) => {
  const versions = JSON.parse(fs.readFileSync("./.latest-versions.json").toString());

  const latestTag = execSync("git fetch --prune-tags -q && git describe --abbrev=0")
    .toString()
    .trim();
  const {
    stdout: { newTag, releaseNote, packagesBumpType, repoBumpType },
    code
  } = changelog([latestTag, ...args]);

  const newVersion = {};

  Object.entries(packagesBumpType)
    .filter(([pkgName]) => ![ROOT_PKG_NAME, ICONS_SCOPE_NAME].includes(pkgName))
    .forEach(([pkgName, type]) => {
      newVersion[pkgName] = bumper(type, `-w packages/${pkgName}`);
    });

  if (packagesBumpType?.icons) {
    try {
      const tag = process.env.PRE_RELEASE_TAG ? `-${process.env.PRE_RELEASE_TAG.trim()}` : "";
      const { icons } = versions;
      const updateTo = bumpVersion(icons.replace(tag, ""), packagesBumpType.icons);
      bumper(`${updateTo}${tag}, '-w packages/icons`);
      newVersion[ICONS_SCOPE_NAME] = updateTo;
    } catch (e) {
      // dont worry!!
    }
  }

  try {
    execSync('git add . && git commit -m "ci(changelog): update"');
  } catch (e) {
    // be happy
  }

  //newVersion[ROOT_PKG_NAME] = bumper(packagesBumpType[ROOT_PKG_NAME]);

  console.log(packagesBumpType, packagesBumpType[ROOT_PKG_NAME], newVersion);
  return code;
};

// Release notes?
// tags values
// icons??

// Qualquer coisa - icons
//

// Release notes?
// tags values
// icons??
