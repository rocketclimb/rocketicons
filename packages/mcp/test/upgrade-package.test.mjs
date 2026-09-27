import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  symlinkSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import Ajv2020 from "ajv/dist/2020.js";

test(
  "packed MCP and CLI upgrade an existing project and preserve installed icons",
  { timeout: 120000 },
  async () => {
    const root = mkdtempSync(join(tmpdir(), "rocketicons-packed-upgrade-"));
    const modules = join(root, "node_modules");
    const project = join(root, "app");
    let client;
    try {
      for (const [folder, name] of [
        ["toolkit", "@rocketicons/toolkit"],
        ["mcp", "@rocketicons/mcp"],
        ["utils", "@rocketicons/utils"],
        ["icons", "rocketicons"]
      ]) {
        const packed = JSON.parse(
          execFileSync(
            "npm",
            [
              "pack",
              "--ignore-scripts",
              "--offline",
              "--json",
              "--pack-destination",
              root,
              "--cache",
              join(root, "cache")
            ],
            { cwd: resolve("..", folder), encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }
          )
        )[0];
        const destination = join(modules, name);
        mkdirSync(destination, { recursive: true });
        execFileSync("tar", [
          "-xzf",
          join(root, packed.filename),
          "-C",
          destination,
          "--strip-components=1"
        ]);
      }
      for (const name of [
        "@modelcontextprotocol/server",
        "algoliasearch",
        "jsonc-parser",
        "typescript",
        "sharp",
        "zod"
      ]) {
        const destination = join(modules, name);
        mkdirSync(dirname(destination), { recursive: true });
        symlinkSync(
          name === "zod" ? resolve("node_modules/zod") : resolve("../../node_modules", name),
          destination,
          "dir"
        );
      }
      mkdirSync(project);
      writeFileSync(
        join(project, "package.json"),
        JSON.stringify({
          name: "packed-upgrade",
          dependencies: {
            "@rocketicons/utils": "1",
            "@rocketicons/tailwind": "1",
            nativewind: "1",
            "react-native-svg": "1"
          }
        })
      );
      writeFileSync(join(project, "App.jsx"), "export default function App() { return null; }");
      client = new Client({ name: "upgrade-package-test", version: "1.0.0" });
      await client.connect(
        new StdioClientTransport({
          command: process.execPath,
          args: [join(modules, "@rocketicons/mcp/dist/index.js")]
        })
      );
      const ajv = new Ajv2020({ strict: false });
      const schemas = Object.fromEntries(
        (await client.listTools()).tools.map((tool) => [
          tool.name,
          ajv.compile(tool.outputSchema)
        ])
      );
      const call = async (name, args = {}) => {
        const result = await client.callTool({
          name,
          arguments: { project_path: project, ...args }
        });
        if (!result.isError)
          assert.ok(
            schemas[name](result.structuredContent),
            JSON.stringify(schemas[name].errors)
          );
        return result;
      };
      assert.ok(
        !(await call("init_project", { target: "react-native", language: "js" })).isError
      );
      assert.ok(!(await call("add_icons", { icon_ids: ["@fi/fi-calendar"] })).isError);
      const manifestPath = join(project, "rocketicons.json");
      const manifest = JSON.parse(readFileSync(manifestPath));
      const destinationVersion = manifest.catalogVersion;
      manifest.catalogVersion = "0.3.3";
      delete manifest.icons["@fi/fi-calendar"].catalogVersion;
      writeFileSync(manifestPath, JSON.stringify(manifest));
      const preservedPath = join(project, manifest.icons["@fi/fi-calendar"].path);
      const preserved = readFileSync(preservedPath, "utf8");
      const mismatch = await call("add_icons", { icon_ids: ["@fi/fi-camera"], dry_run: true });
      assert.equal(mismatch.structuredContent.error.code, "CATALOG_MISMATCH");
      assert.match(mismatch.structuredContent.error.nextStep, /plan_project_upgrade/);
      const cli = (...args) =>
        JSON.parse(
          execFileSync(
            process.execPath,
            [join(modules, "rocketicons/bin/index.js"), ...args, "--cwd", project, "--json"],
            { encoding: "utf8" }
          )
        );
      const cliPlan = cli("upgrade", "--dry-run");
      const plan = (await call("plan_project_upgrade")).structuredContent;
      assert.equal(cliPlan.planId, plan.planId);
      assert.equal(plan.toCatalogVersion, destinationVersion);
      const before = readFileSync(manifestPath, "utf8");
      await call("apply_project_upgrade", { plan_id: plan.planId, dry_run: true });
      assert.equal(readFileSync(manifestPath, "utf8"), before);
      const stale = await call("apply_project_upgrade", { plan_id: "0".repeat(64) });
      assert.equal(stale.structuredContent.error.code, "STALE_PLAN");
      assert.match(stale.structuredContent.error.nextStep, /plan_project_upgrade/);
      const refused = spawnSync(
        process.execPath,
        [join(modules, "rocketicons/bin/index.js"), "upgrade", "--cwd", project],
        { encoding: "utf8" }
      );
      assert.equal(refused.status, 1);
      assert.equal(readFileSync(manifestPath, "utf8"), before);
      const upgraded = await call("apply_project_upgrade", { plan_id: plan.planId });
      assert.equal(upgraded.structuredContent.verification.healthy, true);
      assert.equal(readFileSync(preservedPath, "utf8"), preserved);
      const icons = (
        await call("plan_icons", { icon_ids: ["@fi/fi-camera"], from_file: "App.jsx" })
      ).structuredContent;
      const applied = await call("apply_icons", {
        icon_ids: ["@fi/fi-camera"],
        from_file: "App.jsx",
        plan_id: icons.planId
      });
      assert.equal(applied.structuredContent.verification.healthy, true);
      assert.equal(
        JSON.parse(readFileSync(manifestPath)).icons["@fi/fi-calendar"].catalogVersion,
        "0.3.3"
      );
      // Exercise CLI apply on a second migration, not only the no-op case.
      const again = JSON.parse(readFileSync(manifestPath));
      again.catalogVersion = "0.3.3";
      writeFileSync(manifestPath, JSON.stringify(again));
      const second = cli("upgrade", "--dry-run");
      assert.equal(cli("upgrade", "--plan-id", second.planId).verification.healthy, true);
      const current = cli("upgrade", "--dry-run");
      assert.deepEqual(current.fileChanges, []);
      assert.deepEqual(cli("upgrade", "--plan-id", current.planId).fileChanges, []);
      assert.equal(readFileSync(preservedPath, "utf8"), preserved);
    } finally {
      await client?.close();
      rmSync(root, { recursive: true, force: true });
    }
  }
);
