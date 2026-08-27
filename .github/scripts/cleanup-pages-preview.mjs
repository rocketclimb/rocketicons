import { pathToFileURL } from "node:url";

const requiredEnvironment = [
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_PAGES_PROJECT",
  "PREVIEW_BRANCH",
  "KEEP_DEPLOYMENT_ID"
];

export async function cleanupPagesPreview({
  apiToken,
  accountId,
  projectName,
  previewBranch,
  keepDeploymentId,
  fetchImpl = fetch,
  wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
}) {
  const baseUrl =
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}` +
    `/pages/projects/${encodeURIComponent(projectName)}/deployments`;

  async function cloudflareRequest(url, init = {}) {
    const response = await fetchImpl(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        ...init.headers
      }
    });
    const body = await response.json();

    if (!response.ok || !body.success) {
      const messages = [...(body.errors ?? []), ...(body.messages ?? [])]
        .map(({ code, message }) => `${code}: ${message}`)
        .join("; ");
      throw new Error(
        `Cloudflare API request failed (${response.status})${messages ? `: ${messages}` : ""}`
      );
    }

    return body;
  }

  async function listDeployments() {
    const deployments = [];
    let page = 1;
    let totalPages = 1;

    do {
      const url = new URL(baseUrl);
      url.searchParams.set("env", "preview");
      url.searchParams.set("page", String(page));

      const body = await cloudflareRequest(url);
      deployments.push(...body.result);
      totalPages = body.result_info?.total_pages ?? 1;
      page += 1;
    } while (page <= totalPages);

    return deployments;
  }

  let branchDeployments = [];

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const deployments = await listDeployments();
    branchDeployments = deployments.filter(
      (deployment) => deployment.deployment_trigger?.metadata?.branch === previewBranch
    );

    if (branchDeployments.some(({ id }) => id === keepDeploymentId)) {
      break;
    }

    if (attempt < 5) {
      await wait(2_000);
    }
  }

  if (!branchDeployments.some(({ id }) => id === keepDeploymentId)) {
    throw new Error(
      `Retirement deployment ${keepDeploymentId} was not found for branch ${previewBranch}; refusing cleanup`
    );
  }

  const supersededDeployments = branchDeployments.filter(({ id }) => id !== keepDeploymentId);

  for (const { id } of supersededDeployments) {
    const url = new URL(`${baseUrl}/${encodeURIComponent(id)}`);
    url.searchParams.set("force", "true");
    await cloudflareRequest(url, { method: "DELETE" });
    console.log(`Deleted superseded deployment ${id}`);
  }

  console.log(
    `Retired ${previewBranch}; deleted ${supersededDeployments.length} deployment(s) and kept ${keepDeploymentId}`
  );

  return { deleted: supersededDeployments.map(({ id }) => id) };
}

async function main() {
  for (const name of requiredEnvironment) {
    if (!process.env[name]) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
  }

  await cleanupPagesPreview({
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    projectName: process.env.CLOUDFLARE_PAGES_PROJECT,
    previewBranch: process.env.PREVIEW_BRANCH,
    keepDeploymentId: process.env.KEEP_DEPLOYMENT_ID
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
