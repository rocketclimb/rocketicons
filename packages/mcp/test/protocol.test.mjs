import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { resolve } from "node:path";
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("stdio tools and resources expose the icon workflow", async () => {
  const client = new Client({ name: "rocketicons-test", version: "1.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve("dist/index.js")]
  });
  await client.connect(transport);
  try {
    const tools = (await client.listTools()).tools.map(({ name }) => name);
    for (const name of [
      "search_icons",
      "get_icon",
      "get_icon_usage",
      "list_collections",
      "get_collection",
      "inspect_project",
      "doctor",
      "init_project",
      "add_icons",
      "remove_icons"
    ])
      assert.ok(tools.includes(name), `Missing ${name}`);
    const search = await client.callTool({
      name: "search_icons",
      arguments: { query: "@fi/fi-calendar", collections: ["fi"] }
    });
    assert.equal(search.structuredContent.source, "local");
    assert.equal(search.structuredContent.results[0].id, "@fi/fi-calendar");
    const metadata = await client.callTool({
      name: "get_icon",
      arguments: { icon_id: "@fi/fi-calendar" }
    });
    assert.equal(metadata.structuredContent.license, "MIT");
    assert.ok(
      metadata.content.some(
        (item) =>
          item.type === "resource_link" && item.uri === "rocketicons://icons/fi/fi-calendar/svg"
      )
    );
    const usage = await client.callTool({
      name: "get_icon_usage",
      arguments: { icon_id: "@fi/fi-calendar", target: "react", language: "js" }
    });
    assert.match(usage.structuredContent.importStatement, /fi-calendar/);
    const svg = await client.readResource({ uri: "rocketicons://icons/fi/fi-calendar/svg" });
    assert.match(svg.contents[0].text, /^<svg/);
    const schema = await client.readResource({ uri: "rocketicons://schemas/config/v1" });
    assert.match(schema.contents[0].text, /catalogVersion/);
    const catalog = await client.readResource({ uri: "rocketicons://catalog/v1" });
    assert.match(catalog.contents[0].text, /collections/);
    const license = await client.readResource({ uri: "rocketicons://licenses/fi" });
    assert.match(license.contents[0].text, /MIT/);
    const root = mkdtempSync(join(tmpdir(), "rocketicons-mcp-protocol-"));
    try {
      writeFileSync(
        join(root, "package.json"),
        JSON.stringify({
          name: "fixture",
          version: "1",
          dependencies: { "@rocketicons/utils": "1", "@rocketicons/tailwind": "1" }
        })
      );
      writeFileSync(join(root, "tsconfig.json"), '{"compilerOptions":{"jsx":"react-jsx"}}');
      const preview = await client.callTool({
        name: "init_project",
        arguments: { project_path: root, dry_run: true }
      });
      assert.equal(preview.structuredContent.dryRun, true);
      assert.equal(existsSync(join(root, "rocketicons.json")), false);
      await client.callTool({ name: "init_project", arguments: { project_path: root } });
      const addPreview = await client.callTool({
        name: "add_icons",
        arguments: { project_path: root, icon_ids: ["@fi/fi-calendar"], dry_run: true }
      });
      assert.equal(addPreview.structuredContent.changes.length, 2);
      await client.callTool({
        name: "add_icons",
        arguments: { project_path: root, icon_ids: ["@fi/fi-calendar"] }
      });
      const health = await client.callTool({ name: "doctor", arguments: { project_path: root } });
      assert.equal(health.structuredContent.healthy, true);
      await client.callTool({
        name: "remove_icons",
        arguments: { project_path: root, icon_ids: ["@fi/fi-calendar"] }
      });
      const inspection = await client.callTool({
        name: "inspect_project",
        arguments: { project_path: root }
      });
      assert.equal(Object.keys(inspection.structuredContent.manifest.icons).length, 0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  } finally {
    await client.close();
  }
});

test("rocketicons mcp starts the same stdio server", async () => {
  const client = new Client({ name: "rocketicons-cli-test", version: "1.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve("../icons/bin/index.js"), "mcp"]
  });
  await client.connect(transport);
  try {
    const tools = (await client.listTools()).tools.map(({ name }) => name);
    assert.ok(tools.includes("search_icons"));
    const search = await client.callTool({
      name: "search_icons",
      arguments: { query: "@fi/fi-calendar" }
    });
    assert.equal(search.structuredContent.results[0].id, "@fi/fi-calendar");
  } finally {
    await client.close();
  }
});
