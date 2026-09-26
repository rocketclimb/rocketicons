import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const read = (filename) => JSON.parse(fs.readFileSync(filename, "utf8"));
const write = (filename, value) =>
  fs.writeFileSync(filename, JSON.stringify(value, null, 2) + "\n");
const stableVersion = /^\d+\.\d+\.\d+$/;

export function prepareWorkspaceVersions(root) {
  const manifest = read(path.join(root, "package.json"));
  const filename = path.join(root, ".versions.json");
  const versions = read(filename);
  for (const workspace of manifest.workspaces) {
    const pkg = read(path.join(root, workspace, "package.json"));
    const key = path.basename(workspace);
    if (versions[key] === undefined) versions[key] = pkg.version;
    if (!stableVersion.test(versions[key]))
      throw new Error(`Invalid release baseline for ${key}`);
  }
  write(filename, versions);
}

// The legacy releaser bumps workspace versions but leaves exact dependency pins
// behind. Update local pins and their lockfile entries before saving the cut.
export function alignWorkspaceDependencies(root) {
  const manifest = read(path.join(root, "package.json"));
  const lockPath = path.join(root, "package-lock.json");
  const lock = read(lockPath);
  const workspaces = manifest.workspaces.map((directory) => ({
    directory,
    pkg: read(path.join(root, directory, "package.json"))
  }));
  const versions = new Map(workspaces.map(({ pkg }) => [pkg.name, pkg.version]));
  for (const { directory, pkg } of workspaces) {
    let changed = false;
    for (const field of ["dependencies", "devDependencies", "optionalDependencies"]) {
      for (const [name, value] of Object.entries(pkg[field] ?? {})) {
        if (versions.has(name) && stableVersion.test(value) && value !== versions.get(name)) {
          pkg[field][name] = versions.get(name);
          if (!lock.packages[directory]?.[field]?.[name]) {
            throw new Error(`Missing lockfile dependency ${directory}: ${name}`);
          }
          lock.packages[directory][field][name] = versions.get(name);
          changed = true;
        }
      }
    }
    if (changed) write(path.join(root, directory, "package.json"), pkg);
  }
  write(lockPath, lock);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const action = process.argv[2];
  if (action === "prepare") prepareWorkspaceVersions(process.cwd());
  else if (action === "align") alignWorkspaceDependencies(process.cwd());
  else throw new Error("Expected prepare or align");
}
