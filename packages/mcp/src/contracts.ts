import * as z from "zod/v4";

const icon = z.looseObject({
  id: z.string(),
  name: z.string(),
  component: z.string(),
  collection: z.string(),
  collectionName: z.string(),
  variant: z.string(),
  license: z.string(),
  licenseUrl: z.string(),
  svgResource: z.string(),
  description: z.looseObject({ en: z.string(), "pt-BR": z.string() }).optional()
});
const searchResult = icon.extend({ matchReason: z.string() });
const change = z.looseObject({ path: z.string(), action: z.string() });
const fileChange = change.extend({
  beforeSha256: z.string().nullable(),
  afterSha256: z.string(),
  afterBytes: z.number().int()
});
const project = z.looseObject({
  projectPath: z.string(),
  initialized: z.boolean(),
  manifest: z
    .looseObject({
      schemaVersion: z.literal(1),
      catalogVersion: z.string(),
      target: z.enum(["react", "react-native"]),
      language: z.enum(["ts", "js"]),
      outputPath: z.literal("src/ri"),
      stylesheetPath: z.string().optional(),
      icons: z.record(
        z.string(),
        z.looseObject({
          component: z.string(),
          path: z.string(),
          sha256: z.string(),
          hashAlgorithm: z.literal("tokens-v1").optional(),
          collection: z.string(),
          licenseUrl: z.string()
        })
      )
    })
    .optional(),
  installedIconStatus: z.record(z.string(), z.enum(["current", "missing", "customized"])),
  detectedTarget: z.enum(["react", "react-native"]),
  detectedLanguage: z.enum(["ts", "js"]),
  packageManager: z.string()
});
const mutation = z.looseObject({
  projectPath: z.string(),
  dryRun: z.boolean(),
  changes: z.array(change),
  summary: z.string(),
  preservedIcons: z
    .array(
      z.looseObject({
        id: z.string(),
        path: z.string(),
        status: z.enum(["current", "customized"])
      })
    )
    .optional()
});
const plan = z.looseObject({
  projectPath: z.string(),
  catalogVersion: z.string(),
  iconIds: z.array(z.string()),
  target: z.enum(["react", "react-native"]),
  language: z.enum(["ts", "js"]),
  packageManager: z.string(),
  fromFile: z.string(),
  stylesheetPath: z.string().nullable(),
  initialized: z.boolean(),
  packageJsonSha256: z.string(),
  dependencies: z.array(z.string()),
  toInstall: z.array(z.string()),
  dependencyEffects: z
    .looseObject({
      command: z.array(z.string()),
      mayWritePaths: z.array(z.string()),
      beforeSha256: z.record(z.string(), z.string().nullable())
    })
    .nullable(),
  fileChanges: z.array(fileChange),
  preservedIcons: z.array(
    z.looseObject({
      id: z.string(),
      path: z.string(),
      status: z.enum(["current", "customized"]),
      beforeSha256: z.string()
    })
  ),
  imports: z.array(
    z.looseObject({
      id: z.string(),
      component: z.string(),
      generatedPath: z.string(),
      importStatement: z.string(),
      example: z.string()
    })
  ),
  planId: z.string(),
  summary: z.string()
});

export const outputs = {
  search_icons: z.looseObject({
    source: z.enum(["algolia", "local"]),
    catalogVersion: z.string(),
    results: z.array(searchResult)
  }),
  recommend_icons: z.looseObject({
    summary: z.string(),
    projectPath: z.string(),
    intent: z.string(),
    initialized: z.boolean(),
    target: z.enum(["react", "react-native"]),
    language: z.enum(["ts", "js"]),
    fromFile: z.string().nullable(),
    installedIconCount: z.number().int(),
    managedIconCount: z.number().int(),
    installedCollections: z.array(
      z.looseObject({ id: z.string(), name: z.string(), count: z.number().int() })
    ),
    searchedCollections: z.array(z.string()),
    usedGlobalFallback: z.boolean(),
    searchSource: z.enum(["algolia", "local"]),
    results: z.array(
      searchResult.extend({
        installed: z.boolean(),
        installedStatus: z.enum(["current", "missing", "customized"]).nullable(),
        action: z.enum(["reuse", "repair", "add"]),
        recommendationReason: z.string(),
        usage: z.looseObject({
          web: z.looseObject({
            generatedPath: z.string(),
            importStatement: z.string().nullable(),
            importHint: z.string().nullable(),
            example: z.string()
          }),
          reactNative: z.looseObject({
            generatedPath: z.string(),
            importStatement: z.string().nullable(),
            importHint: z.string().nullable(),
            example: z.string()
          })
        })
      })
    )
  }),
  get_icon: icon,
  get_icon_svg: icon.extend({
    mimeType: z.literal("image/svg+xml"),
    source: z.literal("local"),
    svg: z.string()
  }),
  compare_icons: z.looseObject({
    source: z.literal("local"),
    width: z.number().int(),
    height: z.number().int(),
    columns: z.number().int(),
    rows: z.number().int(),
    icons: z.array(icon.extend({ row: z.number().int(), column: z.number().int() }))
  }),
  get_icon_usage: icon.extend({
    target: z.enum(["react", "react-native"]),
    language: z.enum(["ts", "js"]),
    generatedPath: z.string(),
    fromFile: z.string().nullable(),
    importStatement: z.string().nullable(),
    importHint: z.string().nullable(),
    example: z.string()
  }),
  list_collections: z.looseObject({
    catalogVersion: z.string(),
    collections: z.array(
      z.looseObject({
        id: z.string(),
        name: z.string(),
        license: z.string(),
        licenseUrl: z.string(),
        projectUrl: z.string(),
        indexUrl: z.string(),
        totalIcons: z.number().int()
      })
    )
  }),
  get_collection: z.looseObject({
    id: z.string(),
    name: z.string(),
    license: z.string(),
    licenseUrl: z.string(),
    projectUrl: z.string(),
    indexUrl: z.string(),
    totalIcons: z.number().int(),
    resource: z.string()
  }),
  inspect_project: project,
  doctor: project.extend({
    healthy: z.boolean(),
    issues: z.array(z.string()),
    customizedIcons: z.array(z.string()),
    styling: z
      .looseObject({
        tailwindMajor: z.number().nullable(),
        stylesheetPath: z.string().nullable(),
        pluginRegistered: z.boolean(),
        stylesheetLoaded: z.boolean(),
        buildIntegration: z.string().nullable()
      })
      .nullable()
  }),
  init_project: mutation,
  plan_icons: plan,
  apply_icons: plan.extend({
    dryRun: z.boolean(),
    verification: z
      .looseObject({ healthy: z.boolean(), issues: z.array(z.string()) })
      .nullable()
      .optional(),
    appliedFileChanges: z.array(change).optional()
  }),
  add_icons: mutation,
  remove_icons: mutation
} as const;

export type ToolError = {
  code: string;
  message: string;
  nextStep: string;
};

export const toolError = (error: unknown): ToolError => {
  const message = error instanceof Error ? error.message : String(error);
  if (/Ambiguous icon/.test(message))
    return {
      code: "ICON_AMBIGUOUS",
      message,
      nextStep: "Use one of the exact @collection/icon IDs listed in the error."
    };
  if (/Unknown icon:/.test(message))
    return {
      code: "ICON_NOT_FOUND",
      message,
      nextStep: "Call search_icons, then use an exact @collection/icon ID."
    };
  if (/Unknown collection:|Invalid variant:/.test(message))
    return {
      code: "INVALID_FILTER",
      message,
      nextStep: "Call list_collections and use a returned collection ID or a valid variant."
    };
  if (/duplicate icon IDs/.test(message))
    return {
      code: "DUPLICATE_ICONS",
      message,
      nextStep: "Pass each exact icon ID only once to compare_icons."
    };
  if (
    /Tailwind stylesheet|No Tailwind stylesheet|Multiple Tailwind stylesheets|stylesheet_path/.test(
      message
    )
  )
    return {
      code: "STYLING_SETUP",
      message,
      nextStep:
        "Run doctor to inspect web styling. If multiple Tailwind stylesheets exist, pass stylesheet_path to init_project or to both plan_icons and apply_icons."
    };
  if (/Plan is stale/.test(message))
    return {
      code: "STALE_PLAN",
      message,
      nextStep: "Call plan_icons again with the current project state, then apply its new planId."
    };
  if (/Dependency installation may write outside project_path in parent workspace/.test(message))
    return {
      code: "WORKSPACE_BOUNDARY",
      message,
      nextStep:
        "Install the required dependencies with the parent workspace package manager, then retry with the same project_path."
    };
  if (/Project is not initialized/.test(message))
    return {
      code: "PROJECT_NOT_INITIALIZED",
      message,
      nextStep: "Call init_project, or use plan_icons then apply_icons to set up and add icons."
    };
  if (/catalog version differs|Project catalog/.test(message))
    return {
      code: "CATALOG_MISMATCH",
      message,
      nextStep: "Use a Rocketicons MCP package compatible with the project's catalog version."
    };
  if (
    /not initialized|No package.json|project_path must|ENOENT|symlink|Path escapes project/.test(
      message
    )
  )
    return {
      code: "PROJECT_INVALID",
      message,
      nextStep:
        "Check the absolute project_path and run inspect_project or init_project as appropriate."
    };
  if (/edited file|modified|unmanaged|conflicts/.test(message))
    return {
      code: "FILE_CONFLICT",
      message,
      nextStep: "Inspect the named file and run doctor; resolve the conflict before retrying."
    };
  if (/from_file|source file/.test(message))
    return {
      code: "SOURCE_FILE_INVALID",
      message,
      nextStep: "Pass an existing JavaScript or TypeScript source file inside project_path."
    };
  if (/target is required|Provide project_path/.test(message))
    return {
      code: "MISSING_CONTEXT",
      message,
      nextStep: "Provide target, or provide project_path and from_file together."
    };
  return {
    code: "TOOL_FAILED",
    message,
    nextStep: "Review the error and project state, then retry with corrected inputs."
  };
};

export const errorResult = (error: unknown) => {
  const detail = toolError(error);
  return {
    isError: true as const,
    content: [
      {
        type: "text" as const,
        text: `${detail.code}: ${detail.message}\nNext: ${detail.nextStep}`
      }
    ],
    structuredContent: { error: detail }
  };
};
