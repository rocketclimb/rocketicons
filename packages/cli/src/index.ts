#!/usr/bin/env node
import {
  addIcons,
  allIcons,
  doctor,
  getCollection,
  iconSummary,
  iconUsage,
  initProject,
  inspectProject,
  listCollections,
  removeIcons,
  requireIcon,
  searchIcons
} from "@rocketicons/toolkit";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const args = process.argv.slice(2);
const command = args.shift();
const flags = new Map<string, string | boolean>();
const positional: string[] = [];
for (let index = 0; index < args.length; index++) {
  const value = args[index];
  if (!value.startsWith("--")) {
    positional.push(value);
    continue;
  }
  const name = value.slice(2);
  if (["json", "dry-run", "yes"].includes(name)) flags.set(name, true);
  else flags.set(name, args[++index] ?? "");
}
const cwd = String(flags.get("cwd") || process.cwd());
const print = (value: unknown) =>
  console.log(JSON.stringify(value, null, flags.get("json") ? 0 : 2));
const main = async () => {
  switch (command) {
    case "mcp": {
      const resolveFromCli = createRequire(process.argv[1]);
      const packageJson = resolveFromCli.resolve("@rocketicons/mcp/package.json");
      const child = spawn(process.execPath, [join(dirname(packageJson), "dist/index.js")], {
        stdio: "inherit"
      });
      await new Promise<void>((resolve, reject) => {
        child.once("error", reject);
        child.once("exit", (code, signal) => {
          if (signal) process.kill(process.pid, signal);
          else if (code) process.exitCode = code;
          resolve();
        });
      });
      break;
    }
    case "search":
      print(
        await searchIcons({
          query: positional.join(" "),
          collections: flags.get("collection")
            ? String(flags.get("collection")).split(",")
            : undefined,
          variants: flags.get("variant") ? String(flags.get("variant")).split(",") : undefined,
          limit: flags.get("limit") ? Number(flags.get("limit")) : undefined
        })
      );
      break;
    case "list":
      if (positional[0]) {
        const id = positional[0].replace(/^@/, "");
        const collection = getCollection(id);
        if (!collection) throw new Error(`Unknown collection: ${id}`);
        print({
          collection,
          icons: allIcons()
            .filter((icon) => icon.collection === id)
            .map(({ id, name, component, variant }) => ({ id, name, component, variant }))
        });
      } else print(listCollections());
      break;
    case "info":
      print(iconSummary(requireIcon(positional[0])));
      break;
    case "usage":
      print(
        iconUsage(
          positional[0],
          flags.get("target") === "react-native" ? "react-native" : "react",
          flags.get("language") === "js" ? "js" : "ts"
        )
      );
      break;
    case "init":
      print(
        await initProject(cwd, {
          dryRun: Boolean(flags.get("dry-run")),
          target:
            flags.get("target") === "react-native"
              ? "react-native"
              : flags.get("target") === "react"
                ? "react"
                : undefined,
          language:
            flags.get("language") === "js"
              ? "js"
              : flags.get("language") === "ts"
                ? "ts"
                : undefined,
          packageManager: flags.get("package-manager")
            ? String(flags.get("package-manager"))
            : undefined,
          stylesheetPath: flags.get("stylesheet-path")
            ? String(flags.get("stylesheet-path"))
            : undefined
        })
      );
      break;
    case "add":
      print(await addIcons(cwd, positional, Boolean(flags.get("dry-run"))));
      break;
    case "remove":
      print(await removeIcons(cwd, positional, Boolean(flags.get("dry-run"))));
      break;
    case "doctor":
      print(doctor(cwd));
      break;
    case "config":
      print(inspectProject(cwd));
      break;
    default:
      console.log(
        "Search thousands of open-source icons, then add only the icons your project uses. Rocketicons writes selected components into your source tree for React and React Native, with Tailwind-compatible styling. No full icon collection is imported into the application, and unused icons do not rely on tree-shaking to disappear.\n\nCommands: mcp, search, list, info, usage, init, add, remove, doctor, config. Use --json, --dry-run, --cwd <absolute path>, --collection <id>, --variant <name>, --stylesheet-path <css path>."
      );
  }
};
main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
