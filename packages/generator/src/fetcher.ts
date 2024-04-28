import process from "process";
import util from "node:util";
import { execFile as rawExecFile } from "node:child_process";
import fs from "fs";
import path from "path";
import PQueue from "@esm2cjs/p-queue";

import { type IconSetGitSource, Context } from "./types";
import { icons } from "./definitions";

const CTRL_FILE_NAME = ".fetched";

const execFile = util.promisify(rawExecFile);
const force = process.argv.pop() === "--force";

const main = async () => {
  const distBaseDir = path.join(__dirname, "../icons");
  const ctrlFile = path.join(distBaseDir, CTRL_FILE_NAME);
  const fetched = fs.existsSync(ctrlFile);

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
  for (const icon of icons) {
    if (!icon.source) {
      continue;
    }
    const { source } = icon;
    queue.add(() => gitCloneIcon(source, ctx));
  }

  await queue.onIdle();
  fs.writeFileSync(ctrlFile, "done");
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
