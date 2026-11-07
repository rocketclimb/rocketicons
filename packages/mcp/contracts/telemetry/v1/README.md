# Optional MCP telemetry contract v1

Status: the [#273](https://github.com/rocketclimb/rocketicons/issues/273) contract is wired into local MCP callbacks by [#274](https://github.com/rocketclimb/rocketicons/issues/274). The production collector endpoint is intentionally unset, so this build performs no telemetry requests or buffering even with consent. Collector deployment/disclosures and GA4 reporting remain [#275](https://github.com/rocketclimb/rocketicons/issues/275) and [#276](https://github.com/rocketclimb/rocketicons/issues/276).

The user notices are [English](../../../TELEMETRY.md) and [Português brasileiro](../../../TELEMETRY.pt-BR.md). Changes to this policy require updating both notices, fixtures, and the roadmap.

## Schemas and limits

- `event.schema.json` defines one `mcp_tool_completed` event.
- `batch.schema.json` defines a batch of 1–16 events. Ingestion must also enforce a 16 KiB UTF-8 body limit before parsing; JSON Schema cannot enforce encoded body size.
- `example.json` is a synthetic, source-reviewed example of five locally returned search results. It contains no captured developer data.
- `consent.mjs` is a pure reference resolver. It reads only the object passed by its caller and performs no I/O; the runtime calls it before accepting or delivering an event.

Schema identifiers are URNs, not website routes. Both schemas use JSON Schema 2020-12. Validate the entire object and reject unknown fields; do not silently strip them. The envelope has no credentials, identity, timestamps, or custom attributes. Collectors must treat every field, including the claimed policy version, as untrusted.

| Field                                | Meaning                                                                                                                                                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schema_version`, `policy_version`   | Exactly `1`; unsupported values are rejected.                                                                                                                                                                  |
| `event`, `surface`                   | Exactly `mcp_tool_completed`, `mcp_local`. Hosted events need a future contract.                                                                                                                               |
| `package_version`, `catalog_version` | Numeric published release versions from package/catalog metadata. Unknown, custom, or prerelease versions cause the event to be dropped.                                                                       |
| `tool`                               | One of the 17 current registered tools in the schema.                                                                                                                                                          |
| `outcome`                            | `success`, `error`, or `cancelled`, as defined below.                                                                                                                                                          |
| `duration_ms`                        | Monotonic callback elapsed time, rounded down to 10 ms and capped at 600,000 ms. Non-finite/negative measurements are dropped. This is not human engagement; the cap limits average/percentile interpretation. |
| `dry_run`                            | True for preview-only calls, including the two plan tools; false for read tools.                                                                                                                               |
| `error_code`                         | An allowlisted code for errors; null for success/cancellation. Unknown errors map to `TOOL_FAILED`, without their message.                                                                                     |
| `result_count`                       | Returned `search_icons` results on success, otherwise zero. Recommendation/collection/contact-sheet counts are deferred to avoid mixing unlike metrics.                                                        |
| `icons_added_count`                  | Confirmed new icons from successful, non-preview `add_icons` or `apply_icons`; otherwise zero.                                                                                                                 |
| `search_source`                      | `algolia` or `local` for successful `search_icons`; otherwise `not_applicable`.                                                                                                                                |

Counts must be integers from 0 to 10,000. Drop an unrepresentable event rather than clipping its counts. Versions are bounded to three numeric components of up to six digits each. Do not serialize input/output objects to discover these fields; construct the event explicitly.

No client family/model, user/installation/session/event/plan ID, timestamp, collection/icon ID, query, prompt, path, URL, source/SVG content, dependency, stack trace, or free-form string is allowed. Client-family and collection-level metrics are deferred; adding them requires a schema and policy revision.

## Invocation and outcome semantics

A completed invocation is one allowlisted outer MCP tool callback that starts after SDK argument validation and settles with a result or handled exception. Start the timer immediately before that callback. It excludes validation, protocol waiting, and telemetry delivery.

- SDK validation failures, unknown tools, initialize/ping, tool/resource listings, resource reads, and process lifecycle produce no v1 event. They do not contribute to tool failure rate.
- Emit at most one event per settled outer callback. Internal toolkit operations, CLI calls, searches, and project checks do not emit additional events.
- `success`: a usable result without `isError`. A mutation with explicit failed post-apply verification is instead `error` with `VERIFICATION_FAILED`. A completed `doctor` diagnostic is success even if it reports project problems; telemetry does not record those issues.
- `error`: a handled exception/`isError` result or failed mutation verification. No counts or search source are retained, even if partial writes occurred. Never infer success merely because a promise resolved.
- `cancelled`: the callback settles after a recognized cancellation, with no confirmed successful result. All counts are zero. A cancellation notification alone is not completion; abrupt termination/unsettled work produces no event. If the operation completed successfully before cancellation, retain success.
- Dry runs count as completed calls but never additions. Plans always set `dry_run: true`. Repeated idempotent additions are successful calls with zero new additions. No-op upgrades/setup/removal also add zero.
- A new icon was absent from the pre-operation manifest and managed filesystem, then registered and created successfully. Repaired files, restored registered icons, preserved/customized icons, and replacements are excluded. `apply_icons` must also pass its existing post-apply verification. Never use requested IDs or planned file changes as a proxy for successful additions.

“Tool calls” includes diagnostics, plans, and `list_collections`. Dashboards must explicitly filter discovery tools (`search_icons`, `recommend_icons`, `get_icon`, `get_icon_svg`, `compare_icons`, `get_icon_usage`, `get_collection`) and successful applications separately. Do not call all invocations productive use.

## Consent and precedence

The MCP process environment is the sole grant source. A project manifest, remote request, agent prompt, or MCP tool cannot grant it. There is no persistent consent file or installation identity in v1.

Evaluate these rules in order, on startup and before enqueue/send:

1. Active `DO_NOT_TRACK` disables collection. Nonempty values other than case-insensitive `0`/`false` are active.
2. Active `CI` using the same rule, `NODE_ENV=test` (trimmed, case-insensitive), or presence of `NODE_TEST_CONTEXT` disables production telemetry even with opt-in. Use an injected test sink for verification.
3. Only exact `ROCKETICONS_TELEMETRY=on` requests opt-in. Missing, `off`, whitespace, or other values disable it.
4. Only exact `ROCKETICONS_TELEMETRY_POLICY=1` acknowledges this notice, including Cloudflare and conditional Google forwarding.
5. Otherwise collection is enabled for this process.

Example decision: `on` + policy `1` enables; the same environment with `DO_NOT_TRACK=1` disables. Unknown/missing policy disables. A newer policy requires fresh explicit acknowledgement; material field/purpose/recipient/retention changes cannot reuse policy 1.

Never prompt on stdio or log analytics to stdout. No model-facing enable/consent tool. Operators of shared clients must have authority and give users the notice; a setting is not proof of valid consent to the collector.

## Delivery, withdrawal, and retention

These are release requirements for #274–#276, not claims about deployed services:

- Collect only while enabled; default/off paths perform no telemetry network request, identity creation, consent-file write, or buffering.
- Use an in-memory buffer of at most 16 events, maximum age 10 seconds, and one best-effort HTTPS attempt per event/batch. No disk queue, retry, delayed replay, or cross-process state. Collector ingestion time supplies reporting time. Drop failures/expired events; no exactly-once claim or stable deduplication ID.
- Reset/withdrawal means setting `ROCKETICONS_TELEMETRY=off` (or removing both Rocketicons variables), then disconnecting/restarting the MCP process in its client. The client environment is typically fixed at launch. The sender clears unsent memory on disable/shutdown. Already sent events cannot be recalled by this action.
- Cloudflare processes the request for Rocketicons. The edge necessarily receives the connection IP; the application must not retain/forward it, raw bodies, user agents, or identifying headers. Essential platform security logging is separate from product metrics. #275 must disclose actual enabled platform logs and retention before release; no product analytics sink may ingest those logs.
- No first-party raw event persistence. Rocketicons-owned daily aggregate tables/exports, if used, expire within 13 months. Allow only bounded dimensions from this schema; no fingerprints or raw payload archives.
- Optional Google forwarding is covered by the policy-1 notice but stays disabled until #276 verifies an isolated MCP reporting destination, disables advertising/signals and raw exports, configures two-month user/event retention with activity-based reset off, and publishes actual settings. Google's standard aggregated reports are not governed by that two-month setting and may remain longer; never advertise a two-month limit for all Google data.
- The local contract has no GA `client_id`. #276 must resolve the protocol's required identifier without persistent linkage and demonstrate honest count-only reporting. If it cannot do so, keep Google forwarding disabled and use first-party aggregates. New persistent identity needs a new policy/consent.
- No per-installation deletion token exists. Do not promise to identify/remove an individual's contribution from unlinked aggregates; contact repository maintainers for policy concerns. Any provider deletion operation is evaluated separately. Never introduce a tracking identifier solely to support deletion.
- Network/process loss, blocked sends, opted-out clients, and spoofed claims limit the sample. Request limits are not proof that events came from genuine clients.

Runtime/network behavior is tested with injected dependencies and stdio clients in #274. Deployment/log/retention guarantees remain in #275; Google processing and identifier/reporting behavior remains in #276. Tests do not enable production collection.

## Runtime implementation and rollout

The MCP wraps all registered tool callbacks after SDK argument validation. It constructs the allowlisted event directly and validates it again before queueing. Read-only resources, protocol requests, ordinary CLI commands, toolkit calls, and generated icon components do not emit events. A scoped internal mutation counter uses the existing write/manifest results to distinguish new additions from repairs without changing tool responses or adding filesystem scans.

The sender schedules a batch after 100 ms, subject to the 16-event/16 KiB/ten-second limits above. It allows one in-flight HTTPS request, uses a one-second timeout, and drops events on every failed attempt, including DNS errors, HTTP 429/500, and timeout. Timers and sockets do not keep the process alive; shutdown clears pending memory without waiting for delivery. A failed sender cannot change a tool result. No consent file is read or written: v1 settings come only from the launching process environment.

`src/telemetry.ts` deliberately leaves the production endpoint unset. There is no environment variable or MCP tool to override it. Internal dependency injection exercises consent, delivery, clocks, and failures in tests. #275 must supply the fixed reviewed collector endpoint, publish actual platform logs/retention, and verify staging before any enabled release. #276 must verify Google reporting separately; local instrumentation does not establish GA4 correctness.

## Verification and compatibility

Run `npm run test:telemetry-contract --workspace=packages/mcp` after installing repository dependencies. It requires no package/catalog build, network, or production secret. The fixtures cover semantic contradictions, private fields, bounds, error codes, all registered tools, batch limits, and consent precedence.

Schema version 1 is immutable after release. Unknown schema/policy versions fail closed. Adding a tool, recipient, identity, field, or surface requires a versioned change, fixtures, notices, and roadmap update; preserve older files for older clients. Changes to wording that do not change collection can clarify policy 1.

## Primary references

- [GA Measurement Protocol policy](https://developers.google.com/analytics/devguides/collection/protocol/ga4/policy)
- [GA web protocol reference](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?client_type=gtag)
- [Server-only reporting limits](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [Google data retention, including aggregated-report exceptions](https://support.google.com/analytics/answer/7667196?hl=en)
