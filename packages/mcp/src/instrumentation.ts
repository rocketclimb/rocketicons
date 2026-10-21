import toolkit from "@rocketicons/toolkit";
import { toolError } from "./contracts.js";
import {
  isTelemetryEvent,
  telemetryErrorCodes,
  type TelemetryEvent,
  type TelemetryTool
} from "./telemetry-event.js";
import type { TelemetrySink } from "./telemetry.js";

const { captureIconAdditions } = toolkit;
type Context = { signal?: AbortSignal; mcpReq?: { signal?: AbortSignal } };
type Versions = { packageVersion: string; catalogVersion: string };
const plans = new Set<TelemetryTool>(["plan_icons", "plan_project_upgrade"]);
const mutations = new Set<TelemetryTool>([
  "init_project",
  "add_icons",
  "remove_icons",
  "apply_icons",
  "apply_project_upgrade"
]);
const additions = new Set<TelemetryTool>(["add_icons", "apply_icons"]);
const object = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
const enabled = (sink: TelemetrySink) => {
  try {
    return sink.enabled();
  } catch {
    return false;
  }
};
const cancelled = (error: unknown, context: Context) => {
  const detail = object(error);
  return (
    (context.mcpReq?.signal ?? context.signal)?.aborted === true ||
    detail?.name === "AbortError" ||
    detail?.code === "ABORT_ERR"
  );
};
const errorCode = (value: unknown): NonNullable<TelemetryEvent["error_code"]> =>
  telemetryErrorCodes.includes(value as NonNullable<TelemetryEvent["error_code"]>)
    ? (value as NonNullable<TelemetryEvent["error_code"]>)
    : "TOOL_FAILED";

/** Runs only the outer, SDK-validated tool callback. Delivery is never awaited. */
export const instrumentTool =
  <Input, Result, CallbackContext extends Context>(
    sink: TelemetrySink,
    tool: TelemetryTool,
    versions: Versions,
    callback: (_input: Input, _context: CallbackContext) => Result | Promise<Result>,
    now: () => number = () => performance.now()
  ) =>
  async (input: Input, context: CallbackContext): Promise<Result> => {
    if (!enabled(sink)) return callback(input, context);
    let start: number;
    try {
      start = now();
    } catch {
      return callback(input, context);
    }
    const emit = (response: unknown, iconsAdded: number, failure?: { error: unknown }) => {
      // Every observation and sink call is isolated from the tool's result/exception.
      try {
        if (!enabled(sink)) return;
        const elapsed = now() - start;
        if (!Number.isFinite(elapsed) || elapsed < 0) return;
        const result = object(response);
        const data = object(result?.structuredContent);
        const dryRun =
          plans.has(tool) || (mutations.has(tool) && object(input)?.dry_run === true);
        const verificationFailed =
          mutations.has(tool) && object(data?.verification)?.healthy === false;
        let outcome: TelemetryEvent["outcome"] = "success";
        let code: TelemetryEvent["error_code"] = null;
        if (verificationFailed) {
          outcome = "error";
          code = "VERIFICATION_FAILED";
        } else if (failure || result?.isError === true) {
          if (cancelled(failure?.error, context)) outcome = "cancelled";
          else {
            outcome = "error";
            code = failure
              ? errorCode(toolError(failure.error).code)
              : errorCode(object(data?.error)?.code);
          }
        } else if (!Array.isArray(result?.content)) return;
        const search = outcome === "success" && tool === "search_icons";
        const event = {
          schema_version: 1,
          policy_version: 1,
          event: "mcp_tool_completed",
          package_version: versions.packageVersion,
          catalog_version: versions.catalogVersion,
          surface: "mcp_local",
          tool,
          outcome,
          duration_ms: Math.min(600000, Math.floor(elapsed / 10) * 10),
          dry_run: dryRun,
          error_code: code,
          result_count: search && Array.isArray(data?.results) ? data.results.length : 0,
          icons_added_count:
            outcome === "success" && !dryRun && additions.has(tool) ? iconsAdded : 0,
          search_source: search ? data?.source : "not_applicable"
        };
        if (isTelemetryEvent(event)) sink.record(event);
      } catch {
        // Optional measurement must not affect work or write to the MCP protocol stream.
      }
    };
    try {
      const captured = additions.has(tool)
        ? await captureIconAdditions(() => callback(input, context))
        : { value: await callback(input, context), iconsAdded: 0 };
      emit(captured.value, captured.iconsAdded);
      return captured.value;
    } catch (error) {
      emit(undefined, 0, { error });
      throw error;
    }
  };
