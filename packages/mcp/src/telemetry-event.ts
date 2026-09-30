import * as z from "zod/v4";

export const telemetryTools = [
  "search_icons",
  "recommend_icons",
  "get_icon",
  "get_icon_svg",
  "compare_icons",
  "get_icon_usage",
  "list_collections",
  "get_collection",
  "inspect_project",
  "doctor",
  "plan_project_upgrade",
  "apply_project_upgrade",
  "init_project",
  "plan_icons",
  "apply_icons",
  "add_icons",
  "remove_icons"
] as const;
export const telemetryErrorCodes = [
  "ICON_AMBIGUOUS",
  "ICON_NOT_FOUND",
  "INVALID_FILTER",
  "DUPLICATE_ICONS",
  "STYLING_SETUP",
  "STALE_PLAN",
  "CATALOG_UPGRADE_INVALID",
  "ICON_REPAIR_UNAVAILABLE",
  "WORKSPACE_BOUNDARY",
  "PROJECT_NOT_INITIALIZED",
  "CATALOG_MISMATCH",
  "PROJECT_INVALID",
  "FILE_CONFLICT",
  "SOURCE_FILE_INVALID",
  "MISSING_CONTEXT",
  "TOOL_FAILED",
  "VERIFICATION_FAILED"
] as const;

const release = z
  .string()
  .min(5)
  .max(20)
  .regex(/^(0|[1-9][0-9]{0,5})\.(0|[1-9][0-9]{0,5})\.(0|[1-9][0-9]{0,5})(?![\s\S])/);
const count = z.number().int().min(0).max(10000);
const eventSchema = z
  .strictObject({
    schema_version: z.literal(1),
    policy_version: z.literal(1),
    event: z.literal("mcp_tool_completed"),
    package_version: release,
    catalog_version: release,
    surface: z.literal("mcp_local"),
    tool: z.enum(telemetryTools),
    outcome: z.enum(["success", "error", "cancelled"]),
    duration_ms: z.number().int().min(0).max(600000).multipleOf(10),
    dry_run: z.boolean(),
    error_code: z.enum(telemetryErrorCodes).nullable(),
    result_count: count,
    icons_added_count: count,
    search_source: z.enum(["algolia", "local", "not_applicable"])
  })
  .refine((event) => {
    if ((event.outcome === "error") !== (event.error_code !== null)) return false;
    const search = event.tool === "search_icons" && event.outcome === "success";
    if (
      search
        ? event.search_source === "not_applicable"
        : event.search_source !== "not_applicable" || event.result_count !== 0
    )
      return false;
    if (
      event.outcome !== "success" &&
      (event.result_count !== 0 || event.icons_added_count !== 0)
    )
      return false;
    if (
      (event.dry_run || !["add_icons", "apply_icons"].includes(event.tool)) &&
      event.icons_added_count !== 0
    )
      return false;
    if (["plan_icons", "plan_project_upgrade"].includes(event.tool) && !event.dry_run)
      return false;
    if (
      ![
        "plan_icons",
        "plan_project_upgrade",
        "apply_icons",
        "apply_project_upgrade",
        "init_project",
        "add_icons",
        "remove_icons"
      ].includes(event.tool) &&
      event.dry_run
    )
      return false;
    return true;
  });

export type TelemetryEvent = z.infer<typeof eventSchema>;
export type TelemetryTool = TelemetryEvent["tool"];

/** Reject the entire event, including unknown keys, against the immutable v1 contract. */
export const isTelemetryEvent = (value: unknown): value is TelemetryEvent =>
  eventSchema.safeParse(value).success;
