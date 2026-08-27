import { pathToFileURL } from "node:url";

const githubApiVersion = "2022-11-28";

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
    return { deploymentId: null };
  }

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
  return { deploymentId: deployment.id };
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
    "PREVIEW_ENVIRONMENT"
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
    return;
  }

  if (process.env.PREVIEW_ACTION === "retire") {
    await retireGitHubPreview(options);
    return;
  }

  throw new Error(`Unknown PREVIEW_ACTION: ${process.env.PREVIEW_ACTION}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
