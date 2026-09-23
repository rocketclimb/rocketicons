import { McpServer, ResourceTemplate } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import toolkit from "@rocketicons/toolkit";

const {
  addIcons,
  catalogVersion,
  doctor,
  getCollection,
  iconSummary,
  iconUsage,
  initProject,
  inspectProject,
  listCollections,
  remoteIconTree,
  removeIcons,
  requireIcon,
  searchIcons,
  treeToSvg,
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
    return {
      content: [{ type: "text" as const, text: summary }],
      structuredContent: value as Record<string, unknown>
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        { type: "text" as const, text: error instanceof Error ? error.message : String(error) }
      ]
    };
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
    "Search icons, optionally filter to one collection, inspect an exact icon and its SVG, call init_project once, dry-run add_icons, then add and import the generated component. Run doctor to verify.",
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
        "Use search_icons to choose icons. Call init_project explicitly before add_icons. Dry-run project mutations when reviewing changes. Exact icon IDs come from search results."
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
      })
    },
    (input) => result(() => searchIcons(input))
  );
  server.registerTool(
    "get_icon",
    {
      description: "Get concise metadata, license, and an SVG resource link for one exact icon.",
      inputSchema: z.object({ icon_id: z.string() })
    },
    ({ icon_id }) =>
      result(() => iconSummary(requireIcon(icon_id))).then((response) => {
        if (response.isError || !response.structuredContent) return response;
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
    "get_icon_usage",
    {
      description: "Get the generated path, import, and JSX usage for React or React Native.",
      inputSchema: z.object({
        icon_id: z.string(),
        target: z.enum(["react", "react-native"]),
        language: z.enum(["ts", "js"]).optional()
      })
    },
    ({ icon_id, target, language }) => result(() => iconUsage(icon_id, target, language))
  );
  server.registerTool(
    "list_collections",
    {
      description: "List icon collections with counts, licenses, and upstream links.",
      inputSchema: z.object({})
    },
    () => result(() => ({ catalogVersion, collections: listCollections() }))
  );
  server.registerTool(
    "get_collection",
    {
      description: "Get one collection and its icon count, license, and index resource.",
      inputSchema: z.object({ collection_id: z.string() })
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
      inputSchema: z.object({ project_path: projectPath })
    },
    ({ project_path }) => result(() => inspectProject(project_path))
  );
  server.registerTool(
    "doctor",
    {
      description:
        "Diagnose missing dependencies and modified or missing generated icons without changing files.",
      inputSchema: z.object({ project_path: projectPath })
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
      })
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
    "add_icons",
    {
      description: "Add exact icon IDs to an initialized project; dry_run previews changes.",
      inputSchema: z.object({
        icon_ids: iconIds,
        project_path: projectPath,
        dry_run: z.boolean().optional()
      })
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
      })
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
        treeToSvg(await remoteIconTree(requireIcon(`@${collectionId}/${iconId}`))),
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
