import { EOL } from "node:os";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { sync as parser } from "conventional-commits-parser";
import { EXIT_CODES } from "./config.js";
import { versionBumper } from "./utils.js";

const REPO_LINK = "https://github.com/rocketclimb/rocketicons";

export const PACKAGES_DIR = "packages";
const CHANGELOG_FILE = "CHANGELOG.md";

const COMMIT_MARKER = "##";
const FIELD_MARKER = "|||";

export const ROOT_PKG_NAME = "rocketclimb-icons";
export const ICONS_SCOPE_NAME = "icons";

const SCOPES_TO_IGNORE = ["changelog"];

const commitPattern = new RegExp(`^${COMMIT_MARKER}`);

const typesOrder = new Set([
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "test",
  "chore",
  "other"
]);

const typeLabels = {
  feat: "Features",
  fix: "Bug Fixes",
  docs: "Documentation",
  style: "Formatting",
  refactor: "Refactoring",
  test: "Test",
  chore: "Miscellaneous",
  other: "Other"
};

const extractPackageNameFromChangedFile = (changedFile) => {
  const [, pkgName] = changedFile.split("/");
  return pkgName;
};

const getPackageName = (changedFile) =>
  changedFile.startsWith(PACKAGES_DIR)
    ? extractPackageNameFromChangedFile(changedFile)
    : ROOT_PKG_NAME;

const prepareScope = (scope) => (scope && `**${scope}** `) || "";

const prepareSubject = (subject, references) => {
  if (references.length) {
    return references.reduce(
      (reduced, { issue, raw }) => reduced.replace(raw, `[${raw}](${REPO_LINK}/issues/${issue})`),
      subject
    );
  }

  return subject;
};

const prepareAffects = (pkgName, affects) => {
  if (pkgName !== ROOT_PKG_NAME || affects.length === 1) {
    return "";
  }

  const affected = affects.map((pkg) => `[${pkg}](./packages/${pkg}/CHANGELOG.md)`);

  return ` [${affected.join(", ")}]`;
};

const getChangeLogFileName = (pkgName) =>
  pkgName === ROOT_PKG_NAME ? CHANGELOG_FILE : path.join(PACKAGES_DIR, pkgName, CHANGELOG_FILE);

const getPreviousChangelog = (infile) => fs.readFileSync(infile).toString();

const writeChangelog = (changelog, infile) => {
  let header = "";

  let previousChangelog = "";
  try {
    previousChangelog = getPreviousChangelog(infile);
    previousChangelog = previousChangelog.replace(header, "");
  } catch (err) {
    // file does not exist, nothing to do here
  }

  fs.writeFileSync(
    infile,
    header +
      (changelog ? changelog.trim() : "") +
      (previousChangelog ? EOL + EOL + previousChangelog.trim() : "") +
      EOL
  );
};

export const changelog = (args) => {
  const [providedTag] = args;
  const previousTag =
    providedTag ??
    execSync("git fetch --prune-tags -q && git describe --abbrev=0").toString().trim();
  const newCommits = execSync(
    `git --no-pager log  --name-only --pretty=format:"${COMMIT_MARKER}%h${FIELD_MARKER}%s${FIELD_MARKER}%H" ${previousTag}..HEAD`
  );

  const addCommitInfo = (parsed, pkgName, type, commit) => {
    parsed[pkgName] = parsed[pkgName] || {};
    parsed[pkgName][type] = parsed[pkgName][type] || [];
    parsed[pkgName][type].indexOf(commit) === -1 && parsed[pkgName][type].push(commit);
  };

  const getBumpType = (checking, current) => {
    if (!current) {
      return checking === "feat" ? "minor" : "patch";
    }

    if (checking === "feat" && current === "patch") {
      return "minor";
    }

    return current;
  };

  const { parsed, repoBumpType, packagesBumpType } = newCommits
    .toString()
    .split("\n")
    .filter((line) => !!line)
    .reduce(
      ({ parsed, current, repoBumpType, packagesBumpType }, commit) => {
        const isNewCommit = commitPattern.exec(commit);
        if (isNewCommit) {
          const [short, message, hash] = commit.replace(commitPattern, "").split(FIELD_MARKER);
          current = { ...parser(message), short, hash, affects: [] };
          typesOrder.add(current.type);
        } else {
          const pkgName = getPackageName(commit);
          current.affects.push(pkgName);
          const { type, scope } = current;
          addCommitInfo(parsed, pkgName, type, current);
          addCommitInfo(parsed, ROOT_PKG_NAME, type, current);
          packagesBumpType[pkgName] = getBumpType(current.type, packagesBumpType[pkgName]);
          if (scope === ICONS_SCOPE_NAME) {
            addCommitInfo(parsed, ICONS_SCOPE_NAME, type, current);
            packagesBumpType[ICONS_SCOPE_NAME] = getBumpType(
              current.type,
              packagesBumpType[ICONS_SCOPE_NAME]
            );
          }
        }

        repoBumpType = getBumpType(current.type, repoBumpType);
        return { parsed, current, repoBumpType, packagesBumpType };
      },
      { parsed: {}, current: {}, repoBumpType: "", packagesBumpType: {} }
    );

  let releaseNote;

  const [major, minor, patch] = previousTag.replace(/^v/, "").split(".");

  const newTag = versionBumper({ major, minor, patch }, repoBumpType);

  Object.entries(parsed).forEach(([key, changes]) => {
    let content = `## [${newTag}](https://github.com/rocketclimb/rocketicons/compare/${previousTag}...${newTag}) (${new Date().toISOString().split("T").shift()})${EOL}`;
    [...typesOrder].forEach((type) => {
      const iWantThis =
        changes[type]?.filter(({ scope }) => !SCOPES_TO_IGNORE.includes(scope)) || [];

      content += (iWantThis.length && `${EOL}### ${typeLabels[type]}${EOL}${EOL}`) || "";

      iWantThis.forEach(({ scope, subject, short, hash, references, affects }) => {
        content += `- ${prepareScope(scope)}${prepareSubject(subject, references)}${prepareAffects(key, affects)} ([${short}](${REPO_LINK}/commit/${hash}))${EOL}`;
      });
    });
    if (key === ROOT_PKG_NAME) {
      releaseNote = content.trim();
    }
    writeChangelog(content.trim(), getChangeLogFileName(key));
  });

  return {
    stdout: {
      previousTag,
      newTag,
      releaseNote,
      repoBumpType,
      packagesBumpType
    },
    code: EXIT_CODES.SUCCESS
  };
};
