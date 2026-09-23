import { pathToFileURL } from "node:url";

const githubApiVersion = "2022-11-28";
const previewCommentMarker = "<!-- rocketicons-preview-deployment -->";

function repositoryPath(repository) {
  const [owner, repo, extra] = repository.split("/");

  if (!owner || !repo || extra) {
    throw new Error(`Invalid GitHub repository: ${repository}`);
  }

  return `${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

async function githubRequest(url, { token, fetchImpl, ...init }) {
  const response = await fetchImpl(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": githubApiVersion,
      ...init.headers
    }
  });
  const responseText = await response.text();
  const body = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    throw new Error(
      `GitHub API request failed (${response.status})${body?.message ? `: ${body.message}` : ""}`
    );
  }

  return body;
}

export async function publishGitHubPreview({
  token,
  repository,
  ref,
  environment,
  environmentUrl,
  runUrl,
  fetchImpl = fetch
}) {
  const deploymentsUrl =
    `https://api.github.com/repos/${repositoryPath(repository)}` + "/deployments";
  const deployment = await githubRequest(deploymentsUrl, {
    token,
    fetchImpl,
    method: "POST",
    body: JSON.stringify({
      ref,
      task: "deploy",
      auto_merge: false,
      required_contexts: [],
      environment,
      description: "Cloudflare Pages preview",
      transient_environment: true,
      production_environment: false
    })
  });

  await githubRequest(`${deploymentsUrl}/${encodeURIComponent(deployment.id)}/statuses`, {
    token,
    fetchImpl,
    method: "POST",
    body: JSON.stringify({
      state: "success",
      environment,
      environment_url: environmentUrl,
      log_url: runUrl,
      description: "Cloudflare Pages preview is ready",
      auto_inactive: true,
      production_environment: false
    })
  });

  console.log(`Published GitHub deployment ${deployment.id}: ${environmentUrl}`);
  return { deploymentId: deployment.id };
}

export async function retireGitHubPreview({
  token,
  repository,
  environment,
  runUrl,
  fetchImpl = fetch
}) {
  const deploymentsUrl = new URL(
    `https://api.github.com/repos/${repositoryPath(repository)}/deployments`
  );
  deploymentsUrl.searchParams.set("environment", environment);
  deploymentsUrl.searchParams.set("per_page", "1");

  const deployments = await githubRequest(deploymentsUrl, { token, fetchImpl });
  const [deployment] = deployments;

  if (!deployment) {
    console.log(`No GitHub deployment found for ${environment}`);
    return {
      deploymentId: null,
      ref: null,
      environmentUrl: null,
      deploymentRunUrl: null
    };
  }

  const statuses = await githubRequest(
    `https://api.github.com/repos/${repositoryPath(repository)}` +
      `/deployments/${encodeURIComponent(deployment.id)}/statuses?per_page=1`,
    { token, fetchImpl }
  );
  const [previousStatus] = statuses;

  await githubRequest(
    `https://api.github.com/repos/${repositoryPath(repository)}` +
      `/deployments/${encodeURIComponent(deployment.id)}/statuses`,
    {
      token,
      fetchImpl,
      method: "POST",
      body: JSON.stringify({
        state: "inactive",
        environment,
        log_url: runUrl,
        description: "Cloudflare Pages preview retired",
        production_environment: false
      })
    }
  );

  console.log(`Retired GitHub deployment ${deployment.id}`);
  return {
    deploymentId: deployment.id,
    ref: deployment.sha ?? null,
    environmentUrl: previousStatus?.environment_url ?? null,
    deploymentRunUrl: previousStatus?.log_url ?? null
  };
}

function tableValue(body, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return body?.match(new RegExp(`^\\| ${escapedLabel} \\| (.+) \\|$`, "m"))?.[1] ?? null;
}

function linkedUrl(body) {
  return body?.match(/\]\((https:\/\/[^)]+)\)/)?.[1] ?? null;
}

export function previewCommentBody({
  state,
  repository,
  environment,
  environmentUrl,
  ref,
  deploymentRunUrl,
  lifecycleRunUrl,
  existingBody = ""
}) {
  const ready = state === "ready";
  const status = ready ? "Ready" : "Retired — the URL now redirects to production";
  const previewUrl = environmentUrl ?? linkedUrl(existingBody);
  const environmentCell = `\`${environment}\``;
  const commitCell = ref
    ? `[\`${ref.slice(0, 8)}\`](https://github.com/${repository}/commit/${ref})`
    : tableValue(existingBody, "Commit");
  const deploymentRunCell = deploymentRunUrl
    ? `[View workflow run](${deploymentRunUrl})`
    : tableValue(existingBody, "Deployment run");
  const rows = [
    `| Status | ${status} |`,
    `| Environment | ${environmentCell} |`,
    ...(commitCell ? [`| Commit | ${commitCell} |`] : []),
    ...(deploymentRunCell ? [`| Deployment run | ${deploymentRunCell} |`] : []),
    ...(!ready ? [`| Retirement run | [View workflow run](${lifecycleRunUrl}) |`] : [])
  ];

  return [
    previewCommentMarker,
    "### Preview deployment",
    "",
    previewUrl
      ? `[${ready ? "Open preview" : "Recorded preview URL"}](${previewUrl})`
      : "The preview URL was not recorded.",
    "",
    "| Detail | Value |",
    "| --- | --- |",
    ...rows,
    "",
    "This comment is managed by the preview deployment workflow and remains as deployment history."
  ].join("\n");
}

export async function upsertPreviewComment({
  token,
  repository,
  pullRequestNumber,
  state,
  environment,
  environmentUrl,
  ref,
  deploymentRunUrl,
  lifecycleRunUrl,
  fetchImpl = fetch
}) {
  const issueCommentsUrl =
    `https://api.github.com/repos/${repositoryPath(repository)}` +
    `/issues/${encodeURIComponent(pullRequestNumber)}/comments`;
  const comments = await githubRequest(`${issueCommentsUrl}?per_page=100`, {
    token,
    fetchImpl
  });
  const existingComment = comments.find(
    (comment) => comment.user?.type === "Bot" && comment.body?.includes(previewCommentMarker)
  );
  const body = previewCommentBody({
    state,
    repository,
    environment,
    environmentUrl,
    ref,
    deploymentRunUrl,
    lifecycleRunUrl,
    existingBody: existingComment?.body
  });

  if (existingComment) {
    await githubRequest(
      `https://api.github.com/repos/${repositoryPath(repository)}` +
        `/issues/comments/${encodeURIComponent(existingComment.id)}`,
      {
        token,
        fetchImpl,
        method: "PATCH",
        body: JSON.stringify({ body })
      }
    );
    console.log(`Updated preview comment ${existingComment.id}`);
    return { commentId: existingComment.id };
  }

  const comment = await githubRequest(issueCommentsUrl, {
    token,
    fetchImpl,
    method: "POST",
    body: JSON.stringify({ body })
  });
  console.log(`Created preview comment ${comment.id}`);
  return { commentId: comment.id };
}

function requireEnvironment(names) {
  for (const name of names) {
    if (!process.env[name]) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
  }
}

async function main() {
  const commonEnvironment = [
    "GITHUB_TOKEN",
    "GITHUB_REPOSITORY",
    "GITHUB_RUN_URL",
    "PREVIEW_ACTION",
    "PREVIEW_ENVIRONMENT",
    "PREVIEW_PR_NUMBER"
  ];
  requireEnvironment(commonEnvironment);

  const options = {
    token: process.env.GITHUB_TOKEN,
    repository: process.env.GITHUB_REPOSITORY,
    environment: process.env.PREVIEW_ENVIRONMENT,
    runUrl: process.env.GITHUB_RUN_URL
  };

  if (process.env.PREVIEW_ACTION === "publish") {
    requireEnvironment(["PREVIEW_REF", "PREVIEW_URL"]);
    await publishGitHubPreview({
      ...options,
      ref: process.env.PREVIEW_REF,
      environmentUrl: process.env.PREVIEW_URL
    });
    await upsertPreviewComment({
      ...options,
      pullRequestNumber: process.env.PREVIEW_PR_NUMBER,
      state: "ready",
      environmentUrl: process.env.PREVIEW_URL,
      ref: process.env.PREVIEW_REF,
      deploymentRunUrl: process.env.GITHUB_RUN_URL,
      lifecycleRunUrl: process.env.GITHUB_RUN_URL
    });
    return;
  }

  if (process.env.PREVIEW_ACTION === "retire") {
    const retirement = await retireGitHubPreview(options);
    await upsertPreviewComment({
      ...options,
      pullRequestNumber: process.env.PREVIEW_PR_NUMBER,
      state: "retired",
      environmentUrl: retirement.environmentUrl ?? process.env.PREVIEW_URL,
      ref: retirement.ref ?? process.env.PREVIEW_REF,
      deploymentRunUrl: retirement.deploymentRunUrl,
      lifecycleRunUrl: process.env.GITHUB_RUN_URL
    });
    return;
  }

  throw new Error(`Unknown PREVIEW_ACTION: ${process.env.PREVIEW_ACTION}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
