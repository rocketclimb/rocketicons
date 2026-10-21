import { request as httpsRequest } from "node:https";
import type { ClientRequest } from "node:http";
import { performance } from "node:perf_hooks";

import { resolveTelemetryConsent } from "../contracts/telemetry/v1/consent.mjs";
import { isTelemetryEvent, type TelemetryEvent } from "./telemetry-event.js";

export interface TelemetrySink {
  enabled(): boolean;
  record(_event: TelemetryEvent): void;
  close(): void;
}

interface Timer {
  cancel(): void;
}

export interface TelemetryClock {
  now(): number;
  schedule(_callback: () => void, _delayMs: number): Timer;
}

/** Internal test seams. No MCP argument, project setting, or environment URL sets these. */
export interface TelemetryOptions {
  endpoint?: URL | null;
  environment?: () => Record<string, string | undefined>;
  clock?: TelemetryClock;
  request?: typeof httpsRequest;
}

const MAX_EVENTS = 16;
const MAX_BODY_BYTES = 16 * 1024;
const MAX_AGE_MS = 10_000;
const SEND_DELAY_MS = 100;
const REQUEST_TIMEOUT_MS = 1_000;

// #275 must supply a reviewed collector and publish its actual log/retention settings.
// Until then the production MCP neither buffers events nor creates requests, even opted in.
const PRODUCTION_ENDPOINT: URL | null = null;
const nativeClock: TelemetryClock = {
  now: () => performance.now(),
  schedule(callback, delayMs) {
    const timer = setTimeout(callback, delayMs);
    timer.unref();
    return { cancel: () => clearTimeout(timer) };
  }
};

type QueuedEvent = { event: TelemetryEvent; enqueuedAt: number };
type Attempt = { count: number; request?: ClientRequest; timeout?: Timer };

/** Best-effort, bounded delivery. This object never owns tool results or error messages. */
export function createTelemetry(options: TelemetryOptions = {}): TelemetrySink {
  const clock = options.clock ?? nativeClock;
  const environment = options.environment ?? (() => process.env);
  const request = options.request ?? httpsRequest;
  // Clone the endpoint so later mutation of an injected URL cannot change the recipient.
  const candidate = options.endpoint ?? PRODUCTION_ENDPOINT;
  const endpoint =
    candidate?.protocol === "https:" &&
    !candidate.username &&
    !candidate.password &&
    !candidate.hash &&
    !candidate.search
      ? new URL(candidate.href)
      : null;
  let closed = false;
  let queue: QueuedEvent[] = [];
  let workTimer: Timer | undefined;
  let active: Attempt | undefined;

  const ignoreFailure = (operation: () => void) => {
    try {
      operation();
    } catch {
      // Cleanup and background I/O must never escape into a tool or EventEmitter callback.
    }
  };
  const clear = () => {
    const timer = workTimer;
    const previous = active;
    workTimer = undefined;
    active = undefined;
    queue = [];
    ignoreFailure(() => timer?.cancel());
    ignoreFailure(() => previous?.timeout?.cancel());
    ignoreFailure(() => previous?.request?.destroy());
  };

  const enabled = (): boolean => {
    try {
      // Always consult the shared resolver, including startup and each enqueue/send.
      const allowed = resolveTelemetryConsent(environment()).enabled;
      if (!closed && allowed && endpoint) return true;
    } catch {
      // A failed environment read must never turn telemetry on or affect a tool result.
    }
    clear();
    return false;
  };

  const prune = (now: number) => {
    queue = queue.filter(({ enqueuedAt }) => now >= enqueuedAt && now - enqueuedAt < MAX_AGE_MS);
  };

  const schedule = () => {
    const previous = workTimer;
    workTimer = undefined;
    ignoreFailure(() => previous?.cancel());
    if (!enabled()) return;
    const now = clock.now();
    prune(now);
    if (queue.length === 0) return;
    const untilExpiry = Math.max(0, queue[0].enqueuedAt + MAX_AGE_MS - now);
    workTimer = clock.schedule(
      () => {
        workTimer = undefined;
        try {
          send();
        } catch {
          // Includes failures from the injected transport/clock; no rejected background work.
          clear();
        }
      },
      active ? untilExpiry : Math.min(SEND_DELAY_MS, untilExpiry)
    );
  };

  const send = () => {
    if (!enabled() || !endpoint) return;
    const now = clock.now();
    prune(now);
    if (active || queue.length === 0) {
      schedule();
      return;
    }
    const batch = queue;
    queue = [];
    const body = JSON.stringify({ schema_version: 1, events: batch.map(({ event }) => event) });
    if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) return;
    // The in-flight batch counts toward the same 16-event memory budget as queued events.
    const attempt: Attempt = { count: batch.length };
    active = attempt;
    const finish = () => {
      if (active !== attempt) return;
      active = undefined;
      ignoreFailure(() => attempt.timeout?.cancel());
      ignoreFailure(() => attempt.request?.destroy());
      try {
        schedule();
      } catch {
        clear();
      }
    };
    const remainingAge = Math.max(0, batch[0].enqueuedAt + MAX_AGE_MS - now);
    attempt.timeout = clock.schedule(finish, Math.min(REQUEST_TIMEOUT_MS, remainingAge));
    try {
      attempt.request = request(
        endpoint,
        {
          method: "POST",
          agent: false,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body, "utf8")
          }
        },
        (response) => {
          // Do not consume or log collector bodies. Every HTTP status ends the only attempt.
          ignoreFailure(() => response.on("error", finish));
          ignoreFailure(() => response.destroy());
          finish();
        }
      );
      attempt.request.on("socket", (socket) => {
        try {
          socket.unref();
        } catch {
          finish();
        }
      });
      attempt.request.on("error", finish);
      attempt.request.on("close", finish);
      // Recheck immediately before bytes leave the process.
      if (!enabled()) return;
      attempt.request.end(body);
    } catch {
      finish();
    }
  };

  // Resolve once at construction; no queue or timer exists for the default/off path.
  enabled();
  return {
    enabled,
    record(event) {
      try {
        if (!enabled() || !isTelemetryEvent(event)) return;
        const now = clock.now();
        if (!Number.isFinite(now)) return;
        prune(now);
        if (queue.length + (active?.count ?? 0) >= MAX_EVENTS) return;
        // Keep a private snapshot: callers cannot mutate a queued event after validation.
        const snapshot: TelemetryEvent = { ...event };
        if (!isTelemetryEvent(snapshot)) return;
        queue.push({ event: snapshot, enqueuedAt: now });
        schedule();
      } catch {
        clear();
      }
    },
    close() {
      closed = true;
      clear();
    }
  };
}
