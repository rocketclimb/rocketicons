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
const repositoryUrl = "git+https://github.com/rocketclimb/rocketicons.git";

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
  const result = run("npm", ["view", spec, "--json", `--registry=${registry}`], {
    encoding: "utf8"
  });
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

export function publicationAuth(manifest, env) {
  if (manifest.repository?.url === repositoryUrl) return { env, args: [] };
  if (manifest.repository) throw new Error(`Unexpected repository metadata in ${manifest.name}`);
  // Old, already-reviewed cuts omitted repository metadata. Keep those exact
  // archives recoverable using an explicitly configured publishing token.
  // Future cuts include the metadata and continue using trusted publishing.
  if (!env.NODE_AUTH_TOKEN) return { env, args: [] };
  const tokenEnv = { ...env };
  delete tokenEnv.ACTIONS_ID_TOKEN_REQUEST_URL;
  delete tokenEnv.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  return { env: tokenEnv, args: ["--provenance=false"] };
}

export function publishPrepared(
  archives,
  { lookup = registryVersion, publish, env = process.env } = {}
) {
  // Check the entire batch before the first registry write. This also makes a
  // partial retry verify all existing versions, including utils and tailwind.
  const plan = archives.map((entry) => {
    const state = publicationState(
      entry,
      lookup(`${entry.manifest.name}@${entry.manifest.version}`)
    );
    return {
      ...entry,
      state,
      auth: state === "publish" ? publicationAuth(entry.manifest, env) : null
    };
  });
  for (const entry of plan) {
    console.log(`${entry.state}: ${entry.manifest.name}@${entry.manifest.version}`);
    if (entry.state === "skip") continue;
    publish(entry.archive, entry.auth);
    if (
      publicationState(entry, lookup(`${entry.manifest.name}@${entry.manifest.version}`)) !==
      "skip"
    ) {
      throw new Error(`Publication of ${entry.manifest.name} was not confirmed by npm`);
    }
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
    publishPrepared(archives, {
      publish: (archive, auth) =>
        execFileSync(
          "npm",
          [
            "publish",
            archive,
            "--access",
            "public",
            "--ignore-scripts",
            `--registry=${registry}`,
            ...auth.args
          ],
          { stdio: "inherit", env: auth.env }
        )
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
