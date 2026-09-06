import process from "process";
import util from "node:util";
import { execFile as rawExecFile } from "node:child_process";
import fs from "fs";
import path from "path";
import PQueue from "@esm2cjs/p-queue";

import { type IconSetGitSource, Context } from "./types";
import { icons } from "./definitions";
import { sourceCacheKey } from "./source-cache";

const CTRL_FILE_NAME = ".fetched";

const execFile = util.promisify(rawExecFile);
const force = process.argv.includes("--force");

const main = async () => {
  const distBaseDir = path.join(__dirname, "../icons");
  const ctrlFile = path.join(distBaseDir, CTRL_FILE_NAME);
  const cacheKey = sourceCacheKey(icons);
  const fetched =
    fs.existsSync(ctrlFile) &&
    fs.readFileSync(ctrlFile, "utf8") === cacheKey &&
    icons.every(
      ({ source }) =>
        !source || fs.existsSync(path.join(distBaseDir, source.localName, source.remoteDir))
    );

  if (fetched && !force) {
    console.log("all fetched, skipping");
    console.log("use `npm run refetch` to force it");
    process.exit(0);
  }

  const ctx: Context = {
    distBaseDir,
    iconDir(name: string) {
      return path.join(distBaseDir, name);
    }
  };

  // rm all icons and mkdir dist
  await fs.promises.rm(distBaseDir, {
    recursive: true,
    force: true
  });

  await fs.promises.mkdir(distBaseDir, {
    recursive: true
  });

  const queue = new PQueue({ concurrency: 10 });
  const tasks: Promise<unknown>[] = [];
  for (const icon of icons) {
    if (!icon.source) {
      continue;
    }
    const { source } = icon;
    tasks.push(queue.add(() => gitCloneIcon(source, ctx)));
  }

  await Promise.all(tasks);
  fs.writeFileSync(ctrlFile, cacheKey);
};

const gitCloneIcon = async (source: IconSetGitSource, ctx: Context) => {
  console.log(`start clone icon: ${source.url}/${source.remoteDir}@${source.branch}`);
  await execFile(
    "git",
    ["clone", "--filter=tree:0", "--no-checkout", source.url, source.localName],
    {
      cwd: ctx.distBaseDir
    }
  );

  await execFile("git", ["sparse-checkout", "set", "--cone", "--skip-checks", source.remoteDir], {
    cwd: ctx.iconDir(source.localName)
  });

  await execFile("git", ["checkout", source.hash], {
    cwd: ctx.iconDir(source.localName)
  });
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
