# Optional MCP usage measurement — policy 1

**Current status: this is a contract for a future release. The current MCP does not send these events, and the settings below do not activate a sender yet.** See [#273](https://github.com/rocketclimb/rocketicons/issues/273). The technical contract and example are in [contracts/telemetry/v1](contracts/telemetry/v1/README.md). [Português brasileiro](TELEMETRY.pt-BR.md).

## Purpose and choice

The planned feature measures completed MCP tool calls, failures, search fallback, and confirmed new icon additions to improve the free, open-source Rocketicons system. Participation is optional and off by default. Icon discovery and project operations must keep working with telemetry disabled, blocked, or unavailable.

It does not measure every Rocketicons user or use of icons inside applications. It creates no persistent user, installation, or session identity. Unique installation counts and website visitor linking are deferred.

## Data in a future enabled release

An event contains schema/policy version, numeric package/catalog release versions, the local MCP surface, allowlisted tool name, success/error/cancelled outcome, execution duration rounded to 10 ms and capped at ten minutes, a dry-run flag, an enumerated error code or null, search result count/source, and confirmed new icon count. [View the sample payload](contracts/telemetry/v1/example.json).

No query, prompt, project path, filename, repository URL, code/SVG, dependency list, tool arguments/results, error message/stack trace, account/email, client/model name, or icon/collection identifier is sent. Unknown fields are rejected.

Plans and dry runs add zero icons; repeated additions and repairs add zero new icons. Failed or unconfirmed mutations add zero. Protocol/lifecycle/resource requests and SDK argument-validation failures are excluded. Counts describe participating tool calls, not people; offline/blocked sends may be lost.

## Controls reserved for the upcoming implementation

Set these in the MCP client's process environment only after reading this notice:

```json
{
  "ROCKETICONS_TELEMETRY": "on",
  "ROCKETICONS_TELEMETRY_POLICY": "1"
}
```

Both exact values are required. Missing/invalid values disable collection. `ROCKETICONS_TELEMETRY=off` disables it. Active `DO_NOT_TRACK` overrides opt-in. CI and test processes suppress production telemetry even when opted in. No agent tool or project file can grant consent.

To withdraw/reset, set `off` or remove both Rocketicons variables, then disconnect/restart the MCP in your client. The upcoming implementation must clear unsent memory; it has no disk queue or identifier to reset. This does not delete previously sent data. A changed policy needs a new acknowledgement. Shared-client operators must provide this notice and have authority to enable collection.

## Recipients and retention requirements

Rocketicons' collector would run on Cloudflare. If enabled and verified later, Google Analytics would receive the same allowlisted measurements for MCP reporting. Policy 1 covers these recipients; Google forwarding remains disabled until its reporting and privacy settings are verified.

The HTTP edge sees your connection IP. Application telemetry must not retain or forward IPs, user agents, identifying headers, or raw bodies. Essential platform security logs are separate; their actual settings/retention must be published before collection ships.

Unsent events exist in memory for at most ten seconds, up to 16 events, with one delivery attempt and no retry/offline replay. First-party raw events are not stored; any Rocketicons-owned daily aggregate records expire within 13 months.

Future MCP-specific GA reporting requires two-month user/event retention, reset-on-activity off, and advertising/signals/raw exports disabled. Google's standard aggregated reports can remain longer; the two-month setting does not cover them. See [Google's retention explanation](https://support.google.com/analytics/answer/7667196?hl=en).

There is no identity linking your events to a website visitor or browser cookie. Google requires a protocol identifier; implementation must prove count-only reporting without persistent linkage, or keep forwarding disabled. Already aggregated contributions cannot be located reliably for individual deletion. Contact the [repository maintainers](https://github.com/rocketclimb/rocketicons/issues) with policy concerns.

Existing website GA4 and optional Algolia search requests are separate features. Disabling MCP telemetry does not turn an online search into an offline search.

## Release gate

[#274](https://github.com/rocketclimb/rocketicons/issues/274) implements the controls/sender, [#275](https://github.com/rocketclimb/rocketicons/issues/275) implements the collector, and [#276](https://github.com/rocketclimb/rocketicons/issues/276) verifies reporting. These requirements must be met and the notice updated with actual deployment details before an enabled release.
