export const TELEMETRY_POLICY_VERSION = 1;

// A pure reference resolver for the v1 contract. The MCP does not call it yet.
// Pass the MCP process environment explicitly; project files cannot grant consent.
export const resolveTelemetryConsent = (env = {}) => {
  const signal = (value) =>
    typeof value === "string" &&
    value.trim() !== "" &&
    !["0", "false"].includes(value.trim().toLowerCase());

  if (signal(env.DO_NOT_TRACK)) return { enabled: false, reason: "do_not_track" };
  if (
    signal(env.CI) ||
    (typeof env.NODE_ENV === "string" && env.NODE_ENV.trim().toLowerCase() === "test") ||
    env.NODE_TEST_CONTEXT !== undefined
  )
    return { enabled: false, reason: "automated_environment" };
  if (env.ROCKETICONS_TELEMETRY !== "on") return { enabled: false, reason: "not_enabled" };
  if (env.ROCKETICONS_TELEMETRY_POLICY !== String(TELEMETRY_POLICY_VERSION))
    return { enabled: false, reason: "policy_not_accepted" };
  return { enabled: true, reason: "explicit_opt_in" };
};
