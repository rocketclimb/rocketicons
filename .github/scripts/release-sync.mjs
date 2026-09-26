#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { ghJson, git, retryRead, validateReleasePullRequest } from "./release-recovery.mjs";

function isAncestor(ancestor, descendant, runGit) {
  try {
    runGit("merge-base", "--is-ancestor", ancestor, descendant);
    return true;
  } catch (error) {
    if (error.status !== 1) throw error;
    return false;
  }
}

export function mergeReleaseHistory({ main, develop, release, runGit = git }) {
  if (runGit("status", "--porcelain", "--untracked-files=no")) {
    throw new Error("Branch synchronization requires a clean tracked worktree");
  }
  if (isAncestor(main, develop, runGit)) return develop;
  let mergeTarget = main;
  if (release && !isAncestor(release.head.sha, main, runGit)) {
    const head = release.head.sha;
    const merged = release.merge_commit_sha;
    if (!isAncestor(merged, main, runGit)) throw new Error("Release is not part of main");
    if (runGit("rev-parse", `${head}^{tree}`) !== runGit("rev-parse", `${merged}^{tree}`)) {
      throw new Error(
        "Squashed release differs from the prepared release; manual resolution required"
      );
    }
    const subject = runGit("show", "-s", "--format=%s", head);
    const parents = runGit("show", "-s", "--format=%P", head).split(" ");
    if (
      subject !==
        `ci(releaser): bump packages versions and update changelog for ${release.head.ref}` ||
      parents.length !== 1 ||
      !isAncestor(parents[0], develop, runGit)
    ) {
      throw new Error("Prepared release source is not verified in develop");
    }
    // The trees above prove the squash incorporated the prepared head. Record
    // that missing parent without changing any files on main, then let Git do
    // an ordinary three-way merge with develop (including genuine conflicts).
    mergeTarget = runGit(
      "commit-tree",
      `${main}^{tree}`,
      "-p",
      main,
      "-p",
      head,
      "-m",
      `chore: connect squash-merged release #${release.number} history`
    );
  }
  runGit("switch", "--detach", develop);
  try {
    runGit("merge", "--no-ff", "--no-edit", mergeTarget);
  } catch (error) {
    runGit("merge", "--abort");
    throw new Error("main has conflicting edits with develop; no branch was pushed", {
      cause: error
    });
  }
  return runGit("rev-parse", "HEAD");
}

async function findRelease(main, develop, repository) {
  const base = git("merge-base", main, develop);
  const commits = git("rev-list", "--first-parent", "--max-count=30", `${base}..${main}`)
    .split("\n")
    .filter(Boolean);
  for (const commit of commits) {
    const prs = await retryRead(() => ghJson(`repos/${repository}/commits/${commit}/pulls`));
    const release = prs.find(
      (pr) =>
        pr.merged_at &&
        pr.merge_commit_sha === commit &&
        pr.base.ref === "main" &&
        pr.head.ref.startsWith("release/")
    );
    if (!release) continue;
    validateReleasePullRequest(release, repository);
    // Keep working after the release branch is deleted.
    git("fetch", "--no-tags", "origin", `refs/pull/${release.number}/head`);
    if (git("rev-parse", "FETCH_HEAD") !== release.head.sha)
      throw new Error("Release PR head changed unexpectedly");
    return release;
  }
  return null;
}

async function main() {
  git("config", "user.name", "github-actions[bot]");
  git("config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com");
  for (let attempt = 1; attempt <= 3; attempt++) {
    git("fetch", "--no-tags", "origin", "main", "develop");
    const main = git("rev-parse", "origin/main");
    const develop = git("rev-parse", "origin/develop");
    if (isAncestor(main, develop, git)) {
      console.log("develop already includes main");
      return;
    }
    const release = await findRelease(main, develop, process.env.GITHUB_REPOSITORY);
    mergeReleaseHistory({ main, develop, release });
    try {
      execFileSync("git", ["push", "origin", "HEAD:refs/heads/develop"], { stdio: "inherit" });
      return;
    } catch (error) {
      if (attempt === 3) throw error;
      console.log("Push rejected; fetching and retrying without force");
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
