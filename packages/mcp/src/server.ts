import { McpServer, ResourceTemplate } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import toolkit from "@rocketicons/toolkit";
import utils from "@rocketicons/utils";
import { compareIcons } from "./compare-icons.js";
import { errorResult, outputs } from "./contracts.js";

const { renderIconSvg } = utils;

const {
  addIcons,
  applyIconPlan,
  catalogVersion,
  doctor,
  getCollection,
  iconSummary,
  iconUsage,
  initProject,
  inspectProject,
  listCollections,
  localIconTree,
  planIcons,
  recommendIcons,
  removeIcons,
  requireIcon,
  searchIcons,
  allIcons
} = toolkit;

const result = async (work: () => unknown | Promise<unknown>) => {
  try {
    const value = await work();
    const data = value as Record<string, unknown>;
    const summary =
      typeof data.summary === "string"
        ? data.summary
        : Array.isArray(data.results)
          ? `${data.results.length} icon result(s) from ${data.source}`
          : Array.isArray(data.collections)
            ? `${data.collections.length} collections`
            : typeof data.id === "string"
              ? `Icon ${data.id}`
              : typeof data.collection_id === "string"
                ? `Collection ${data.collection_id}`
                : "Rocketicons result";
    const fileChanges = Array.isArray(data.appliedFileChanges)
      ? data.appliedFileChanges
      : Array.isArray(data.fileChanges)
        ? data.fileChanges
        : undefined;
    const fileSummary = fileChanges
      ? [
          `Files: ${fileChanges.length ? (fileChanges as Array<{ action: string; path: string }>).map(({ action, path }) => `${action} ${path}`).join(", ") : "none"}`,
          `Dependencies to install: ${Array.isArray(data.toInstall) && data.toInstall.length ? data.toInstall.join(", ") : "none"}`,
          ...(data.dependencyEffects && typeof data.dependencyEffects === "object"
            ? [
                `Package-manager effects: ${(data.dependencyEffects as { mayWritePaths: string[] }).mayWritePaths.join(", ")}`
              ]
            : []),
          ...(data.planId ? [`Plan ID: ${data.planId}`] : [])
        ].join("\n")
      : "";
    return {
      content: [
        { type: "text" as const, text: fileSummary ? `${summary}\n${fileSummary}` : summary }
      ],
      structuredContent: value as Record<string, unknown>
    };
  } catch (error) {
    return errorResult(error);
  }
};
const textResource = (uri: URL, value: unknown, mimeType = "application/json") => ({
  contents: [
    { uri: uri.href, text: typeof value === "string" ? value : JSON.stringify(value), mimeType }
  ]
});
const projectPath = z
  .string()
  .min(1)
  .describe("Absolute path to the project root containing package.json");
const iconIds = z.array(z.string().min(1)).min(1).describe("Exact icon IDs from search_icons");
const docs: Record<string, string> = {
  workflow:
    "For a React or React Native project, call recommend_icons with its path, icon intent, and source file. Compare up to five exact IDs visually with compare_icons, then call plan_icons with the exact icon IDs and source file. Review managed files and dependency effects. Call apply_icons with the returned plan ID; it verifies the result and returns imports relative to that source file. For plain HTML or other frameworks, use search_icons and get_icon_svg to get SVG markup without project setup.",
  styling:
    "Generated components accept className. Use Rocketicons and Tailwind-compatible icon classes such as icon-primary-xl. For React Native, configure NativeWind and react-native-svg.",
  licensing:
    "Each search result includes its collection license and upstream license URL. Review the collection terms and preserve attribution where required."
};
const configSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "rocketicons.json",
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "catalogVersion", "target", "language", "outputPath", "icons"],
  properties: {
    schemaVersion: { const: 1 },
    catalogVersion: { type: "string" },
    target: { enum: ["react", "react-native"] },
    language: { enum: ["ts", "js"] },
    outputPath: { const: "src/ri" },
    icons: {
      type: "object",
      additionalProperties: {
        type: "object",
        additionalProperties: false,
        required: ["component", "path", "sha256", "collection", "licenseUrl"],
        properties: {
          component: { type: "string" },
          path: { type: "string" },
          sha256: { type: "string", pattern: "^[a-f0-9]{64}$" },
          collection: { type: "string" },
          licenseUrl: { type: "string", format: "uri" }
        }
      }
    }
  }
};
const catalogSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Rocketicons catalog v1",
  type: "object",
  required: ["schemaVersion", "packageVersion", "collections"],
  properties: {
    schemaVersion: { const: 1 },
    packageVersion: { type: "string" },
    collections: {
      type: "array",
      items: { type: "object", required: ["id", "name", "license", "licenseUrl", "totalIcons"] }
    }
  }
};

export const createServer = () => {
  const server = new McpServer(
    { name: "rocketicons", version: "0.1.0" },
    {
      instructions:
        "For React or React Native, use recommend_icons to find candidates and compare_icons to inspect shapes. Use plan_icons with the source file that will import the icon, then apply_icons with the returned plan ID. The plan lists managed files and dependency effects; apply verifies the result. For plain HTML or other frameworks, search_icons then get_icon_svg returns SVG markup without setup. Exact icon IDs come from search results."
    }
  );

  server.registerTool(
    "search_icons",
    {
      description:
        "Find icons by intent or exact ID. Uses Algolia with local offline fallback; collection filters keep an application's icons consistent.",
      inputSchema: z.object({
        query: z.string(),
        collections: z.array(z.string()).optional(),
        variants: z.array(z.string()).optional(),
        limit: z.number().int().min(1).max(60).optional()
      }),
      outputSchema: outputs.search_icons
    },
    (input) => result(() => searchIcons(input))
  );
  server.registerTool(
    "recommend_icons",
    {
      description:
        "Recommend icons for an intent in a project. Checks installed icons first, searches existing collections, and returns Web and React Native usage for each candidate.",
      inputSchema: z.object({
        project_path: projectPath,
        intent: z.string().min(1),
        from_file: z
          .string()
          .min(1)
          .optional()
          .describe("Project source file that will import the icon"),
        limit: z.number().int().min(1).max(10).optional()
      }),
      outputSchema: outputs.recommend_icons
    },
    ({ project_path, intent, from_file, limit }) =>
      result(() =>
        recommendIcons({ projectPath: project_path, intent, fromFile: from_file, limit })
      )
  );
  server.registerTool(
    "get_icon",
    {
      description: "Get concise metadata, license, and an SVG resource link for one exact icon.",
      inputSchema: z.object({ icon_id: z.string() }),
      outputSchema: outputs.get_icon
    },
    ({ icon_id }) =>
      result(() => iconSummary(requireIcon(icon_id))).then((response) => {
        if (("isError" in response && response.isError) || !response.structuredContent)
          return response;
        const icon = response.structuredContent as ReturnType<typeof iconSummary>;
        return {
          ...response,
          content: [
            ...response.content,
            {
              type: "resource_link" as const,
              name: `${icon.id} SVG`,
              uri: icon.svgResource,
              mimeType: "image/svg+xml"
            }
          ]
        };
      })
  );
  server.registerTool(
    "get_icon_svg",
    {
      description:
        "Return the complete SVG markup for one exact icon ID. Works offline and requires no project setup; embed it in HTML or save it as an .svg file.",
      inputSchema: z.object({ icon_id: z.string().min(1) }),
      outputSchema: outputs.get_icon_svg
    },
    ({ icon_id }) => {
      try {
        const icon = requireIcon(icon_id);
        const svg = renderIconSvg(localIconTree(icon));
        return {
          content: [{ type: "text" as const, text: svg }],
          structuredContent: {
            ...iconSummary(icon),
            mimeType: "image/svg+xml",
            source: "local",
            svg
          }
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );
  server.registerTool(
    "compare_icons",
    {
      description:
        "Compare the shapes of up to five exact icon IDs in one labeled image. Uses bundled icon data and works offline.",
      inputSchema: z.object({
        icon_ids: z
          .array(z.string().min(1))
          .min(1)
          .max(5)
          .describe("Exact icon IDs from search_icons")
      }),
      outputSchema: outputs.compare_icons
    },
    async ({ icon_ids }) => {
      try {
        const { png, metadata } = await compareIcons(icon_ids);
        return {
          content: [
            {
              type: "text" as const,
              text: `Comparison of ${metadata.icons.length} icon(s). Cells follow request order, left to right, top to bottom.`
            },
            { type: "image" as const, data: png.toString("base64"), mimeType: "image/png" },
            ...metadata.icons.map((icon) => ({
              type: "resource_link" as const,
              name: `${icon.id} SVG`,
              uri: icon.svgResource,
              mimeType: "image/svg+xml"
            }))
          ],
          structuredContent: metadata
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );
  server.registerTool(
    "get_icon_usage",
    {
      description:
        "Get generated path and JSX usage. Pass project_path and from_file for an import that resolves from the source file; without them, no import is suggested.",
      inputSchema: z.object({
        icon_id: z.string(),
        target: z.enum(["react", "react-native"]).optional(),
        language: z.enum(["ts", "js"]).optional(),
        project_path: projectPath.optional(),
        from_file: z.string().min(1).optional()
      }),
      outputSchema: outputs.get_icon_usage
    },
    ({ icon_id, target, language, project_path, from_file }) =>
      result(() => {
        if (Boolean(project_path) !== Boolean(from_file))
          throw new Error("Provide project_path and from_file together for a resolvable import");
        const project = project_path ? inspectProject(project_path) : undefined;
        if (!target && !project) throw new Error("target is required without project_path");
        return iconUsage(
          icon_id,
          target ?? project?.manifest?.target ?? project!.detectedTarget,
          language ?? project?.manifest?.language ?? project?.detectedLanguage,
          project_path && from_file
            ? { projectPath: project_path, fromFile: from_file }
            : undefined
        );
      })
  );
  server.registerTool(
    "list_collections",
    {
      description: "List icon collections with counts, licenses, and upstream links.",
      inputSchema: z.object({}),
      outputSchema: outputs.list_collections
    },
    () => result(() => ({ catalogVersion, collections: listCollections() }))
  );
  server.registerTool(
    "get_collection",
    {
      description: "Get one collection and its icon count, license, and index resource.",
      inputSchema: z.object({ collection_id: z.string() }),
      outputSchema: outputs.get_collection
    },
    ({ collection_id }) =>
      result(() => {
        const collection = getCollection(collection_id);
        if (!collection) throw new Error(`Unknown collection: ${collection_id}`);
        return { ...collection, resource: `rocketicons://collections/${collection_id}` };
      })
  );
  server.registerTool(
    "inspect_project",
    {
      description: "Read Rocketicons setup and installed icons from a project.",
      inputSchema: z.object({ project_path: projectPath }),
      outputSchema: outputs.inspect_project
    },
    ({ project_path }) => result(() => inspectProject(project_path))
  );
  server.registerTool(
    "doctor",
    {
      description:
        "Diagnose missing dependencies and modified or missing generated icons without changing files.",
      inputSchema: z.object({ project_path: projectPath }),
      outputSchema: outputs.doctor
    },
    ({ project_path }) => result(() => doctor(project_path))
  );
  server.registerTool(
    "init_project",
    {
      description:
        "Set up a React or React Native project. Explicitly installs shared dependencies unless dry_run is true.",
      inputSchema: z.object({
        project_path: projectPath,
        target: z.enum(["react", "react-native"]).optional(),
        language: z.enum(["ts", "js"]).optional(),
        package_manager: z.enum(["npm", "pnpm", "yarn", "bun"]).optional(),
        dry_run: z.boolean().optional()
      }),
      outputSchema: outputs.init_project
    },
    ({ project_path, package_manager, dry_run, ...options }) =>
      result(() =>
        initProject(project_path, {
          ...options,
          packageManager: package_manager,
          dryRun: dry_run
        })
      )
  );
  server.registerTool(
    "plan_icons",
    {
      description:
        "Preview setup and icon installation without writes. Returns exact managed file paths and hashes, required dependencies, package-manager effects, and imports relative to from_file.",
      inputSchema: z.object({
        project_path: projectPath,
        icon_ids: iconIds,
        from_file: z.string().min(1).describe("Project source file that will import the icons"),
        target: z.enum(["react", "react-native"]).optional(),
        language: z.enum(["ts", "js"]).optional(),
        package_manager: z.enum(["npm", "pnpm", "yarn", "bun"]).optional()
      }),
      outputSchema: outputs.plan_icons
    },
    ({ project_path, icon_ids, from_file, package_manager, ...options }) =>
      result(() =>
        planIcons(project_path, icon_ids, {
          ...options,
          fromFile: from_file,
          packageManager: package_manager
        })
      )
  );
  server.registerTool(
    "apply_icons",
    {
      description:
        "Apply a reviewed plan only if project files still match its plan ID, then verify generated files and project health. Set dry_run to preview again without writing.",
      inputSchema: z.object({
        project_path: projectPath,
        icon_ids: iconIds,
        plan_id: z.string().regex(/^[a-f0-9]{64}$/),
        from_file: z.string().min(1),
        target: z.enum(["react", "react-native"]).optional(),
        language: z.enum(["ts", "js"]).optional(),
        package_manager: z.enum(["npm", "pnpm", "yarn", "bun"]).optional(),
        dry_run: z.boolean().optional()
      }),
      outputSchema: outputs.apply_icons
    },
    ({ project_path, icon_ids, plan_id, from_file, package_manager, dry_run, ...options }) =>
      result(() =>
        applyIconPlan(project_path, icon_ids, plan_id, {
          ...options,
          fromFile: from_file,
          packageManager: package_manager,
          dryRun: dry_run
        })
      )
  );
  server.registerTool(
    "add_icons",
    {
      description: "Add exact icon IDs to an initialized project; dry_run previews changes.",
      inputSchema: z.object({
        icon_ids: iconIds,
        project_path: projectPath,
        dry_run: z.boolean().optional()
      }),
      outputSchema: outputs.add_icons
    },
    ({ icon_ids, project_path, dry_run }) =>
      result(() => addIcons(project_path, icon_ids, dry_run))
  );
  server.registerTool(
    "remove_icons",
    {
      description: "Remove only Rocketicons-managed icon files; dry_run previews changes.",
      inputSchema: z.object({
        icon_ids: iconIds,
        project_path: projectPath,
        dry_run: z.boolean().optional()
      }),
      outputSchema: outputs.remove_icons
    },
    ({ icon_ids, project_path, dry_run }) =>
      result(() => removeIcons(project_path, icon_ids, dry_run))
  );

  server.registerResource(
    "catalog",
    "rocketicons://catalog/v1",
    {
      title: "Rocketicons catalog",
      mimeType: "application/json"
    },
    async (uri) =>
      textResource(uri, {
        schemaVersion: 1,
        packageVersion: catalogVersion,
        collections: listCollections()
      })
  );
  server.registerResource(
    "config-schema",
    "rocketicons://schemas/config/v1",
    {
      title: "Project configuration schema",
      mimeType: "application/schema+json"
    },
    async (uri) => textResource(uri, configSchema, "application/schema+json")
  );
  server.registerResource(
    "catalog-schema",
    "rocketicons://schemas/catalog/v1",
    {
      title: "Catalog schema",
      mimeType: "application/schema+json"
    },
    async (uri) => textResource(uri, catalogSchema, "application/schema+json")
  );
  server.registerResource(
    "collections",
    new ResourceTemplate("rocketicons://collections/{collectionId}", { list: undefined }),
    {
      title: "Collection icon index",
      mimeType: "application/json"
    },
    async (uri, { collectionId }) => {
      const id = String(collectionId);
      const collection = getCollection(id);
      if (!collection) throw new Error(`Unknown collection: ${id}`);
      return textResource(uri, {
        collection,
        icons: allIcons()
          .filter((icon) => icon.collection === id)
          .map(({ id, name, component, variant }) => ({ id, name, component, variant }))
      });
    }
  );
  server.registerResource(
    "svg",
    new ResourceTemplate("rocketicons://icons/{collectionId}/{iconId}/svg", { list: undefined }),
    {
      title: "Exact icon SVG",
      mimeType: "image/svg+xml"
    },
    async (uri, { collectionId, iconId }) =>
      textResource(
        uri,
        renderIconSvg(localIconTree(requireIcon(`@${collectionId}/${iconId}`))),
        "image/svg+xml"
      )
  );
  server.registerResource(
    "license",
    new ResourceTemplate("rocketicons://licenses/{collectionId}", { list: undefined }),
    {
      title: "Collection license",
      mimeType: "application/json"
    },
    async (uri, { collectionId }) => {
      const collection = getCollection(String(collectionId));
      if (!collection) throw new Error(`Unknown collection: ${collectionId}`);
      return textResource(uri, {
        collection: collection.id,
        license: collection.license,
        licenseUrl: collection.licenseUrl,
        projectUrl: collection.projectUrl
      });
    }
  );
  server.registerResource(
    "docs",
    new ResourceTemplate("rocketicons://docs/{topic}", { list: undefined }),
    {
      title: "Rocketicons documentation",
      mimeType: "text/plain"
    },
    async (uri, { topic }) => {
      const text = docs[String(topic)];
      if (!text) throw new Error(`Unknown documentation topic: ${topic}`);
      return textResource(uri, text, "text/plain");
    }
  );
  return server;
};
