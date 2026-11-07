import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { EventEmitter, once } from "node:events";
import { readFileSync } from "node:fs";
import { createServer } from "node:net";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import { createTelemetry } from "../dist/telemetry.js";

const sample = JSON.parse(
  readFileSync(new URL("../contracts/telemetry/v1/example.json", import.meta.url), "utf8")
);
const consent = () => ({ ROCKETICONS_TELEMETRY: "on", ROCKETICONS_TELEMETRY_POLICY: "1" });
const endpoint = () => new URL("https://collector.example.test/mcp");
const ajv = new Ajv2020({ strict: true });
ajv.addSchema(
  JSON.parse(
    readFileSync(new URL("../contracts/telemetry/v1/event.schema.json", import.meta.url))
  )
);
const validateBatch = ajv.compile(
  JSON.parse(
    readFileSync(new URL("../contracts/telemetry/v1/batch.schema.json", import.meta.url))
  )
);

function fakeClock() {
  let now = 0;
  const tasks = new Set();
  const run = (target, chronological) => {
    for (;;) {
      const next = [...tasks].filter((task) => task.at <= target).sort((a, b) => a.at - b.at)[0];
      if (!next) break;
      tasks.delete(next);
      if (chronological) now = next.at;
      next.callback();
    }
    now = target;
  };
  return {
    now: () => now,
    schedule(callback, delay) {
      const task = { at: now + delay, callback };
      tasks.add(task);
      return { cancel: () => tasks.delete(task) };
    },
    advance(ms) {
      run(now + ms, true);
    },
    elapseWithoutCallbacks(ms) {
      now += ms;
    },
    runDue() {
      run(now, false);
    },
    pending: () => tasks.size
  };
}

function transport() {
  const requests = [];
  return {
    requests,
    request(url, options, onResponse) {
      const req = new EventEmitter();
      Object.assign(req, {
        url,
        options,
        body: undefined,
        destroyed: false,
        socketUnrefs: 0,
        end(body) {
          req.body = body;
          req.emit("socket", { unref: () => req.socketUnrefs++ });
        },
        destroy() {
          req.destroyed = true;
          req.emit("close");
        },
        respond(statusCode) {
          const response = new EventEmitter();
          response.statusCode = statusCode;
          response.destroy = () => {
            response.destroyed = true;
          };
          onResponse(response);
          return response;
        }
      });
      requests.push(req);
      return req;
    }
  };
}

function harness(overrides = {}) {
  const env = consent();
  const clock = fakeClock();
  const wire = transport();
  const sink = createTelemetry({
    endpoint: endpoint(),
    environment: () => env,
    clock,
    request: wire.request,
    ...overrides
  });
  return { env, clock, ...wire, sink };
}

test("the release without a collector does not buffer or request, even explicitly opted in", () => {
  const clock = fakeClock();
  const wire = transport();
  const sink = createTelemetry({
    environment: () => ({ ...consent(), ROCKETICONS_TELEMETRY_ENDPOINT: endpoint().href }),
    clock,
    request: wire.request
  });
  assert.equal(sink.enabled(), false);
  for (let i = 0; i < 100; i++) sink.record(sample);
  assert.equal(clock.pending(), 0);
  clock.advance(20_000);
  assert.equal(wire.requests.length, 0);
  sink.close();
});

for (const [name, env] of [
  ["default", {}],
  ["off", { ...consent(), ROCKETICONS_TELEMETRY: "off" }],
  ["unacknowledged policy", { ROCKETICONS_TELEMETRY: "on" }],
  ["unknown policy", { ...consent(), ROCKETICONS_TELEMETRY_POLICY: "2" }],
  ["DO_NOT_TRACK", { ...consent(), DO_NOT_TRACK: "1" }],
  ["CI", { ...consent(), CI: "true" }],
  ["NODE_ENV", { ...consent(), NODE_ENV: "test" }],
  ["Node test runner", { ...consent(), NODE_TEST_CONTEXT: "child-v8" }]
]) {
  test(`real consent resolver prevents buffering and requests: ${name}`, () => {
    const { sink, clock, requests } = harness({ environment: () => env });
    assert.equal(sink.enabled(), false);
    sink.record(sample);
    assert.equal(clock.pending(), 0);
    clock.advance(20_000);
    assert.equal(requests.length, 0);
  });
}

test("an opted-in injected collector receives only a schema-valid, identity-free HTTPS batch", () => {
  const { sink, clock, requests } = harness();
  const mutable = { ...sample };
  assert.equal(sink.enabled(), true);
  sink.record(mutable);
  mutable.result_count = 123;
  sink.record({ ...sample, prompt: "private project prompt" });
  sink.record({ ...sample, package_version: "private".repeat(5_000) });
  clock.advance(100);
  assert.equal(requests.length, 1);
  const [req] = requests;
  assert.equal(req.url.href, endpoint().href);
  assert.equal(req.options.method, "POST");
  assert.equal(req.options.agent, false);
  assert.deepEqual(Object.keys(req.options.headers).sort(), ["Content-Length", "Content-Type"]);
  assert.equal(req.options.headers["Content-Length"], Buffer.byteLength(req.body));
  assert.ok(Buffer.byteLength(req.body) <= 16 * 1024);
  const batch = JSON.parse(req.body);
  assert.equal(validateBatch(batch), true, JSON.stringify(validateBatch.errors));
  assert.deepEqual(batch, { schema_version: 1, events: [sample] });
  assert.equal(req.socketUnrefs, 1);
  sink.close();
});

test("the 16-event limit includes a request in flight and drops overflow without replay", () => {
  const { sink, clock, requests } = harness();
  sink.record(sample);
  clock.advance(100);
  for (let i = 0; i < 100; i++) sink.record(sample);
  assert.equal(requests.length, 1);
  requests[0].respond(204);
  clock.advance(100);
  assert.equal(requests.length, 2);
  assert.equal(JSON.parse(requests[1].body).events.length, 15);
  requests[1].respond(204);
  clock.advance(20_000);
  assert.equal(requests.length, 2);
  assert.equal(clock.pending(), 0);
});

test("a full batch stays within both count and UTF-8 body limits", () => {
  const { sink, clock, requests } = harness();
  for (let i = 0; i < 17; i++) sink.record(sample);
  clock.advance(100);
  assert.equal(JSON.parse(requests[0].body).events.length, 16);
  assert.ok(Buffer.byteLength(requests[0].body) <= 16 * 1024);
  requests[0].respond(200);
  clock.advance(20_000);
  assert.equal(requests.length, 1);
});

test("expired events are discarded after a blocked event loop rather than sent late", () => {
  const { sink, clock, requests } = harness();
  sink.record(sample);
  clock.elapseWithoutCallbacks(10_000);
  clock.runDue();
  assert.equal(requests.length, 0);
  assert.equal(clock.pending(), 0);
});

test("an event dispatched near expiry gets only its remaining lifetime", () => {
  const { sink, clock, requests } = harness();
  sink.record(sample);
  clock.elapseWithoutCallbacks(9_950);
  clock.runDue();
  assert.equal(requests.length, 1);
  clock.advance(49);
  assert.equal(requests[0].destroyed, false);
  clock.advance(1);
  assert.equal(requests[0].destroyed, true);
  assert.equal(clock.pending(), 0);
});

test("withdrawal before delivery discards the queue without replay on re-enable", () => {
  const { sink, clock, requests, env } = harness();
  sink.record(sample);
  env.DO_NOT_TRACK = "1";
  clock.advance(100);
  delete env.DO_NOT_TRACK;
  assert.equal(sink.enabled(), true);
  clock.advance(20_000);
  assert.equal(requests.length, 0);
});

test("withdrawal aborts in-flight work and clears waiting events", () => {
  const { sink, clock, requests, env } = harness();
  sink.record(sample);
  clock.advance(100);
  sink.record(sample);
  env.ROCKETICONS_TELEMETRY = "off";
  assert.equal(sink.enabled(), false);
  assert.equal(requests[0].destroyed, true);
  assert.equal(clock.pending(), 0);
  env.ROCKETICONS_TELEMETRY = "on";
  assert.equal(sink.enabled(), true);
  clock.advance(20_000);
  assert.equal(requests.length, 1);
});

test("consent is rechecked after transport creation and before sending the body", () => {
  const env = consent();
  const clock = fakeClock();
  const wire = transport();
  const sink = createTelemetry({
    environment: () => env,
    endpoint: endpoint(),
    clock,
    request(...args) {
      const req = wire.request(...args);
      env.CI = "1";
      return req;
    }
  });
  sink.record(sample);
  clock.advance(100);
  assert.equal(wire.requests.length, 1);
  assert.equal(wire.requests[0].body, undefined);
  assert.equal(wire.requests[0].destroyed, true);
  assert.equal(clock.pending(), 0);
});

for (const status of [200, 204, 400, 429, 503]) {
  test(`HTTP ${status} ends the only attempt without retaining response data`, () => {
    const { sink, clock, requests } = harness();
    sink.record(sample);
    clock.advance(100);
    const response = requests[0].respond(status);
    assert.equal(response.destroyed, true);
    assert.equal(requests[0].destroyed, true);
    clock.advance(20_000);
    assert.equal(requests.length, 1);
    assert.equal(clock.pending(), 0);
  });
}

for (const code of ["ENOTFOUND", "ECONNREFUSED", "CERT_HAS_EXPIRED"]) {
  test(`${code} is contained without retry or free-form diagnostics`, () => {
    const { sink, clock, requests } = harness();
    sink.record(sample);
    clock.advance(100);
    const error = Object.assign(new Error("private transport detail"), { code });
    assert.doesNotThrow(() => requests[0].emit("error", error));
    assert.equal(requests[0].destroyed, true);
    clock.advance(20_000);
    assert.equal(requests.length, 1);
    assert.equal(clock.pending(), 0);
  });
}

test("a hung connection is aborted within one second without retry", () => {
  const { sink, clock, requests } = harness();
  sink.record(sample);
  clock.advance(100);
  clock.advance(999);
  assert.equal(requests[0].destroyed, false);
  clock.advance(1);
  assert.equal(requests[0].destroyed, true);
  clock.advance(20_000);
  assert.equal(requests.length, 1);
  assert.equal(clock.pending(), 0);
});

test("a synchronous network failure cannot escape a tool callback", () => {
  let attempts = 0;
  const { sink, clock } = harness({
    request() {
      attempts++;
      throw new Error("private network configuration");
    }
  });
  assert.doesNotThrow(() => sink.record(sample));
  assert.doesNotThrow(() => clock.advance(20_000));
  assert.equal(attempts, 1);
  assert.equal(clock.pending(), 0);
});

test("close aborts and forgets pending work permanently and is idempotent", () => {
  const { sink, clock, requests } = harness();
  sink.record(sample);
  clock.advance(100);
  sink.record(sample);
  sink.close();
  sink.close();
  assert.equal(requests[0].destroyed, true);
  assert.equal(sink.enabled(), false);
  sink.record(sample);
  clock.advance(20_000);
  assert.equal(requests.length, 1);
  assert.equal(clock.pending(), 0);
});

for (const url of [
  "http://collector.example.test/mcp",
  "https://user:secret@collector.example.test/mcp",
  "https://collector.example.test/mcp?token=secret",
  "https://collector.example.test/mcp#fragment"
]) {
  test(`an unsafe injected recipient fails closed: ${new URL(url).protocol} ${new URL(url).pathname}`, () => {
    const { sink, clock, requests } = harness({ endpoint: new URL(url) });
    assert.equal(sink.enabled(), false);
    sink.record(sample);
    assert.equal(clock.pending(), 0);
    assert.equal(requests.length, 0);
  });
}

test("mutating an injected URL cannot redirect a queued batch", () => {
  const recipient = endpoint();
  const { sink, clock, requests } = harness({ endpoint: recipient });
  sink.record(sample);
  recipient.hostname = "unreviewed.example.test";
  clock.advance(100);
  assert.equal(requests[0].url.href, endpoint().href);
  sink.close();
});

test("native timers and a stalled HTTPS socket do not keep a child MCP process alive", async (t) => {
  const connections = new Set();
  let accepted = false;
  const server = createServer((socket) => {
    accepted = true;
    connections.add(socket);
    socket.on("close", () => connections.delete(socket));
    // Accept TCP but never finish TLS, exercising a real pending HTTPS connection.
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = server.address().port;
  const runtimeUrl = new URL("../dist/telemetry.js", import.meta.url).href;
  const source = `
    import { createTelemetry } from ${JSON.stringify(runtimeUrl)};
    const sink = createTelemetry({
      endpoint: new URL("https://127.0.0.1:${port}/mcp"),
      environment: () => (${JSON.stringify(consent())})
    });
    sink.record(${JSON.stringify(sample)});
    setTimeout(() => process.stdout.write("work-finished\\n"), 250);
  `;
  const child = spawn(process.execPath, ["--input-type=module", "-e", source], {
    stdio: ["ignore", "pipe", "pipe"]
  });
  const guard = setTimeout(() => child.kill("SIGKILL"), 5_000);
  t.after(() => {
    clearTimeout(guard);
    child.kill();
    for (const socket of connections) socket.destroy();
    server.close();
  });
  let markerAt;
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    if (String(chunk).includes("work-finished")) markerAt = performance.now();
  });
  child.stderr.on("data", (chunk) => (stderr += chunk));
  const [code, signal] = await once(child, "exit");
  assert.equal(code, 0, `child exit ${signal}: ${stderr}`);
  assert.ok(accepted, "a real socket reached the local stalled collector");
  assert.ok(markerAt !== undefined, "child finished its normal work");
  assert.ok(performance.now() - markerAt < 500, "telemetry did not hold exit until its timeout");
});

test("failed cleanup dependencies cannot escape public or asynchronous callbacks", () => {
  const { sink, clock, requests } = harness();
  sink.record(sample);
  clock.advance(100);
  const req = requests[0];
  req.destroy = () => {
    throw new Error("broken injected destroy");
  };
  clock.schedule = () => {
    throw new Error("broken injected scheduler");
  };
  // A queued event makes completion try the failed scheduler.
  assert.doesNotThrow(() => sink.record(sample));
  assert.doesNotThrow(() => req.emit("error", new Error("private error")));
  assert.doesNotThrow(() => sink.close());
  assert.equal(sink.enabled(), false);
});

test("an asynchronous completion contains scheduler errors with queued events", () => {
  const { sink, clock, requests } = harness();
  sink.record(sample);
  clock.advance(100);
  sink.record(sample);
  clock.schedule = () => {
    throw new Error("broken injected scheduler");
  };
  assert.doesNotThrow(() => requests[0].emit("error", new Error("private error")));
  assert.equal(requests[0].destroyed, true);
  assert.equal(clock.pending(), 0);
});

test("timer cancellation failures and environment read failures fail closed", () => {
  const clock = fakeClock();
  const originalSchedule = clock.schedule;
  clock.schedule = (...args) => {
    const timer = originalSchedule(...args);
    return {
      cancel() {
        timer.cancel();
        throw new Error("broken injected timer cleanup");
      }
    };
  };
  let failEnvironment = false;
  const { sink, requests } = harness({
    clock,
    environment() {
      if (failEnvironment) throw new Error("private environment failure");
      return consent();
    }
  });
  sink.record(sample);
  clock.advance(100);
  failEnvironment = true;
  assert.equal(sink.enabled(), false);
  assert.equal(requests[0].destroyed, true);
  assert.equal(clock.pending(), 0);
  assert.doesNotThrow(() => sink.close());
});
