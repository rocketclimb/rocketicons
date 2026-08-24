import assert from "node:assert/strict";
import test from "node:test";

import {
  eligiblePrepareHeadShas,
  packageReleaseState,
  selectPrepareReleaseRun,
  validateReleaseSourceBranch,
  validateReleaseMetadata
} from "./release-guard.mjs";

test("only accepts develop as the release pull request source", () => {
  assert.equal(validateReleaseSourceBranch("develop"), "develop");
  assert.throws(
    () => validateReleaseSourceBranch("feature/direct-to-main"),
    /must come from develop/
  );
});

test("accepts the release commit parent as the prepare run revision", () => {
  const commits = [
    [
      {
        sha: "generated-release-commit",
        commit: {
          message: "ci(releaser): bump packages versions and update changelog for develop"
        },
        parents: [{ sha: "prepare-run-head" }]
      }
    ]
  ];

  assert.deepEqual(eligiblePrepareHeadShas(commits, "generated-release-commit", "develop"), [
    "generated-release-commit",
    "prepare-run-head"
  ]);
});

test("does not fall back from an ordinary pull request head revision", () => {
  const commits = [
    {
      sha: "ordinary-head",
      commit: { message: "fix(ci): adjust workflow" },
      parents: [{ sha: "stale-prepare-run" }]
    }
  ];

  assert.deepEqual(eligiblePrepareHeadShas(commits, "ordinary-head", "develop"), [
    "ordinary-head"
  ]);
});

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

test("selects the newest successful prepare run for the merged PR revision", () => {
  const payload = {
    workflow_runs: [
      {
        id: 30,
        status: "completed",
        conclusion: "success",
        created_at: "2026-08-24T12:03:00Z",
        head_branch: "develop",
        head_sha: "newer-unmerged-sha"
      },
      {
        id: 20,
        status: "completed",
        conclusion: "success",
        created_at: "2026-08-24T12:02:00Z",
        head_branch: "develop",
        head_sha: "release-head-sha"
      },
      {
        id: 10,
        status: "completed",
        conclusion: "success",
        created_at: "2026-08-24T12:01:00Z",
        head_branch: "develop",
        head_sha: "release-head-sha"
      }
    ]
  };

  assert.equal(
    selectPrepareReleaseRun(payload, {
      headBranch: "develop",
      pullRequestHeadShas: ["feature-commit-sha", "release-head-sha"],
      pullRequestNumber: 165
    }),
    20
  );
});

test("refuses to fall back to another pull request from develop", () => {
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
              head_branch: "develop",
              head_sha: "another-head-sha"
            }
          ]
        },
        {
          headBranch: "develop",
          pullRequestHeadShas: ["feature-commit-sha", "release-head-sha"],
          pullRequestNumber: 165
        }
      ),
    /No successful Prepare Release run found for PR #165/
  );
});

test("validates artifact identity against the merged PR and main versions", () => {
  const metadata = {
    tagName: "v0.9.4-release",
    sourcePullRequestNumber: 164,
    sourceHeadBranch: "develop",
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
      sourceHeadBranch: "develop",
      sourceHeadSha: "abc123",
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
        sourceHeadBranch: "develop",
        sourceHeadSha: "abc123",
        rootVersion: "0.9.4",
        name: "rocketicons",
        version: "0.3.3",
        publishPackage: true
      }),
    /sourcePullRequestNumber mismatch/
  );
});
