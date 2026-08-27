import assert from "node:assert/strict";
import test from "node:test";

import {
  previewCommentBody,
  publishGitHubPreview,
  retireGitHubPreview,
  upsertPreviewComment
} from "./github-pages-preview.mjs";

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body)
  };
}

test("publishes the stable preview URL as a transient GitHub deployment", async () => {
  const requests = [];
  const responses = [jsonResponse({ id: 1670 }, 201), jsonResponse({ id: 9001 }, 201)];
  const fetchImpl = async (url, init = {}) => {
    requests.push({
      url: String(url),
      method: init.method ?? "GET",
      body: init.body ? JSON.parse(init.body) : null
    });
    return responses.shift();
  };

  const result = await publishGitHubPreview({
    token: "test-token",
    repository: "rocketclimb/rocketicons",
    ref: "abc123",
    environment: "pr-167",
    environmentUrl: "https://pr-167.rocketicons.pages.dev",
    runUrl: "https://github.com/rocketclimb/rocketicons/actions/runs/42",
    fetchImpl
  });

  assert.deepEqual(result, { deploymentId: 1670 });
  assert.deepEqual(requests, [
    {
      url: "https://api.github.com/repos/rocketclimb/rocketicons/deployments",
      method: "POST",
      body: {
        ref: "abc123",
        task: "deploy",
        auto_merge: false,
        required_contexts: [],
        environment: "pr-167",
        description: "Cloudflare Pages preview",
        transient_environment: true,
        production_environment: false
      }
    },
    {
      url: "https://api.github.com/repos/rocketclimb/rocketicons/deployments/1670/statuses",
      method: "POST",
      body: {
        state: "success",
        environment: "pr-167",
        environment_url: "https://pr-167.rocketicons.pages.dev",
        log_url: "https://github.com/rocketclimb/rocketicons/actions/runs/42",
        description: "Cloudflare Pages preview is ready",
        auto_inactive: true,
        production_environment: false
      }
    }
  ]);
});

test("retires the latest GitHub deployment for a closed preview", async () => {
  const requests = [];
  const responses = [
    jsonResponse([{ id: 1670, sha: "abc123" }]),
    jsonResponse([
      {
        environment_url: "https://pr-167.rocketicons.pages.dev",
        log_url: "https://github.com/rocketclimb/rocketicons/actions/runs/42"
      }
    ]),
    jsonResponse({ id: 9002 }, 201)
  ];
  const fetchImpl = async (url, init = {}) => {
    requests.push({
      url: String(url),
      method: init.method ?? "GET",
      body: init.body ? JSON.parse(init.body) : null
    });
    return responses.shift();
  };

  const result = await retireGitHubPreview({
    token: "test-token",
    repository: "rocketclimb/rocketicons",
    environment: "pr-167",
    runUrl: "https://github.com/rocketclimb/rocketicons/actions/runs/43",
    fetchImpl
  });

  assert.deepEqual(result, {
    deploymentId: 1670,
    ref: "abc123",
    environmentUrl: "https://pr-167.rocketicons.pages.dev",
    deploymentRunUrl: "https://github.com/rocketclimb/rocketicons/actions/runs/42"
  });
  assert.deepEqual(requests, [
    {
      url: "https://api.github.com/repos/rocketclimb/rocketicons/deployments?environment=pr-167&per_page=1",
      method: "GET",
      body: null
    },
    {
      url: "https://api.github.com/repos/rocketclimb/rocketicons/deployments/1670/statuses?per_page=1",
      method: "GET",
      body: null
    },
    {
      url: "https://api.github.com/repos/rocketclimb/rocketicons/deployments/1670/statuses",
      method: "POST",
      body: {
        state: "inactive",
        environment: "pr-167",
        log_url: "https://github.com/rocketclimb/rocketicons/actions/runs/43",
        description: "Cloudflare Pages preview retired",
        production_environment: false
      }
    }
  ]);
});

test("retiring is a no-op when no GitHub deployment exists", async () => {
  const result = await retireGitHubPreview({
    token: "test-token",
    repository: "rocketclimb/rocketicons",
    environment: "pr-167",
    runUrl: "https://github.com/rocketclimb/rocketicons/actions/runs/43",
    fetchImpl: async () => jsonResponse([])
  });

  assert.deepEqual(result, {
    deploymentId: null,
    ref: null,
    environmentUrl: null,
    deploymentRunUrl: null
  });
});

test("creates one durable PR comment when a preview becomes ready", async () => {
  const requests = [];
  const responses = [jsonResponse([]), jsonResponse({ id: 1700 }, 201)];
  const fetchImpl = async (url, init = {}) => {
    requests.push({
      url: String(url),
      method: init.method ?? "GET",
      body: init.body ? JSON.parse(init.body) : null
    });
    return responses.shift();
  };
  const options = {
    token: "test-token",
    repository: "rocketclimb/rocketicons",
    pullRequestNumber: "170",
    state: "ready",
    environment: "pr-170",
    environmentUrl: "https://pr-170.rocketicons.pages.dev",
    ref: "abcdef123456",
    deploymentRunUrl: "https://github.com/rocketclimb/rocketicons/actions/runs/50",
    lifecycleRunUrl: "https://github.com/rocketclimb/rocketicons/actions/runs/50",
    fetchImpl
  };

  const result = await upsertPreviewComment(options);

  assert.deepEqual(result, { commentId: 1700 });
  assert.deepEqual(requests, [
    {
      url: "https://api.github.com/repos/rocketclimb/rocketicons/issues/170/comments?per_page=100",
      method: "GET",
      body: null
    },
    {
      url: "https://api.github.com/repos/rocketclimb/rocketicons/issues/170/comments",
      method: "POST",
      body: {
        body: previewCommentBody(options)
      }
    }
  ]);
});

test("updates the same PR comment on retirement and preserves deployment history", async () => {
  const readyBody = previewCommentBody({
    state: "ready",
    repository: "rocketclimb/rocketicons",
    environment: "pr-170",
    environmentUrl: "https://pr-170.rocketicons.pages.dev",
    ref: "abcdef123456",
    deploymentRunUrl: "https://github.com/rocketclimb/rocketicons/actions/runs/50",
    lifecycleRunUrl: "https://github.com/rocketclimb/rocketicons/actions/runs/50"
  });
  const requests = [];
  const responses = [
    jsonResponse([{ id: 1700, user: { type: "Bot" }, body: readyBody }]),
    jsonResponse({ id: 1700 })
  ];
  const fetchImpl = async (url, init = {}) => {
    requests.push({
      url: String(url),
      method: init.method ?? "GET",
      body: init.body ? JSON.parse(init.body) : null
    });
    return responses.shift();
  };

  const result = await upsertPreviewComment({
    token: "test-token",
    repository: "rocketclimb/rocketicons",
    pullRequestNumber: "170",
    state: "retired",
    environment: "pr-170",
    environmentUrl: null,
    ref: null,
    deploymentRunUrl: null,
    lifecycleRunUrl: "https://github.com/rocketclimb/rocketicons/actions/runs/51",
    fetchImpl
  });

  assert.deepEqual(result, { commentId: 1700 });
  assert.equal(requests[1].method, "PATCH");
  assert.equal(
    requests[1].url,
    "https://api.github.com/repos/rocketclimb/rocketicons/issues/comments/1700"
  );
  assert.match(requests[1].body.body, /Recorded preview URL/);
  assert.match(requests[1].body.body, /Retired — the URL now redirects to production/);
  assert.match(requests[1].body.body, /abcdef12/);
  assert.match(requests[1].body.body, /actions\/runs\/50/);
  assert.match(requests[1].body.body, /actions\/runs\/51/);
});
