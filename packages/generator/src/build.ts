import path from "path";
import { performance } from "perf_hooks";
import { IconsInfoManifest } from "@rocketicons/core";
import { buildPackageExports } from "./logics";
import { icons } from "./definitions";
import * as taskCommon from "./task-common";
import * as taskAll from "./task-all";
import { TaskContext } from "./types";

// file path
const _rootDir = path.resolve(__dirname, "../");

async function task(name: string, fn: () => Promise<void> | void) {
  const start = performance.now();
  console.log(`================= ${name} =================`);
  await fn();
  const end = performance.now();
  console.log(`${name}: `, Math.floor(end - start) / 1000, "sec\n\n");
}

async function main() {
  try {
    // rocketicons/all
    const allOpt: TaskContext = {
      rootDir: _rootDir,
      DIST: path.resolve(_rootDir, "../icons"),
      LIB: path.resolve(_rootDir, "../icons/core"),
      DATA: path.resolve(_rootDir, "../icons/data"),
      PLUGIN: path.resolve(_rootDir, "../icons/tailwind"),
      SVGS: path.resolve(_rootDir, "./svgs")
    };
    await task("rocketicons initialize", async () => {
      await taskAll.dirInit(allOpt);
      await taskCommon.writeEntryPoints(allOpt);
      await taskCommon.writeLicense(allOpt);
      await taskCommon.writePackageJson(
        { name: "rocketicons", exports: buildPackageExports(icons) },
        allOpt
      );
      await taskCommon.copyReadme(allOpt);
    });

    const iconInfoManifest: IconsInfoManifest<string, string> = {};

    await task("rocketicons write icons", async () => {
      await Promise.all(
        icons.map((icon) => taskAll.writeIconModule(icon, allOpt, iconInfoManifest))
      );
    });

    await task("rocketicons write manifest", async () => {
      await taskCommon.writeIconsManifest(allOpt, iconInfoManifest);
    });

    await task("rocketicons write svgs", async () => {
      await Promise.all(icons.map((icon) => taskAll.writeSvgs(icon, allOpt, iconInfoManifest)));
    });

    console.log("done");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
main();

export {};
