import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import {
  resolveTelemetryConsent,
  TELEMETRY_POLICY_VERSION
} from "../contracts/telemetry/v1/consent.mjs";

const read = (relative) => JSON.parse(readFileSync(new URL(relative, import.meta.url), "utf8"));
const schema = read("../contracts/telemetry/v1/event.schema.json");
const batchSchema = read("../contracts/telemetry/v1/batch.schema.json");
const sample = read("../contracts/telemetry/v1/example.json");
const fixtures = read("./fixtures/telemetry-v1.json");
const ajv = new Ajv2020({ allErrors: true, strict: true });
ajv.addSchema(schema);
const validate = ajv.getSchema(schema.$id);
const validateBatch = ajv.compile(batchSchema);
const failures = () => JSON.stringify(validate.errors);

test("published example satisfies the strict schema and consent policy version", () => {
  assert.equal(validate(sample), true, failures());
  assert.equal(sample.policy_version, TELEMETRY_POLICY_VERSION);
});

for (const fixture of fixtures.valid) {
  test("accepted: " + fixture.name, () => {
    assert.equal(validate(fixture.event), true, failures());
  });
}
for (const fixture of fixtures.invalid) {
  test("rejected: " + fixture.name, () => {
    assert.equal(validate(fixture.event), false, fixture.name);
  });
}

for (const key of schema.required) {
  test("required field: " + key, () => {
    const event = { ...sample };
    delete event[key];
    assert.equal(validate(event), false, key);
  });
}

const privateValues = {
  query: "private customer project",
  prompt: "Add icons to my private application",
  project_path: "/home/alex/company",
  filename: "confidential.tsx",
  repository_url: "https://example.com/private/repo",
  source: "private code",
  svg: "<svg>private artwork</svg>",
  dependencies: ["private-package"],
  arguments: { project_path: "/home/alex/company" },
  result: { private: true },
  message: "Failed at /home/alex/company",
  stack: "Error at private-file.ts:10",
  email: "alex@example.com",
  account: "private-account",
  ip_address: "192.0.2.1",
  client_family: "unreviewed-client",
  model: "unreviewed-model",
  collection_id: "fi",
  icon_id: "@fi/fi-calendar",
  installation_id: "private-installation",
  client_id: "123.456",
  user_id: "private-user",
  session_id: "private-session",
  event_id: "private-event",
  plan_id: "private-plan",
  timestamp: "2026-09-28T00:00:00Z",
  attributes: { private: "content" }
};
for (const [field, value] of Object.entries(privateValues)) {
  test("private or deferred field rejected: " + field, () => {
    assert.equal(validate({ ...sample, [field]: value }), false);
  });
}

test("every registered tool is classified without importing or executing the MCP", () => {
  const source = readFileSync(new URL("../src/server.ts", import.meta.url), "utf8");
  const registered = [...source.matchAll(/(?:server\.)?registerTool\(\s*"([^"]+)"/g)].map(
    (match) => match[1]
  );
  assert.deepEqual([...schema.properties.tool.enum].sort(), registered.sort());
  for (const tool of registered) {
    const event = {
      ...sample,
      tool,
      result_count: 0,
      search_source: tool === "search_icons" ? "local" : "not_applicable",
      dry_run: ["plan_icons", "plan_project_upgrade"].includes(tool)
    };
    assert.equal(validate(event), true, tool + ": " + failures());
  }
});

test("current structured error codes are allowed without copying error messages", () => {
  const source = readFileSync(new URL("../src/contracts.ts", import.meta.url), "utf8");
  const codes = [...source.matchAll(/code:\s*"([A-Z_]+)"/g)].map((match) => match[1]);
  for (const code of codes) assert.ok(schema.properties.error_code.enum.includes(code), code);
});

test("all failure codes reject success and require zero observed effects", () => {
  for (const error_code of schema.properties.error_code.enum.filter(Boolean)) {
    assert.equal(
      validate({
        ...sample,
        outcome: "error",
        error_code,
        result_count: 0,
        search_source: "not_applicable"
      }),
      true,
      error_code
    );
    assert.equal(validate({ ...sample, error_code }), false, error_code);
  }
});

test("batch accepts 1 and 16 events and rejects invalid nested content", () => {
  for (const count of [1, 16])
    assert.equal(
      validateBatch({ schema_version: 1, events: Array.from({ length: count }, () => sample) }),
      true
    );
  for (const events of [[], Array(17).fill(sample), [{ ...sample, query: "private" }]])
    assert.equal(validateBatch({ schema_version: 1, events }), false);
  assert.equal(
    validateBatch({ schema_version: 1, events: [sample], client_id: "123.456" }),
    false
  );
  assert.equal(validateBatch({ schema_version: 2, events: [sample] }), false);
  assert.equal(validateBatch({ events: [sample] }), false);
});

test("schema rejects non-finite runtime numbers instead of serializing them", () => {
  for (const duration_ms of [NaN, Infinity, -Infinity])
    assert.equal(validate({ ...sample, duration_ms }), false);
});

for (const fixture of fixtures.consent) {
  test("consent precedence: " + fixture.name, () => {
    const env = Object.freeze({ ...fixture.env });
    assert.deepEqual(resolveTelemetryConsent(env), {
      enabled: fixture.enabled,
      reason: fixture.reason
    });
  });
}
