import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import { instrumentTool } from "../dist/instrumentation.js";
import { isTelemetryEvent } from "../dist/telemetry-event.js";
import { recordIconAdditions } from "../../toolkit/dist/mutation-facts.js";

const read = (relative) => JSON.parse(readFileSync(new URL(relative, import.meta.url), "utf8"));
const fixtures = read("./fixtures/telemetry-v1.json");
const schema = read("../contracts/telemetry/v1/event.schema.json");
const validate = new Ajv2020({ strict: true }).compile(schema);
const versions = { packageVersion: "0.3.0", catalogVersion: "0.10.0" };
const result = (data = {}) => ({
  content: [{ type: "text", text: "unchanged" }],
  structuredContent: data
});
const makeSink = () => {
  const events = [];
  return { events, enabled: () => true, record: (event) => events.push(event), close() {} };
};
const run = async (tool, response, input = {}, extra = {}) => {
  const sink = makeSink();
  const callback = instrumentTool(sink, tool, versions, () => response, extra.clock);
  assert.equal(await callback(input, extra.context ?? {}), response);
  assert.equal(sink.events.length, 1);
  assert.equal(validate(sink.events[0]), true, JSON.stringify(validate.errors));
  return sink.events[0];
};

test("runtime validator agrees with immutable v1 fixtures and all required fields", () => {
  for (const fixture of fixtures.valid)
    assert.equal(isTelemetryEvent(fixture.event), true, fixture.name);
  for (const fixture of fixtures.invalid)
    assert.equal(isTelemetryEvent(fixture.event), false, fixture.name);
  for (const key of schema.required) {
    const event = { ...fixtures.valid[0].event };
    delete event[key];
    assert.equal(isTelemetryEvent(event), false, key);
  }
});

test("disabled instrumentation does not inspect input/output, read the clock, or observe mutations", async () => {
  const noRead = new Proxy(
    {},
    {
      get(_target, key) {
        // Promise resolution checks thenables; that is not telemetry inspection.
        if (key === "then") return undefined;
        throw new Error("unexpected telemetry inspection");
      }
    }
  );
  const sink = {
    enabled: () => false,
    record() {
      assert.fail("buffered event while disabled");
    },
    close() {}
  };
  let calls = 0;
  const callback = instrumentTool(
    sink,
    "add_icons",
    versions,
    (input) => {
      calls += 1;
      assert.equal(input, noRead);
      recordIconAdditions(1);
      return noRead;
    },
    () => assert.fail("read clock while disabled")
  );
  assert.equal(await callback(noRead, {}), noRead);
  assert.equal(calls, 1);
});

test("collection discovery and doctor issues remain successful completed calls", async () => {
  for (const tool of ["list_collections", "doctor"]) {
    const event = await run(
      tool,
      result({ healthy: false, issues: ["private path"], collections: [1, 2] })
    );
    assert.equal(event.outcome, "success");
    assert.equal(event.result_count, 0);
    assert.equal(event.icons_added_count, 0);
  }
});

test("search counts only returned results with source, never raw inputs or response content", async () => {
  for (const source of ["algolia", "local"]) {
    const privateObject = {
      query: "secret-query",
      path: "/private/project",
      toJSON() {
        assert.fail("serialized private object");
      }
    };
    const event = await run(
      "search_icons",
      result({ source, results: [privateObject], privateObject }),
      privateObject
    );
    assert.equal(event.result_count, 1);
    assert.equal(event.search_source, source);
    assert.doesNotMatch(JSON.stringify(event), /secret-query|private\/project|privateObject/);
  }
  const recommendation = await run(
    "recommend_icons",
    result({ source: "algolia", results: [1, 2] })
  );
  assert.equal(recommendation.result_count, 0);
  assert.equal(recommendation.search_source, "not_applicable");
});

test("plans always report dry run, reads never do, and mutation input controls preview", async () => {
  for (const tool of ["plan_icons", "plan_project_upgrade"])
    assert.equal((await run(tool, result())).dry_run, true);
  assert.equal((await run("doctor", result(), { dry_run: true })).dry_run, false);
  assert.equal((await run("add_icons", result(), { dry_run: true })).dry_run, true);
  assert.equal((await run("add_icons", result())).dry_run, false);
});

test("one handled failure records only an allowlisted code and clears every count", async () => {
  for (const code of ["ICON_NOT_FOUND", "UNREVIEWED_SECRET_VALUE"]) {
    const response = {
      ...result({ source: "algolia", results: [1], error: { code, message: "private error" } }),
      isError: true
    };
    const event = await run("search_icons", response);
    assert.equal(event.outcome, "error");
    assert.equal(event.error_code, code === "ICON_NOT_FOUND" ? code : "TOOL_FAILED");
    assert.equal(event.result_count, 0);
    assert.equal(event.search_source, "not_applicable");
    assert.doesNotMatch(JSON.stringify(event), /private error|UNREVIEWED/);
  }
});

test("thrown errors are preserved while telemetry maps only their safe category", async () => {
  const sink = makeSink();
  const error = new Error("Unknown icon: confidential-icon");
  const callback = instrumentTool(sink, "get_icon", versions, () => {
    throw error;
  });
  await assert.rejects(callback({}, {}), (caught) => caught === error);
  assert.equal(sink.events.length, 1);
  assert.equal(sink.events[0].error_code, "ICON_NOT_FOUND");
  assert.doesNotMatch(JSON.stringify(sink.events), /confidential-icon/);
});

test("explicit failed mutation verification wins over resolved promise and additions", async () => {
  const sink = makeSink();
  const response = result({
    verification: { healthy: false, issues: ["private verification detail"] }
  });
  const callback = instrumentTool(sink, "apply_icons", versions, () => {
    recordIconAdditions(2);
    return response;
  });
  assert.equal(await callback({}, {}), response);
  assert.equal(sink.events.length, 1);
  assert.equal(sink.events[0].outcome, "error");
  assert.equal(sink.events[0].error_code, "VERIFICATION_FAILED");
  assert.equal(sink.events[0].icons_added_count, 0);
});

test("confirmed additions are isolated per overlapping invocation and excluded for previews", async () => {
  const sink = makeSink();
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  const first = instrumentTool(sink, "add_icons", versions, async () => {
    recordIconAdditions(2);
    await pending;
    recordIconAdditions(1);
    return result();
  })({}, {});
  const other = instrumentTool(sink, "apply_icons", versions, () => {
    recordIconAdditions(4);
    return result({ verification: { healthy: true } });
  });
  await other({}, {});
  assert.equal(sink.events.length, 1, "unsettled work has no event");
  assert.equal(sink.events[0].icons_added_count, 4);
  release();
  await first;
  assert.equal(sink.events[1].icons_added_count, 3);
  await other({ dry_run: true }, {});
  assert.equal(sink.events[2].icons_added_count, 0);
});

test("cancellation emits only on settlement, with success taking precedence", async () => {
  const sink = makeSink();
  const controller = new AbortController();
  let settle;
  const callback = instrumentTool(
    sink,
    "get_icon",
    versions,
    () =>
      new Promise((resolve) => {
        settle = resolve;
      })
  );
  const pending = callback({}, { mcpReq: { signal: controller.signal } });
  controller.abort();
  assert.equal(sink.events.length, 0);
  settle({ ...result({ error: { code: "TOOL_FAILED" } }), isError: true });
  await pending;
  assert.equal(sink.events.length, 1);
  assert.equal(sink.events[0].outcome, "cancelled");
  assert.equal(sink.events[0].error_code, null);
  const completed = await run(
    "get_icon",
    result(),
    {},
    { context: { signal: controller.signal } }
  );
  assert.equal(completed.outcome, "success");
});

test("recognized AbortError preserves exception and yields cancelled", async () => {
  const sink = makeSink();
  const error = new DOMException("private reason", "AbortError");
  const callback = instrumentTool(sink, "get_icon", versions, () => {
    throw error;
  });
  await assert.rejects(callback({}, {}), (caught) => caught === error);
  assert.equal(sink.events[0].outcome, "cancelled");
  assert.equal(sink.events[0].error_code, null);
});

test("clock rounding/cap and invalid measurement or version dropping follow v1", async () => {
  for (const [elapsed, expected] of [
    [19.9, 10],
    [0, 0],
    [999999, 600000]
  ]) {
    let calls = 0;
    const event = await run("get_icon", result(), {}, { clock: () => (calls++ ? elapsed : 0) });
    assert.equal(event.duration_ms, expected);
  }
  for (const elapsed of [-1, Infinity, NaN]) {
    const sink = makeSink();
    let calls = 0;
    await instrumentTool(
      sink,
      "get_icon",
      versions,
      () => result(),
      () => (calls++ ? elapsed : 0)
    )({}, {});
    assert.equal(sink.events.length, 0);
  }
  for (const badVersions of [
    { ...versions, packageVersion: "0.3.0-custom" },
    { ...versions, catalogVersion: "unknown" }
  ]) {
    const sink = makeSink();
    await instrumentTool(sink, "get_icon", badVersions, () => result())({}, {});
    assert.equal(sink.events.length, 0);
  }
});

test("unrepresentable counts are dropped, not clipped", async () => {
  const sink = makeSink();
  await instrumentTool(sink, "search_icons", versions, () =>
    result({ source: "local", results: Array(10001) })
  )({}, {});
  await instrumentTool(sink, "add_icons", versions, () => {
    recordIconAdditions(10001);
    return result();
  })({}, {});
  assert.equal(sink.events.length, 0);
});

test("sink/clock failures and withdrawal cannot change a result or re-run work", async () => {
  for (const failingPart of ["enabled", "record", "clock"]) {
    let calls = 0;
    const response = result();
    const sink = makeSink();
    if (failingPart !== "clock")
      sink[failingPart] = () => {
        throw new Error("telemetry failure");
      };
    const callback = instrumentTool(
      sink,
      "get_icon",
      versions,
      () => {
        calls += 1;
        return response;
      },
      () => {
        if (failingPart === "clock") throw new Error("clock failure");
        return 0;
      }
    );
    assert.equal(await callback({}, {}), response);
    assert.equal(calls, 1);
  }
  const sink = makeSink();
  const callback = instrumentTool(sink, "get_icon", versions, () => {
    sink.enabled = () => false;
    return result();
  });
  await callback({}, {});
  assert.equal(sink.events.length, 0);
});
