#!/usr/bin/env node

import fs from "node:fs";
import process from "node:process";
import { pathToFileURL } from "node:url";

const parseStableVersion = (value, label) => {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(value);
  if (!match) throw new Error(`${label} must be a stable SemVer version, received ${value}`);

  return match.slice(1).map(Number);
};

export const packageReleaseState = (currentVersion, publishedVersion) => {
  if (currentVersion === publishedVersion) return { publishPackage: false };

  const [major, minor, patch] = parseStableVersion(publishedVersion, "Published version");
  parseStableVersion(currentVersion, "Current version");

  const allowed = new Set([
    `${major}.${minor}.${patch + 1}`,
    `${major}.${minor + 1}.0`,
    `${major + 1}.0.0`
  ]);

  if (!allowed.has(currentVersion)) {
    throw new Error(
      `Refusing to release ${currentVersion} over published ${publishedVersion}; expected one SemVer increment`
    );
  }

  return { publishPackage: true };
};

export const RELEASE_SOURCE_BRANCH = "develop";

export const validateReleaseSourceBranch = (headBranch) => {
  if (headBranch !== RELEASE_SOURCE_BRANCH) {
    throw new Error(
      `Release pull requests must come from ${RELEASE_SOURCE_BRANCH}, received ${headBranch}`
    );
  }

  return headBranch;
};

export const eligiblePrepareHeadShas = (commits, headSha, headBranch) => {
  const pullRequestCommits = commits.flat();
  const headCommit = pullRequestCommits.find((commit) => commit.sha === headSha);
  if (!headCommit) {
    throw new Error(`Pull request head commit ${headSha} was not found`);
  }

  const eligibleHeadShas = [headSha];
  const releaseCommitSubject = `ci(releaser): bump packages versions and update changelog for ${headBranch}`;
  const commitSubject = headCommit.commit?.message?.split("\n", 1)[0];
  const parentSha = headCommit.parents?.[0]?.sha;

  if (commitSubject === releaseCommitSubject && parentSha) {
    eligibleHeadShas.push(parentSha);
  }

  return eligibleHeadShas;
};

export const selectPrepareReleaseRun = (
  payload,
  { headBranch, pullRequestHeadShas, pullRequestNumber }
) => {
  const runs = Array.isArray(payload?.workflow_runs) ? payload.workflow_runs : [];
  const allowedHeadShas = new Set(pullRequestHeadShas);
  const matchingRuns = runs
    .filter(
      (run) =>
        run.status === "completed" &&
        run.conclusion === "success" &&
        run.head_branch === headBranch &&
        allowedHeadShas.has(run.head_sha)
    )
    .sort(
      (left, right) =>
        Date.parse(right.created_at ?? 0) - Date.parse(left.created_at ?? 0) || right.id - left.id
    );

  if (matchingRuns.length === 0) {
    throw new Error(
      `No successful Prepare Release run found for PR #${pullRequestNumber} on ${headBranch}`
    );
  }

  return matchingRuns[0].id;
};

export const validateReleaseMetadata = (metadata, expected) => {
  const fields = [
    ["tagName", expected.tagName],
    ["sourcePullRequestNumber", expected.sourcePullRequestNumber],
    ["sourceHeadBranch", expected.sourceHeadBranch],
    ["sourceHeadSha", expected.sourceHeadSha],
    ["rootVersion", expected.rootVersion],
    ["name", expected.name],
    ["version", expected.version],
    ["publishPackage", expected.publishPackage]
  ];

  for (const [field, value] of fields) {
    if (metadata[field] !== value) {
      throw new Error(
        `Release metadata ${field} mismatch: expected ${JSON.stringify(value)}, received ${JSON.stringify(metadata[field])}`
      );
    }
  }

  return metadata;
};

const readStandardInput = async () => {
  let content = "";
  for await (const chunk of process.stdin) content += chunk;
  return content;
};

const runCli = async ([command, ...args]) => {
  if (command === "validate-source") {
    validateReleaseSourceBranch(args[0]);
    process.stdout.write("Release source validated\n");
    return;
  }

  if (command === "eligible-head-shas") {
    const [headSha, headBranch] = args;
    if (!headSha) throw new Error("Missing pull request head SHA");
    if (!headBranch) throw new Error("Missing pull request head branch");

    const commits = JSON.parse(await readStandardInput());
    process.stdout.write(
      `${JSON.stringify(eligiblePrepareHeadShas(commits, headSha, headBranch))}\n`
    );
    return;
  }

  if (command === "select-run") {
    const [headBranch, pullRequestNumber, pullRequestHeadShasJson] = args;
    if (!headBranch) throw new Error("Missing pull request head branch");
    if (!pullRequestNumber) throw new Error("Missing pull request number");
    if (!pullRequestHeadShasJson) throw new Error("Missing pull request commit SHAs");

    const pullRequestHeadShas = JSON.parse(pullRequestHeadShasJson);
    if (!Array.isArray(pullRequestHeadShas) || pullRequestHeadShas.length === 0) {
      throw new Error("Pull request commit SHAs must be a non-empty JSON array");
    }

    const payload = JSON.parse(await readStandardInput());
    process.stdout.write(
      `${selectPrepareReleaseRun(payload, {
        headBranch,
        pullRequestHeadShas,
        pullRequestNumber: Number(pullRequestNumber)
      })}\n`
    );
    return;
  }

  if (command === "package-state") {
    const state = packageReleaseState(args[0], args[1]);
    process.stdout.write(`${state.publishPackage}\n`);
    return;
  }

  if (command === "validate-metadata") {
    const [
      file,
      tagName,
      pullRequestNumber,
      headBranch,
      headSha,
      rootVersion,
      name,
      version,
      publishPackage
    ] = args;
    const metadata = JSON.parse(fs.readFileSync(file, "utf8"));
    validateReleaseMetadata(metadata, {
      tagName,
      sourcePullRequestNumber: Number(pullRequestNumber),
      sourceHeadBranch: headBranch,
      sourceHeadSha: headSha,
      rootVersion,
      name,
      version,
      publishPackage: publishPackage === "true"
    });
    process.stdout.write("Release metadata validated\n");
    return;
  }

  throw new Error(`Unknown command: ${command ?? "<missing>"}`);
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  runCli(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
