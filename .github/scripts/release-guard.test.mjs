import assert from "node:assert/strict";
import test from "node:test";

import {
  eligibleCutHeadShas,
  packageReleaseState,
  releaseBranchForVersion,
  releaseVersionFromBranch,
  selectCutReleaseRun,
  validateCutReleaseResult,
  validateCutReleaseSource,
  validateReleaseMetadata
} from "./release-guard.mjs";

test("only cuts releases from develop", () => {
  assert.equal(validateCutReleaseSource("develop"), "develop");
  assert.throws(() => validateCutReleaseSource("main"), /must be cut from develop/);
});

test("builds and parses stable release branch names", () => {
  assert.equal(releaseBranchForVersion("0.9.4"), "release/0.9.4");
  assert.equal(releaseVersionFromBranch("release/0.9.4"), "0.9.4");
  assert.throws(() => releaseBranchForVersion("0.9.4-rc.1"), /stable SemVer/);
  assert.throws(() => releaseVersionFromBranch("feature/0.9.4"), /release\/<version>/);
});

test("requires the generated root version and tag to match the requested release", () => {
  assert.deepEqual(validateCutReleaseResult("0.9.4", "0.9.4", "v0.9.4-release"), {
    releaseBranch: "release/0.9.4",
    tagName: "v0.9.4-release"
  });
  assert.throws(
    () => validateCutReleaseResult("0.9.4", "0.9.5", "v0.9.5-release"),
    /root version mismatch/
  );
  assert.throws(() => validateCutReleaseResult("0.9.4", "0.9.4", "v0.9.4"), /tag mismatch/);
});

test("skips npm publication when the package version is already published", () => {
  assert.deepEqual(packageReleaseState("0.3.2", "0.3.2"), { publishPackage: false });
});

test("accepts exactly one patch, minor, or major package increment", () => {
  assert.deepEqual(packageReleaseState("0.3.3", "0.3.2"), { publishPackage: true });
  assert.deepEqual(packageReleaseState("0.4.0", "0.3.2"), { publishPackage: true });
  assert.deepEqual(packageReleaseState("1.0.0", "0.3.2"), { publishPackage: true });
});

test("rejects skipped, stale, and unstable package versions", () => {
  assert.throws(() => packageReleaseState("0.3.4", "0.3.2"), /one SemVer increment/);
  assert.throws(() => packageReleaseState("0.3.1", "0.3.2"), /one SemVer increment/);
  assert.throws(() => packageReleaseState("0.3.3-rc.1", "0.3.2"), /stable SemVer/);
});

test("accepts the generated release commit parent as the manual cut revision", () => {
  const commits = [
    [
      {
        sha: "generated-release-commit",
        commit: {
          message: "ci(releaser): bump packages versions and update changelog for release/0.9.4"
        },
        parents: [{ sha: "manual-cut-head" }]
      }
    ]
  ];

  assert.deepEqual(eligibleCutHeadShas(commits, "generated-release-commit", "release/0.9.4"), [
    "generated-release-commit",
    "manual-cut-head"
  ]);
});

test("does not fall back from an ordinary release branch head revision", () => {
  const commits = [
    {
      sha: "ordinary-head",
      commit: { message: "fix(ci): edit release branch" },
      parents: [{ sha: "stale-cut-run" }]
    }
  ];

  assert.deepEqual(eligibleCutHeadShas(commits, "ordinary-head", "release/0.9.4"), [
    "ordinary-head"
  ]);
});

test("selects the newest successful manual cut run for the release revision", () => {
  const payload = {
    workflow_runs: [
      {
        id: 40,
        event: "pull_request",
        status: "completed",
        conclusion: "success",
        created_at: "2026-08-24T12:04:00Z",
        head_branch: "develop",
        head_sha: "manual-cut-head"
      },
      {
        id: 30,
        event: "workflow_dispatch",
        status: "completed",
        conclusion: "success",
        created_at: "2026-08-24T12:03:00Z",
        head_branch: "develop",
        head_sha: "another-cut-head"
      },
      {
        id: 20,
        event: "workflow_dispatch",
        status: "completed",
        conclusion: "success",
        created_at: "2026-08-24T12:02:00Z",
        head_branch: "develop",
        head_sha: "manual-cut-head"
      },
      {
        id: 10,
        event: "workflow_dispatch",
        status: "completed",
        conclusion: "success",
        created_at: "2026-08-24T12:01:00Z",
        head_branch: "develop",
        head_sha: "manual-cut-head"
      }
    ]
  };

  assert.equal(
    selectCutReleaseRun(payload, {
      runHeadBranch: "develop",
      eligibleHeadShas: ["generated-release-commit", "manual-cut-head"],
      pullRequestNumber: 165
    }),
    20
  );
});

test("refuses to use a manual cut run from another develop revision", () => {
  assert.throws(
    () =>
      selectCutReleaseRun(
        {
          workflow_runs: [
            {
              id: 30,
              event: "workflow_dispatch",
              status: "completed",
              conclusion: "success",
              created_at: "2026-08-24T12:03:00Z",
              head_branch: "develop",
              head_sha: "another-cut-head"
            }
          ]
        },
        {
          runHeadBranch: "develop",
          eligibleHeadShas: ["generated-release-commit", "manual-cut-head"],
          pullRequestNumber: 165
        }
      ),
    /No successful Cut Release run found for PR #165/
  );
});

test("validates artifact identity against the cut run and merged release branch", () => {
  const metadata = {
    tagName: "v0.9.4-release",
    releaseVersion: "0.9.4",
    sourceWorkflowRunId: 123456,
    releaseBranch: "release/0.9.4",
    releaseHeadSha: "release-head",
    cutFromSha: "develop-head",
    rootVersion: "0.9.4",
    name: "rocketicons",
    version: "0.3.3",
    packagePrepared: true
  };

  const expected = { ...metadata };
  assert.equal(validateReleaseMetadata(metadata, expected), metadata);

  assert.throws(
    () => validateReleaseMetadata(metadata, { ...expected, sourceWorkflowRunId: 123457 }),
    /sourceWorkflowRunId mismatch/
  );
  assert.throws(
    () =>
      validateReleaseMetadata(metadata, { ...expected, releaseHeadSha: "edited-release-head" }),
    /releaseHeadSha mismatch/
  );
});
