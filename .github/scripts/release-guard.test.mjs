import assert from "node:assert/strict";
import test from "node:test";

import {
  packageReleaseState,
  selectPrepareReleaseRun,
  validateReleaseMetadata
} from "./release-guard.mjs";

test("skips npm publication when the package version is already published", () => {
  assert.deepEqual(packageReleaseState("0.3.2", "0.3.2"), { publishPackage: false });
});

test("accepts exactly one patch, minor, or major increment", () => {
  assert.deepEqual(packageReleaseState("0.3.3", "0.3.2"), { publishPackage: true });
  assert.deepEqual(packageReleaseState("0.4.0", "0.3.2"), { publishPackage: true });
  assert.deepEqual(packageReleaseState("1.0.0", "0.3.2"), { publishPackage: true });
});

test("rejects skipped, stale, and unstable package versions", () => {
  assert.throws(() => packageReleaseState("0.3.4", "0.3.2"), /one SemVer increment/);
  assert.throws(() => packageReleaseState("0.3.1", "0.3.2"), /one SemVer increment/);
  assert.throws(() => packageReleaseState("0.3.3-rc.1", "0.3.2"), /stable SemVer/);
});

test("selects the newest successful prepare run for the merged PR branch", () => {
  const payload = {
    workflow_runs: [
      {
        id: 30,
        status: "completed",
        conclusion: "success",
        created_at: "2026-08-24T12:03:00Z",
        head_branch: "feature/unrelated"
      },
      {
        id: 20,
        status: "completed",
        conclusion: "success",
        created_at: "2026-08-24T12:02:00Z",
        head_branch: "codex/fix-release-versioning"
      },
      {
        id: 10,
        status: "completed",
        conclusion: "success",
        created_at: "2026-08-24T12:01:00Z",
        head_branch: "codex/fix-release-versioning"
      }
    ]
  };

  assert.equal(selectPrepareReleaseRun(payload, "codex/fix-release-versioning"), 20);
});

test("refuses to fall back to an unrelated prepare run", () => {
  assert.throws(
    () =>
      selectPrepareReleaseRun(
        {
          workflow_runs: [
            {
              id: 30,
              status: "completed",
              conclusion: "success",
              created_at: "2026-08-24T12:03:00Z",
              head_branch: "feature/unrelated"
            }
          ]
        },
        "codex/fix-release-versioning"
      ),
    /No successful Prepare Release run found for branch/
  );
});

test("validates artifact identity against the merged PR and main versions", () => {
  const metadata = {
    tagName: "v0.9.4-release",
    sourcePullRequestNumber: 164,
    sourceHeadSha: "abc123",
    rootVersion: "0.9.4",
    name: "rocketicons",
    version: "0.3.3",
    publishPackage: true
  };

  assert.equal(
    validateReleaseMetadata(metadata, {
      tagName: "v0.9.4-release",
      sourcePullRequestNumber: 164,
      rootVersion: "0.9.4",
      name: "rocketicons",
      version: "0.3.3",
      publishPackage: true
    }),
    metadata
  );

  assert.throws(
    () =>
      validateReleaseMetadata(metadata, {
        tagName: "v0.9.4-release",
        sourcePullRequestNumber: 163,
        rootVersion: "0.9.4",
        name: "rocketicons",
        version: "0.3.3",
        publishPackage: true
      }),
    /sourcePullRequestNumber mismatch/
  );
});
