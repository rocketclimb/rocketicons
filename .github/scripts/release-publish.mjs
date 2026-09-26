#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const packageNames = [
  "@rocketicons/utils",
  "@rocketicons/tailwind",
  "@rocketicons/toolkit",
  "@rocketicons/mcp",
  "rocketicons"
];
const registry = "https://registry.npmjs.org";

export function readArchives(directory, metadata) {
  const files = readdirSync(directory).filter((name) => name.endsWith(".tgz"));
  if (files.length !== packageNames.length)
    throw new Error("Expected exactly five prepared package archives");
  const archives = files.map((file) => {
    const archive = path.resolve(directory, file);
    const readJson = (member) =>
      JSON.parse(
        execFileSync("tar", ["-xOf", archive, `package/${member}`], {
          encoding: "utf8",
          maxBuffer: 100 * 1024 * 1024
        })
      );
    const manifest = readJson("package.json");
    if (!packageNames.includes(manifest.name) || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      throw new Error(`Unexpected package ${manifest.name}@${manifest.version}`);
    }
    if (
      manifest.name === "rocketicons" &&
      (manifest.name !== metadata.name || manifest.version !== metadata.version)
    )
      throw new Error("rocketicons archive differs from release metadata");
    if (
      manifest.name === "@rocketicons/toolkit" &&
      readJson("data/search.json").packageVersion !== metadata.version
    )
      throw new Error("Bundled catalog differs from the rocketicons release");
    return {
      archive,
      manifest,
      integrity: `sha512-${createHash("sha512").update(readFileSync(archive)).digest("base64")}`
    };
  });
  return packageNames.map((name) => {
    const matches = archives.filter((entry) => entry.manifest.name === name);
    if (matches.length !== 1) throw new Error(`Expected exactly one archive for ${name}`);
    return matches[0];
  });
}

export function registryVersion(spec, run = spawnSync) {
  const result = run(
    "npm",
    ["view", spec, "--json", "--prefer-online", `--registry=${registry}`],
    {
      encoding: "utf8"
    }
  );
  if (result.error) throw result.error;
  if (result.status === 0) return JSON.parse(result.stdout);
  let error;
  try {
    error = JSON.parse(result.stdout).error;
  } catch {
    /* Non-JSON failures must stop publication. */
  }
  if (error?.code === "E404") return null;
  throw new Error(
    `Could not inspect ${spec} in npm (status ${result.status}); refusing to treat this as an unpublished version`
  );
}

export function publicationState(prepared, published) {
  if (!published) return "publish";
  if (
    published.name !== prepared.manifest.name ||
    published.version !== prepared.manifest.version ||
    !published.dist?.integrity?.split(/\s+/).includes(prepared.integrity)
  ) {
    throw new Error(
      `npm already contains different files for ${prepared.manifest.name}@${prepared.manifest.version}`
    );
  }
  return "skip";
}

export async function publishPrepared(
  archives,
  {
    lookup = registryVersion,
    publish,
    wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  } = {}
) {
  // Check every existing version before the first write, including packages
  // published manually while recovering a release.
  const plan = [];
  for (const entry of archives) {
    const state = publicationState(
      entry,
      await lookup(`${entry.manifest.name}@${entry.manifest.version}`)
    );
    plan.push({ ...entry, state });
  }
  for (const entry of plan) {
    const spec = `${entry.manifest.name}@${entry.manifest.version}`;
    console.log(`${entry.state}: ${spec}`);
    if (entry.state === "skip") continue;
    let publishError;
    try {
      await publish(entry.archive);
    } catch (error) {
      publishError = error;
    }
    // npm can accept an upload but take minutes to finish processing it.
    // Allow ten minutes of waiting after success; failed uploads retain the
    // short check for a racing manual publication. Accept only exact bytes.
    const attempts = publishError ? 3 : 21;
    const interval = publishError ? 2000 : 30_000;
    let confirmed = false;
    for (let attempt = 0; attempt < attempts; attempt++) {
      if (publicationState(entry, await lookup(spec)) === "skip") {
        confirmed = true;
        break;
      }
      if (attempt < attempts - 1) {
        if (!publishError)
          console.log(`Waiting for npm to process ${spec}; checking again in 30 seconds`);
        await wait(interval);
      }
    }
    if (!confirmed)
      throw (
        publishError ??
        new Error(
          `Publication of ${spec} was not confirmed by npm after ten minutes of waiting. ` +
            "npm accepted the upload; wait for processing to finish, then rerun the release."
        )
      );
  }
  return plan;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const directory = process.argv[2] ?? "prepared-release";
    const metadata = JSON.parse(
      readFileSync(path.join(directory, "release-metadata.json"), "utf8")
    );
    const archives = readArchives(directory, metadata);
    await publishPrepared(archives, {
      publish: (archive) =>
        execFileSync(
          "npm",
          [
            "publish",
            archive,
            "--access",
            "public",
            "--ignore-scripts",
            `--registry=${registry}`
          ],
          { stdio: "inherit" }
        )
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
