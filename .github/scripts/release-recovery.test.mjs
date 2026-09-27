import assert from "node:assert/strict";
import test from "node:test";
import {
  ensureReleaseTag,
  recordedCutRun,
  resolveCutRun,
  validateReleasePullRequest
} from "./release-recovery.mjs";

const repository = "rocketclimb/rocketicons";
const head = "a".repeat(40);
const source = "b".repeat(40);
const merge = "c".repeat(40);
const pr = {
  number: 262,
  body: `- Prepared by: https://github.com/${repository}/actions/runs/123`,
  merged_at: "2026-09-26",
  merge_commit_sha: merge,
  base: { ref: "main", repo: { full_name: repository } },
  head: { ref: "release/0.10.0", sha: head, repo: { full_name: repository } }
};
const commit = {
  sha: head,
  commit: {
    message: `ci(releaser): bump packages versions and update changelog for ${pr.head.ref}`
  },
  parents: [{ sha: source }]
};
const run = {
  id: 123,
  repository: { full_name: repository },
  path: ".github/workflows/prepare-release.yml",
  event: "workflow_dispatch",
  head_branch: "develop",
  head_sha: source,
  status: "completed",
  conclusion: "success"
};

test("recorded Cut Release is resolved directly even when filtered run lists are stale", async () => {
  const endpoints = [];
  assert.equal(
    await resolveCutRun({
      repository,
      pr,
      get: (endpoint) => {
        endpoints.push(endpoint);
        return endpoint.includes("/commits/") ? commit : run;
      }
    }),
    run
  );
  assert.deepEqual(endpoints, [
    `repos/${repository}/commits/${head}`,
    `repos/${repository}/actions/runs/123`
  ]);
});

test("temporary direct lookup failure recovers with bounded retries", async () => {
  let attempts = 0;
  const waits = [];
  assert.equal(
    await resolveCutRun({
      repository,
      pr,
      wait: (ms) => waits.push(ms),
      get: (endpoint) => {
        if (endpoint.includes("/commits/")) return commit;
        if (++attempts < 3) throw new Error("HTTP 404");
        return run;
      }
    }),
    run
  );
  assert.deepEqual(waits, [5000, 10000]);
});

test("a wrong repository, workflow, commit, or unsuccessful cut is rejected", async () => {
  for (const change of [
    { repository: { full_name: "someone/else" } },
    { path: ".github/workflows/other.yml" },
    { head_sha: merge },
    { conclusion: "failure" }
  ]) {
    await assert.rejects(
      resolveCutRun({
        repository,
        pr,
        get: (endpoint) => (endpoint.includes("/commits/") ? commit : { ...run, ...change })
      })
    );
  }
  assert.throws(() =>
    recordedCutRun("- Prepared by: https://github.com/someone/else/actions/runs/123", repository)
  );
  assert.throws(() => recordedCutRun(`${pr.body}\n${pr.body}`, repository));
});

test("legacy fallback paginates without branch/status filters and retries empty results", async () => {
  let lists = 0;
  const result = await resolveCutRun({
    repository,
    pr: { ...pr, body: "Legacy PR" },
    wait: () => {},
    get: (endpoint) => {
      if (endpoint.includes("/commits/")) return commit;
      assert.doesNotMatch(endpoint, /status=|branch=/);
      lists++;
      if (lists === 1) return { workflow_runs: [] };
      if (lists === 2)
        return {
          workflow_runs: Array.from({ length: 100 }, (_, index) => ({
            ...run,
            id: 200 + index,
            head_sha: merge
          }))
        };
      assert.match(endpoint, /page=2$/);
      return { workflow_runs: [run] };
    }
  });
  assert.equal(result.id, 123);
  assert.equal(lists, 3);
});

test("missing cut fails after four attempts", async () => {
  let attempts = 0;
  await assert.rejects(
    resolveCutRun({
      repository,
      pr,
      wait: () => {},
      get: (endpoint) => {
        if (endpoint.includes("/commits/")) return commit;
        attempts++;
        throw new Error("missing cut");
      }
    }),
    /missing cut/
  );
  assert.equal(attempts, 4);
});

test("recovery accepts only a merged release from this repository into main", () => {
  assert.equal(validateReleasePullRequest(pr, repository), "0.10.0");
  for (const change of [
    { merged_at: null },
    { base: { ...pr.base, ref: "develop" } },
    { head: { ...pr.head, ref: "feature/test" } },
    { head: { ...pr.head, repo: { full_name: "someone/else" } } }
  ])
    assert.throws(() => validateReleasePullRequest({ ...pr, ...change }, repository));
});

test("matching annotated and lightweight tags are reused without writing", () => {
  for (const refs of [
    `${merge}\trefs/tags/v0.10.0-release`,
    `${source}\trefs/tags/v0.10.0-release\n${merge}\trefs/tags/v0.10.0-release^{}`
  ]) {
    const calls = [];
    ensureReleaseTag("v0.10.0-release", merge, (...args) => {
      calls.push(args);
      return refs;
    });
    assert.equal(calls.length, 1);
  }
});

test("conflicting tags stop; a new tag uses the original release commit", () => {
  assert.throws(
    () =>
      ensureReleaseTag("v0.10.0-release", merge, () => `${source}\trefs/tags/v0.10.0-release`),
    /points to/
  );
  const calls = [];
  ensureReleaseTag("v0.10.0-release", merge, (...args) => {
    calls.push(args);
    return "";
  });
  assert.deepEqual(calls[1], ["tag", "-a", "v0.10.0-release", merge, "-m", "v0.10.0-release"]);
  assert.deepEqual(calls[2], ["push", "origin", "refs/tags/v0.10.0-release", "--no-verify"]);
});
