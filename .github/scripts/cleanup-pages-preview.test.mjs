import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { cleanupPagesPreview } from "./cleanup-pages-preview.mjs";

const deployment = (id, branch) => ({
  id,
  deployment_trigger: { metadata: { branch } }
});

test("retired previews point to the canonical site", async () => {
  const [redirects, html] = await Promise.all([
    readFile(new URL("../preview-closed/_redirects", import.meta.url), "utf8"),
    readFile(new URL("../preview-closed/index.html", import.meta.url), "utf8")
  ]);

  assert.equal(redirects, "/* https://rocketicons.com/:splat 302\n");
  assert.match(html, /href="https:\/\/rocketicons\.com"/);
  assert.doesNotMatch(html, /rocketicons\.io/);
});

test("deletes superseded deployments only for the retired PR branch", async () => {
  const requests = [];
  const fetchImpl = async (url, init = {}) => {
    requests.push({ url: String(url), method: init.method ?? "GET" });

    return {
      ok: true,
      status: 200,
      json: async () =>
        init.method === "DELETE"
          ? { success: true, result: {} }
          : {
              success: true,
              result: [
                deployment("keep", "pr-164"),
                deployment("old", "pr-164"),
                deployment("other-pr", "pr-999")
              ],
              result_info: { total_pages: 1 }
            }
    };
  };

  const result = await cleanupPagesPreview({
    apiToken: "test-token",
    accountId: "account",
    projectName: "rocketicons",
    previewBranch: "pr-164",
    keepDeploymentId: "keep",
    fetchImpl
  });

  assert.deepEqual(result.deleted, ["old"]);
  assert.deepEqual(
    requests.filter(({ method }) => method === "DELETE"),
    [
      {
        method: "DELETE",
        url: "https://api.cloudflare.com/client/v4/accounts/account/pages/projects/rocketicons/deployments/old?force=true"
      }
    ]
  );
});

test("refuses deletion when the retirement deployment is not visible", async () => {
  let waitCount = 0;
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      result: [deployment("old", "pr-164")],
      result_info: { total_pages: 1 }
    })
  });

  await assert.rejects(
    cleanupPagesPreview({
      apiToken: "test-token",
      accountId: "account",
      projectName: "rocketicons",
      previewBranch: "pr-164",
      keepDeploymentId: "keep",
      fetchImpl,
      wait: async () => {
        waitCount += 1;
      }
    }),
    /refusing cleanup/
  );
  assert.equal(waitCount, 4);
});
