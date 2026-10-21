export const TELEMETRY_POLICY_VERSION: 1;
export function resolveTelemetryConsent(env?: Record<string, string | undefined>): {
  enabled: boolean;
  reason:
    | "do_not_track"
    | "automated_environment"
    | "not_enabled"
    | "policy_not_accepted"
    | "explicit_opt_in";
};
