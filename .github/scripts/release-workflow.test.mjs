import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = new URL("../../", import.meta.url);
const pkg = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));

function runBuild(skip, exitCode) {
  const directory = mkdtempSync(path.join(tmpdir(), "rocketicons-release-build-"));
  try {
    writeFileSync(
      path.join(directory, "npm"),
      `#!/bin/sh\necho workspace-build\nexit ${exitCode}\n`,
      {
        mode: 0o755
      }
    );
    const env = { ...process.env, PATH: `${directory}:${process.env.PATH}` };
    delete env.SKIP_BUILD_ALL;
    if (skip !== undefined) env.SKIP_BUILD_ALL = skip;
    return spawnSync("sh", ["-c", pkg.scripts["build-all"]], { env, encoding: "utf8" });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("workspace build failures reach CI instead of being reported as skipped", () => {
  const result = runBuild(undefined, 17);
  assert.equal(result.status, 17);
  assert.match(result.stdout, /workspace-build/);
  assert.doesNotMatch(result.stdout, /skip build-all/);
});

test("successful workspace builds succeed with an empty skip flag", () => {
  const result = runBuild("", 0);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /workspace-build/);
});

test("explicit install-time skip succeeds without executing workspace builds", () => {
  const result = runBuild("true", 17);
  assert.equal(result.status, 0);
  assert.doesNotMatch(result.stdout, /workspace-build/);
  assert.match(result.stdout, /skip build-all/);
});

test("release cuts generate and verify the complete catalog before tests and packaging", () => {
  const workflow = readFileSync(new URL(".github/workflows/prepare-release.yml", root), "utf8");
  const jobEnvironment = workflow.slice(
    workflow.indexOf("    env:"),
    workflow.indexOf("    steps:")
  );
  assert.match(jobEnvironment, /RI_GENERATE_ALL_ICONS: ["']true["']/);
  const build = workflow.indexOf("run: npm run build-all");
  const verify = workflow.indexOf("run: npm run test:catalog --workspace=packages/generator");
  const tests = workflow.indexOf("npm run test-all");
  const packageStep = workflow.indexOf("- name: Bump versions and prepare package");
  assert.ok(build >= 0 && verify > build && tests > verify && packageStep > tests);
});
