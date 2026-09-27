#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { appendFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  eligibleCutHeadShas,
  releaseVersionFromBranch,
  selectCutReleaseRun
} from "./release-guard.mjs";

export const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
export const ghJson = (endpoint) =>
  JSON.parse(execFileSync("gh", ["api", "--method", "GET", endpoint], { encoding: "utf8" }));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retryRead(read, { wait = sleep, attempts = 4 } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await read();
    } catch (error) {
      if (attempt === attempts) throw error;
      console.error(`Release lookup attempt ${attempt} failed; retrying`);
      await wait(5000 * attempt);
    }
  }
}

export function validateReleasePullRequest(pr, repository) {
  if (
    !pr.merged_at ||
    pr.base?.ref !== "main" ||
    pr.base?.repo?.full_name !== repository ||
    pr.head?.repo?.full_name !== repository ||
    !/^[a-f0-9]{40}$/.test(pr.merge_commit_sha ?? "") ||
    !/^[a-f0-9]{40}$/.test(pr.head?.sha ?? "")
  ) {
    throw new Error("Expected a merged release PR from this repository into main");
  }
  return releaseVersionFromBranch(pr.head.ref);
}

export function recordedCutRun(body, repository) {
  const lines = (body ?? "").split("\n").filter((line) => /^- Prepared by:/.test(line));
  if (!lines.length) return null;
  if (lines.length !== 1) throw new Error("Release PR has multiple Prepared by entries");
  const match =
    /^- Prepared by: https:\/\/github\.com\/([^/]+\/[^/]+)\/actions\/runs\/(\d+)\s*$/.exec(
      lines[0]
    );
  if (!match || match[1] !== repository) {
    throw new Error("Prepared by must reference a Cut Release run in this repository");
  }
  return match[2];
}

export async function resolveCutRun({ repository, pr, get = ghJson, wait = sleep }) {
  const commit = await retryRead(() => get(`repos/${repository}/commits/${pr.head.sha}`), {
    wait
  });
  const eligible = eligibleCutHeadShas([commit], pr.head.sha, pr.head.ref);
  const options = {
    runHeadBranch: "develop",
    eligibleHeadShas: eligible,
    pullRequestNumber: pr.number
  };
  const runId = recordedCutRun(pr.body, repository);
  let run;
  if (runId) {
    run = await retryRead(() => get(`repos/${repository}/actions/runs/${runId}`), { wait });
  } else {
    // Legacy PRs have no recorded URL. Bound the fallback and avoid relying on
    // GitHub's status/branch filters, which failed to find the September cut.
    run = await retryRead(
      async () => {
        const runs = [];
        for (let page = 1; page <= 3; page++) {
          const payload = await get(
            `repos/${repository}/actions/workflows/prepare-release.yml/runs?per_page=100&page=${page}`
          );
          runs.push(...payload.workflow_runs);
          if (payload.workflow_runs.length < 100) break;
        }
        const selected = selectCutReleaseRun({ workflow_runs: runs }, options);
        return runs.find((entry) => entry.id === selected);
      },
      { wait }
    );
  }
  if (
    run.repository?.full_name !== repository ||
    run.path !== ".github/workflows/prepare-release.yml" ||
    (runId && String(run.id) !== runId)
  ) {
    throw new Error("Recorded run does not belong to this repository's Cut Release workflow");
  }
  selectCutReleaseRun({ workflow_runs: [run] }, options);
  return run;
}

export function ensureReleaseTag(tag, commit, runGit = git) {
  if (!/^v\d+\.\d+\.\d+-release$/.test(tag) || !/^[a-f0-9]{40}$/.test(commit)) {
    throw new Error("Invalid release tag or commit");
  }
  const existing = runGit(
    "ls-remote",
    "--tags",
    "origin",
    `refs/tags/${tag}`,
    `refs/tags/${tag}^{}`
  );
  if (existing) {
    const refs = new Map(existing.split("\n").map((line) => line.split(/\s+/).reverse()));
    const target = refs.get(`refs/tags/${tag}^{}`) ?? refs.get(`refs/tags/${tag}`);
    if (target !== commit) throw new Error(`Tag ${tag} points to ${target}, expected ${commit}`);
    console.log(`Reusing ${tag} at ${commit}`);
    return;
  }
  runGit("tag", "-a", tag, commit, "-m", tag);
  runGit("push", "origin", `refs/tags/${tag}`, "--no-verify");
}

const output = (name, value) => appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);

async function main(command) {
  const repository = process.env.GITHUB_REPOSITORY;
  if (command === "source") {
    if (process.env.GITHUB_REF !== "refs/heads/main")
      throw new Error("Run release recovery from main");
    const requested = process.env.RECOVERY_PR;
    let pr;
    if (process.env.GITHUB_EVENT_NAME === "workflow_dispatch") {
      if (!/^[1-9]\d*$/.test(requested ?? ""))
        throw new Error("A merged release PR number is required");
      pr = await retryRead(() => ghJson(`repos/${repository}/pulls/${requested}`));
    } else {
      const prs = await retryRead(() =>
        ghJson(`repos/${repository}/commits/${process.env.GITHUB_SHA}/pulls`)
      );
      pr = prs.find(
        (entry) =>
          entry.merged_at &&
          entry.base.ref === "main" &&
          entry.merge_commit_sha === process.env.GITHUB_SHA &&
          entry.head.ref.startsWith("release/")
      );
      if (!pr) {
        output("IS_RELEASE_SOURCE", "false");
        return;
      }
    }
    const version = validateReleasePullRequest(pr, repository);
    git("merge-base", "--is-ancestor", pr.merge_commit_sha, "origin/main");
    writeFileSync("release-source.json", JSON.stringify(pr));
    output("IS_RELEASE_SOURCE", "true");
    output("RELEASE_VERSION", version);
    output("RELEASE_COMMIT", pr.merge_commit_sha);
    output("SOURCE_PR_NUMBER", pr.number);
    output("SOURCE_HEAD_BRANCH", pr.head.ref);
    output("SOURCE_HEAD_SHA", pr.head.sha);
    return;
  }
  if (command === "cut") {
    const { readFileSync } = await import("node:fs");
    const pr = JSON.parse(readFileSync("release-source.json", "utf8"));
    const run = await resolveCutRun({ repository, pr });
    output("CUT_RUN_ID", run.id);
    output("CUT_HEAD_SHA", run.head_sha);
    console.log(`Using Cut Release ${run.id} from ${run.head_sha}`);
    return;
  }
  if (command === "tag") {
    ensureReleaseTag(process.env.PENDING_TAG, process.env.RELEASE_COMMIT);
    return;
  }
  throw new Error(`Unknown command ${command}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv[2]).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
