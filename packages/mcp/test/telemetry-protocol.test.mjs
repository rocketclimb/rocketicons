import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { Client } from "@modelcontextprotocol/client";
import { InMemoryTransport } from "@modelcontextprotocol/server";
import Ajv2020 from "ajv/dist/2020.js";
import { createServer } from "../dist/server.js";

const readJson = (url) => JSON.parse(readFileSync(url, "utf8"));
const eventSchema = readJson(
  new URL("../contracts/telemetry/v1/event.schema.json", import.meta.url)
);
const validate = new Ajv2020({ strict: true, allErrors: true }).compile(eventSchema);
const packageVersion = readJson(new URL("../package.json", import.meta.url)).version;
const canary = "PRIVATE_TELEMETRY_CANARY_7f29";
const calendar = "@fi/fi-calendar";
const camera = "@fi/fi-camera";
const source = "App.jsx";

const fixtureProject = (t) => {
  const root = mkdtempSync(join(tmpdir(), `rocketicons-${canary}-`));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({
      name: canary,
      dependencies: {
        "@rocketicons/utils": "1",
        "@rocketicons/tailwind": "1",
        nativewind: "1",
        "react-native-svg": "1"
      }
    })
  );
  writeFileSync(
    join(root, source),
    `// ${canary}\nexport default function App() { return null; }\n`
  );
  return root;
};

const connect = async (t, enabled = true) => {
  const events = [];
  let closed = false;
  const server = createServer({
    telemetry: {
      enabled: () => enabled,
      record: (event) => events.push(event),
      close: () => {
        closed = true;
      }
    }
  });
  const client = new Client({ name: canary, version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await server.close();
  });
  const call = (name, args = {}) => client.callTool({ name, arguments: args });
  const measured = async (name, args = {}) => {
    const before = events.length;
    const result = await call(name, args);
    assert.equal(events.length, before + 1, `${name} must record one outer callback`);
    const event = events.at(-1);
    assert.equal(validate(event), true, JSON.stringify(validate.errors));
    assert.equal(event.tool, name);
    assert.equal(event.package_version, packageVersion);
    return { result, event };
  };
  return { client, server, events, call, measured, isClosed: () => closed };
};

const init = (call, root) =>
  call("init_project", {
    project_path: root,
    target: "react-native",
    language: "js"
  });
const planArgs = (root, icon_ids) => ({ project_path: root, icon_ids, from_file: source });
const manifest = (root) => readJson(join(root, "rocketicons.json"));

test("all 17 real MCP callbacks emit one valid event without exposing developer content", async (t) => {
  const root = fixtureProject(t);
  const { client, events, measured } = await connect(t);
  const tools = (await client.listTools()).tools.map(({ name }) => name).sort();
  assert.deepEqual(tools, [...eventSchema.properties.tool.enum].sort());
  assert.equal(events.length, 0, "initialize and tool listing are not tool completions");

  const search = await measured("search_icons", { query: calendar });
  assert.equal(search.event.result_count, 1);
  assert.equal(search.event.search_source, "local");
  await measured("get_icon", { icon_id: calendar });
  await measured("get_icon_svg", { icon_id: calendar });
  await measured("compare_icons", { icon_ids: [calendar, camera] });
  await measured("get_icon_usage", { icon_id: calendar, target: "react-native", language: "js" });
  await measured("list_collections");
  await measured("get_collection", { collection_id: "fi" });
  await measured("inspect_project", { project_path: root });
  await init(measured, root);
  const health = await measured("doctor", { project_path: root });
  assert.equal(health.result.structuredContent.healthy, true);
  const upgrade = await measured("plan_project_upgrade", { project_path: root });
  assert.equal(upgrade.event.dry_run, true);
  await measured("apply_project_upgrade", {
    project_path: root,
    plan_id: upgrade.result.structuredContent.planId
  });
  const plan = await measured("plan_icons", planArgs(root, [calendar]));
  assert.equal(plan.event.dry_run, true);
  const applied = await measured("apply_icons", {
    ...planArgs(root, [calendar]),
    plan_id: plan.result.structuredContent.planId
  });
  assert.equal(applied.result.structuredContent.verification.healthy, true);
  assert.equal(applied.event.icons_added_count, 1);
  const addition = await measured("add_icons", { project_path: root, icon_ids: [camera] });
  assert.equal(addition.event.icons_added_count, 1);
  await measured("remove_icons", { project_path: root, icon_ids: [camera] });
  await measured("recommend_icons", {
    project_path: root,
    intent: calendar,
    from_file: source
  });

  assert.equal(events.length, 17);
  assert.deepEqual(events.map(({ tool }) => tool).sort(), tools);
  assert.ok(events.every(({ outcome }) => outcome === "success"));
  for (const event of events) {
    if (event.tool !== "search_icons") {
      assert.equal(event.result_count, 0);
      assert.equal(event.search_source, "not_applicable");
    }
    if (!["apply_icons", "add_icons"].includes(event.tool)) {
      assert.equal(event.icons_added_count, 0);
    }
  }
  const serialized = JSON.stringify(events);
  for (const value of [canary, root, source, calendar, camera, "<svg", "nativewind"]) {
    assert.equal(
      serialized.includes(value),
      false,
      "private/context content escaped the allowlist"
    );
  }
});

test("SDK validation, unknown tools, resources, ping and shutdown do not create events", async (t) => {
  const { client, server, events, call, measured, isClosed } = await connect(t);
  await client.ping();
  await client.listTools();
  await client.listResources();
  await client.readResource({ uri: "rocketicons://icons/fi/fi-calendar/svg" });
  for (const [name, args] of [
    ["get_icon_svg", { icon_id: 123 }],
    ["add_icons", { project_path: "", icon_ids: [] }],
    ["private_unknown_tool", {}]
  ]) {
    const response = await call(name, args).catch(() => null);
    assert.ok(response === null || response.isError);
  }
  assert.equal(events.length, 0);
  const empty = await measured("search_icons", { query: "" });
  assert.equal(empty.event.outcome, "success");
  assert.equal(empty.event.result_count, 0);
  assert.equal(empty.event.search_source, "local");
  const missing = await measured("get_icon", { icon_id: canary });
  assert.equal(missing.result.isError, true);
  assert.equal(missing.event.outcome, "error");
  assert.equal(missing.event.error_code, "ICON_NOT_FOUND");
  const invalidFilter = await measured("search_icons", {
    query: canary,
    collections: [canary]
  });
  assert.equal(invalidFilter.event.error_code, "INVALID_FILTER");
  assert.equal(invalidFilter.event.result_count, 0);
  assert.equal(invalidFilter.event.search_source, "not_applicable");
  assert.equal(JSON.stringify(events).includes(canary), false);
  const beforeClose = events.length;
  await client.close();
  await server.close();
  assert.equal(isClosed(), true);
  assert.equal(events.length, beforeClose);
});

test("add/apply count confirmed new icons, excluding previews, duplicates, preservation and repairs", async (t) => {
  const root = fixtureProject(t);
  const { call, measured } = await connect(t);
  await init(call, root);
  let observed = await measured("add_icons", {
    project_path: root,
    icon_ids: ["fi-calendar", calendar, calendar],
    dry_run: true
  });
  assert.equal(observed.event.dry_run, true);
  assert.equal(observed.event.icons_added_count, 0);
  assert.deepEqual(manifest(root).icons, {});
  observed = await measured("add_icons", {
    project_path: root,
    icon_ids: ["fi-calendar", calendar, calendar]
  });
  assert.equal(observed.event.icons_added_count, 1);
  observed = await measured("add_icons", { project_path: root, icon_ids: [calendar] });
  assert.equal(observed.event.outcome, "success");
  assert.equal(observed.event.icons_added_count, 0);
  const generated = join(root, manifest(root).icons[calendar].path);
  writeFileSync(generated, readFileSync(generated, "utf8") + `\n// ${canary}\n`);
  observed = await measured("add_icons", { project_path: root, icon_ids: [calendar] });
  assert.equal(observed.event.icons_added_count, 0);
  assert.ok(readFileSync(generated, "utf8").includes(canary));
  rmSync(generated);
  observed = await measured("add_icons", { project_path: root, icon_ids: [calendar] });
  assert.equal(observed.event.icons_added_count, 0);
  assert.equal(existsSync(generated), true, "registered missing icon was repaired");

  let plan = (await call("plan_icons", planArgs(root, [camera, calendar, camera])))
    .structuredContent;
  observed = await measured("apply_icons", {
    ...planArgs(root, [camera, calendar, camera]),
    plan_id: plan.planId,
    dry_run: true
  });
  assert.equal(observed.event.dry_run, true);
  assert.equal(observed.event.icons_added_count, 0);
  assert.equal(manifest(root).icons[camera], undefined);
  observed = await measured("apply_icons", {
    ...planArgs(root, [camera, calendar, camera]),
    plan_id: plan.planId
  });
  assert.equal(observed.event.icons_added_count, 1);
  rmSync(join(root, manifest(root).icons[camera].path));
  plan = (await call("plan_icons", planArgs(root, [camera]))).structuredContent;
  observed = await measured("apply_icons", { ...planArgs(root, [camera]), plan_id: plan.planId });
  assert.equal(observed.result.structuredContent.verification.healthy, true);
  assert.equal(observed.event.icons_added_count, 0, "apply repair is not a new icon");
  plan = (await call("plan_icons", planArgs(root, [camera]))).structuredContent;
  observed = await measured("apply_icons", { ...planArgs(root, [camera]), plan_id: plan.planId });
  assert.equal(observed.event.outcome, "success");
  assert.equal(observed.event.icons_added_count, 0, "no-op apply is not a new icon");
});

test("failed post-apply verification records an error and no additions; unhealthy doctor remains success", async (t) => {
  const root = fixtureProject(t);
  const { call, measured } = await connect(t);
  await init(call, root);
  await call("add_icons", { project_path: root, icon_ids: [calendar] });
  rmSync(join(root, manifest(root).icons[calendar].path));
  const plan = (await call("plan_icons", planArgs(root, [camera]))).structuredContent;
  const applied = await measured("apply_icons", {
    ...planArgs(root, [camera]),
    plan_id: plan.planId
  });
  assert.equal(applied.result.structuredContent.verification.healthy, false);
  assert.equal(existsSync(join(root, manifest(root).icons[camera].path)), true);
  assert.equal(applied.event.outcome, "error");
  assert.equal(applied.event.error_code, "VERIFICATION_FAILED");
  assert.equal(applied.event.icons_added_count, 0);
  const health = await measured("doctor", { project_path: root });
  assert.equal(health.result.structuredContent.healthy, false);
  assert.equal(health.event.outcome, "success");
  assert.equal(health.event.error_code, null);
});

test("enabling telemetry preserves public results, tool schemas and resources", async (t) => {
  const root = fixtureProject(t);
  const on = await connect(t);
  const off = await connect(t, false);
  await init(off.call, root);
  assert.deepEqual(await on.client.listTools(), await off.client.listTools());
  assert.deepEqual(
    await on.client.readResource({ uri: "rocketicons://catalog/v1" }),
    await off.client.readResource({ uri: "rocketicons://catalog/v1" })
  );
  for (const [name, args] of [
    ["search_icons", { query: calendar }],
    ["get_icon", { icon_id: calendar }],
    ["get_icon_svg", { icon_id: calendar }],
    ["get_icon_svg", { icon_id: canary }],
    ["compare_icons", { icon_ids: [calendar, camera] }],
    ["inspect_project", { project_path: root }],
    ["doctor", { project_path: root }],
    ["add_icons", { project_path: root, icon_ids: [camera], dry_run: true }],
    ["plan_icons", planArgs(root, [calendar])]
  ]) {
    assert.deepEqual(await on.call(name, args), await off.call(name, args), name);
  }
  assert.equal(off.events.length, 0);
  assert.equal(on.events.length, 9);
});

const rawStdio = (t, commandArgs, env, cwd) => {
  const child = spawn(process.execPath, commandArgs, {
    env,
    cwd,
    stdio: ["pipe", "pipe", "pipe"]
  });
  t.after(() => {
    if (child.exitCode === null) child.kill("SIGKILL");
  });
  const pending = new Map();
  const messages = [];
  let buffer = "";
  let stderr = "";
  let nextId = 0;
  let protocolError;
  const fail = (error) => {
    protocolError = error;
    for (const waiter of pending.values()) waiter.reject(error);
    pending.clear();
  };
  child.on("error", fail);
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });
  child.stdout.on("data", (chunk) => {
    buffer += chunk.toString();
    let newline;
    while ((newline = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newline);
      buffer = buffer.slice(newline + 1);
      try {
        const message = JSON.parse(line);
        assert.equal(message.jsonrpc, "2.0");
        messages.push(message);
        if (pending.has(message.id)) {
          pending.get(message.id).resolve(message);
          pending.delete(message.id);
        }
      } catch (error) {
        fail(error);
      }
    }
  });
  const exit = new Promise((resolve) =>
    child.on("close", (code, signal) => {
      if (pending.size) fail(new Error("MCP exited before answering the protocol request"));
      resolve({ code, signal });
    })
  );
  const send = (message) =>
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", ...message }) + "\n");
  return {
    messages,
    request: (method, params) =>
      new Promise((resolve, reject) => {
        if (protocolError) return reject(protocolError);
        const id = ++nextId;
        const timeout = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`No MCP response for ${method}`));
        }, 10000);
        timeout.unref();
        pending.set(id, {
          resolve: (value) => {
            clearTimeout(timeout);
            resolve(value);
          },
          reject: (error) => {
            clearTimeout(timeout);
            reject(error);
          }
        });
        send({ id, method, params });
      }),
    notify: (method) => send({ method }),
    finish: async () => {
      child.stdin.end();
      let timeout;
      const result = await Promise.race([
        exit,
        new Promise((_, reject) => {
          timeout = setTimeout(() => reject(new Error("MCP did not exit after stdin EOF")), 3000);
        })
      ]).finally(() => clearTimeout(timeout));
      assert.equal(protocolError, undefined);
      assert.equal(buffer, "", "stdout must end with a complete JSON-RPC line");
      assert.equal(stderr, "", "stdio does not prompt or log telemetry");
      assert.deepEqual(result, { code: 0, signal: null });
    }
  };
};

for (const [entry, args] of [
  ["MCP executable", [fileURLToPath(new URL("../dist/index.js", import.meta.url))]],
  [
    "rocketicons mcp",
    [fileURLToPath(new URL("../../icons/bin/index.js", import.meta.url)), "mcp"]
  ]
]) {
  for (const [mode, consent] of [
    ["default off", {}],
    [
      "explicit opt-in with undeployed collector",
      { ROCKETICONS_TELEMETRY: "on", ROCKETICONS_TELEMETRY_POLICY: "1" }
    ],
    [
      "do not track",
      { ROCKETICONS_TELEMETRY: "on", ROCKETICONS_TELEMETRY_POLICY: "1", DO_NOT_TRACK: "1" }
    ],
    ["CI", { ROCKETICONS_TELEMETRY: "on", ROCKETICONS_TELEMETRY_POLICY: "1", CI: "true" }],
    [
      "test environment",
      { ROCKETICONS_TELEMETRY: "on", ROCKETICONS_TELEMETRY_POLICY: "1", NODE_ENV: "test" }
    ],
    [
      "test context",
      {
        ROCKETICONS_TELEMETRY: "on",
        ROCKETICONS_TELEMETRY_POLICY: "1",
        NODE_TEST_CONTEXT: "child-v8"
      }
    ]
  ]) {
    test(
      `${entry}: ${mode} preserves stdout, startup version, offline calls and prompt exit`,
      { timeout: 20000 },
      async (t) => {
        const root = mkdtempSync(join(tmpdir(), "rocketicons-telemetry-stdio-"));
        t.after(() => rmSync(root, { recursive: true, force: true }));
        const auditPath = join(root, "unexpected-network.txt");
        const guardPath = join(root, "network-guard-loaded.txt");
        const server = rawStdio(
          t,
          args,
          {
            PATH: process.env.PATH ?? "",
            // The CLI spawns a fresh node process; NODE_OPTIONS protects that child too.
            NODE_OPTIONS:
              "--import=" +
              JSON.stringify(
                fileURLToPath(new URL("./fixtures/reject-telemetry-network.mjs", import.meta.url))
              ),
            ROCKETICONS_TEST_NETWORK_LOG: auditPath,
            ROCKETICONS_TEST_GUARD_LOG: guardPath,
            ...consent
          },
          root
        );
        const initialized = await server.request("initialize", {
          protocolVersion: "2025-11-25",
          capabilities: {},
          clientInfo: { name: canary, version: "1.0.0" }
        });
        assert.equal(initialized.error, undefined);
        assert.equal(initialized.result.serverInfo.version, packageVersion);
        server.notify("notifications/initialized");
        const listed = await server.request("tools/list", {});
        assert.equal(listed.result.tools.length, 17);
        for (const [name, arguments_] of [
          ["search_icons", { query: calendar }],
          ["get_icon_svg", { icon_id: calendar }]
        ]) {
          const called = await server.request("tools/call", { name, arguments: arguments_ });
          assert.equal(called.error, undefined);
          assert.equal(called.result.isError, undefined);
          assert.ok(called.result.structuredContent);
        }
        await server.finish();
        assert.equal(existsSync(auditPath), false, "no outbound request should be attempted");
        assert.equal(
          readFileSync(guardPath, "utf8"),
          entry === "rocketicons mcp" ? "loaded\nloaded\n" : "loaded\n",
          "network guard must cover the CLI child as well as its parent"
        );
        assert.deepEqual(
          readdirSync(root),
          ["network-guard-loaded.txt"],
          "no persisted telemetry state"
        );
        assert.equal(server.messages.length, 4);
      }
    );
  }
}
