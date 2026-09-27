import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { alignWorkspaceDependencies, prepareWorkspaceVersions } from "./release-workspaces.mjs";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rocketicons-release-versions-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (name, value) => {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), JSON.stringify(value));
  };
  const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
  write("package.json", { workspaces: ["packages/toolkit", "packages/mcp", "packages/icons"] });
  write(".versions.json", { hash: "preserve", icons: "0.3.3" });
  const packages = {
    "packages/toolkit": { name: "@rocketicons/toolkit", version: "0.2.0" },
    "packages/mcp": {
      name: "@rocketicons/mcp",
      version: "0.2.0",
      dependencies: { "@rocketicons/toolkit": "0.1.0", "@rocketicons/utils": ">=0.7.0" }
    },
    "packages/icons": {
      name: "rocketicons",
      version: "0.4.0",
      dependencies: { "@rocketicons/toolkit": "0.1.0", "@rocketicons/mcp": "0.1.0" },
      devDependencies: { "@rocketicons/toolkit": "*" }
    }
  };
  for (const [directory, pkg] of Object.entries(packages))
    write(`${directory}/package.json`, pkg);
  write("package-lock.json", { lockfileVersion: 3, packages });
  return { root, read, write };
}

test("new workspaces get baselines automatically while release history is preserved", (t) => {
  const { root, read } = fixture(t);
  prepareWorkspaceVersions(root);
  assert.deepEqual(read(".versions.json"), {
    hash: "preserve",
    icons: "0.3.3",
    toolkit: "0.2.0",
    mcp: "0.2.0"
  });
  prepareWorkspaceVersions(root);
  assert.equal(read(".versions.json").icons, "0.3.3");
});

test("invalid existing baselines are rejected instead of overwritten", (t) => {
  const { root, write } = fixture(t);
  write(".versions.json", { toolkit: "invalid" });
  assert.throws(() => prepareWorkspaceVersions(root), /Invalid release baseline for toolkit/);
});

test("post-bump exact dependency pins and lockfile entries match the released versions", (t) => {
  const { root, read } = fixture(t);
  alignWorkspaceDependencies(root);
  const mcp = read("packages/mcp/package.json");
  const icons = read("packages/icons/package.json");
  assert.equal(mcp.dependencies["@rocketicons/toolkit"], "0.2.0");
  assert.equal(mcp.dependencies["@rocketicons/utils"], ">=0.7.0");
  assert.deepEqual(icons.dependencies, {
    "@rocketicons/toolkit": "0.2.0",
    "@rocketicons/mcp": "0.2.0"
  });
  assert.equal(icons.devDependencies["@rocketicons/toolkit"], "*");
  const lock = read("package-lock.json");
  assert.deepEqual(lock.packages["packages/mcp"].dependencies, mcp.dependencies);
  assert.deepEqual(lock.packages["packages/icons"].dependencies, icons.dependencies);
  alignWorkspaceDependencies(root);
  assert.deepEqual(read("package-lock.json"), lock);
});

test("release workflow initializes before bumping and stages aligned pins before committing", () => {
  const workflow = fs.readFileSync(
    new URL("../workflows/prepare-release.yml", import.meta.url),
    "utf8"
  );
  const prepare = workflow.indexOf("node .github/scripts/release-workspaces.mjs prepare");
  const bump = workflow.indexOf("npm run release");
  const align = workflow.indexOf("node .github/scripts/release-workspaces.mjs align");
  const stage = workflow.indexOf("git add -- package-lock.json packages/*/package.json");
  const commit = workflow.indexOf("git commit --amend");
  assert.ok(prepare >= 0 && bump > prepare && align > bump && stage > align && commit > stage);
});
