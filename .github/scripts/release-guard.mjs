#!/usr/bin/env node

import fs from "node:fs";
import process from "node:process";
import { pathToFileURL } from "node:url";

const parseStableVersion = (value, label) => {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(value);
  if (!match) throw new Error(`${label} must be a stable SemVer version, received ${value}`);

  return match.slice(1).map(Number);
};

export const CUT_RELEASE_SOURCE_BRANCH = "develop";

export const validateCutReleaseSource = (sourceBranch) => {
  if (sourceBranch !== CUT_RELEASE_SOURCE_BRANCH) {
    throw new Error(
      `Releases must be cut from ${CUT_RELEASE_SOURCE_BRANCH}, received ${sourceBranch}`
    );
  }

  return sourceBranch;
};

export const releaseBranchForVersion = (version) => {
  parseStableVersion(version, "Release version");
  return `release/${version}`;
};

export const releaseVersionFromBranch = (branch) => {
  const match = /^release\/(.+)$/.exec(branch);
  if (!match)
    throw new Error(`Release branches must match release/<version>, received ${branch}`);

  parseStableVersion(match[1], "Release branch version");
  return match[1];
};

export const validateCutReleaseResult = (requestedVersion, rootVersion, tagName) => {
  const releaseBranch = releaseBranchForVersion(requestedVersion);
  parseStableVersion(rootVersion, "Generated root version");

  if (rootVersion !== requestedVersion) {
    throw new Error(
      `Generated root version mismatch: expected ${requestedVersion}, received ${rootVersion}`
    );
  }

  const expectedTagName = `v${requestedVersion}-release`;
  if (tagName !== expectedTagName) {
    throw new Error(`Generated tag mismatch: expected ${expectedTagName}, received ${tagName}`);
  }

  return { releaseBranch, tagName };
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

export const eligibleCutHeadShas = (commits, headSha, headBranch) => {
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

export const selectCutReleaseRun = (
  payload,
  { runHeadBranch, eligibleHeadShas, pullRequestNumber }
) => {
  const runs = Array.isArray(payload?.workflow_runs) ? payload.workflow_runs : [];
  const allowedHeadShas = new Set(eligibleHeadShas);
  const matchingRuns = runs
    .filter(
      (run) =>
        run.event === "workflow_dispatch" &&
        run.status === "completed" &&
        run.conclusion === "success" &&
        run.head_branch === runHeadBranch &&
        allowedHeadShas.has(run.head_sha)
    )
    .sort(
      (left, right) =>
        Date.parse(right.created_at ?? 0) - Date.parse(left.created_at ?? 0) || right.id - left.id
    );

  if (matchingRuns.length === 0) {
    throw new Error(
      `No successful Cut Release run found for PR #${pullRequestNumber} from ${runHeadBranch}`
    );
  }

  return matchingRuns[0].id;
};

export const validateReleaseMetadata = (metadata, expected) => {
  const fields = [
    ["tagName", expected.tagName],
    ["releaseVersion", expected.releaseVersion],
    ["sourceWorkflowRunId", expected.sourceWorkflowRunId],
    ["releaseBranch", expected.releaseBranch],
    ["releaseHeadSha", expected.releaseHeadSha],
    ["cutFromSha", expected.cutFromSha],
    ["rootVersion", expected.rootVersion],
    ["name", expected.name],
    ["version", expected.version],
    ["packagePrepared", expected.packagePrepared]
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
  if (command === "release-branch") {
    const [sourceBranch, version] = args;
    validateCutReleaseSource(sourceBranch);
    process.stdout.write(`${releaseBranchForVersion(version)}\n`);
    return;
  }

  if (command === "release-version") {
    process.stdout.write(`${releaseVersionFromBranch(args[0])}\n`);
    return;
  }

  if (command === "validate-cut-result") {
    validateCutReleaseResult(args[0], args[1], args[2]);
    process.stdout.write("Cut release result validated\n");
    return;
  }

  if (command === "eligible-head-shas") {
    const [headSha, headBranch] = args;
    if (!headSha) throw new Error("Missing pull request head SHA");
    if (!headBranch) throw new Error("Missing pull request head branch");

    const commits = JSON.parse(await readStandardInput());
    process.stdout.write(
      `${JSON.stringify(eligibleCutHeadShas(commits, headSha, headBranch))}\n`
    );
    return;
  }

  if (command === "select-run") {
    const [runHeadBranch, pullRequestNumber, eligibleHeadShasJson] = args;
    if (!runHeadBranch) throw new Error("Missing cut release run head branch");
    if (!pullRequestNumber) throw new Error("Missing pull request number");
    if (!eligibleHeadShasJson) throw new Error("Missing eligible Cut Release head SHAs");

    const eligibleHeadShas = JSON.parse(eligibleHeadShasJson);
    if (!Array.isArray(eligibleHeadShas) || eligibleHeadShas.length === 0) {
      throw new Error("Eligible Cut Release head SHAs must be a non-empty JSON array");
    }

    const payload = JSON.parse(await readStandardInput());
    process.stdout.write(
      `${selectCutReleaseRun(payload, {
        runHeadBranch,
        eligibleHeadShas,
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
      releaseVersion,
      sourceWorkflowRunId,
      releaseBranch,
      releaseHeadSha,
      cutFromSha,
      rootVersion,
      name,
      version,
      packagePrepared
    ] = args;
    const metadata = JSON.parse(fs.readFileSync(file, "utf8"));
    validateReleaseMetadata(metadata, {
      tagName,
      releaseVersion,
      sourceWorkflowRunId: Number(sourceWorkflowRunId),
      releaseBranch,
      releaseHeadSha,
      cutFromSha,
      rootVersion,
      name,
      version,
      packagePrepared: packagePrepared === "true"
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
