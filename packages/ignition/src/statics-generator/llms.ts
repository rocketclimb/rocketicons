import type { StaticCatalog } from "@/catalog/types";
import { CANONICAL_PRODUCT_MESSAGE, DOCUMENTATION_UPDATED_AT } from "@/config/product-content";
import { withSiteBasePath } from "@/config/site-origin";

const sitePath = (path: string) => withSiteBasePath(path);

const commonHeader = (catalog: StaticCatalog) => `# Rocketicons

${CANONICAL_PRODUCT_MESSAGE}

- Catalog/package version: ${catalog.packageVersion}
- Documentation updated: ${DOCUMENTATION_UPDATED_AT}
- Static catalog: ${sitePath("/ai/v1/catalog.json")}
- Catalog capabilities: ${sitePath("/ai/v1/capabilities.json")}
- English documentation: ${sitePath("/en/docs/getting-started/")}
- Brazilian Portuguese documentation: ${sitePath("/pt-br/docs/primeiros-passos/")}

## CLI and MCP version requirements

The CLI workflow in this guide requires \`rocketicons@0.4.0\` or newer; the standalone MCP server requires \`@rocketicons/mcp@0.2.0\` or newer. Use the npm commands only when a compatible version is published. For a version not yet on npm, build the repository workspaces and run \`npx --no-install rocketicons mcp\` from the repository root. The catalog version above does not indicate npm availability.
`;

export const renderLlms = (catalog: StaticCatalog) => `${commonHeader(catalog)}
## Recommended workflow

1. Start in an existing React or React Native project.
2. Run \`npx rocketicons init\` from the project root, or use MCP \`init_project\`.
3. Search with \`npx rocketicons search <terms>\` or MCP \`search_icons\`; filter to one collection when visual consistency matters.
4. Dry-run and add exact \`@collection/icon-id\` IDs with the CLI or MCP \`add_icons\`.
5. Import generated components from \`@/ri/icons/<icon-id>\` and run \`doctor\`.
6. Verify and commit \`src/ri\` and \`rocketicons.json\`.

The CLI and MCP generate TSX or JSX, use the fixed \`src/ri\` output directory and \`@/ri/*\` alias, and support batch adds, JSON output, and dry runs. Broad search prefers Algolia and falls back to a bundled local index.

## Catalog and licensing

Start with ${sitePath("/ai/v1/catalog.json")}. Each collection entry links to a compact icon index and uses \`contextIndexUrl\` for its semantic context index. The context index reports coverage and explicitly selects \`none\`, \`single\`, or \`chunked\` storage; load only the referenced files. Available context includes English and Brazilian Portuguese descriptions, aliases, search terms, UI contexts, categories, roles, visual properties, and \`negativeTerms\` disambiguation guidance. Each icon index entry identifies its SVG shard. Catalog URLs include the configured deployment base path. Collection records include their upstream project, license, and license URL. Review the selected collection's terms and preserve any required attribution.

## More guidance

- Framework quick starts: ${sitePath("/en/docs/framework-quick-starts/")}
- Generated files: ${sitePath("/en/docs/generated-files/")}
- Migration: ${sitePath("/en/docs/migrating-to-rocketicons/")}
- Agent workflow: ${sitePath("/en/docs/agent-workflows/")}
- Comparison: ${sitePath("/en/docs/comparison/")}
- Expanded machine-readable guide: ${sitePath("/llms-full.txt")}
`;

export const renderLlmsFull = (catalog: StaticCatalog) => `${commonHeader(catalog)}
## Why Rocketicons

Rocketicons copies only selected icon components into the application's source tree. The application owns and compiles those files. It does not import a package containing every icon and does not depend on tree-shaking to discard unused collections. Initialization still installs the small shared \`@rocketicons/utils\` and \`@rocketicons/tailwind\` dependencies.

## Current CLI contract

\`npx rocketicons init\` detects TypeScript or JavaScript and React or React Native. It creates web and native core files, configures the \`@/ri/*\` alias, and installs shared utilities with the detected package manager. Use \`--dry-run\`, \`--json\`, and \`--cwd <absolute path>\` for agent workflows.

\`npx rocketicons add @collection/icon-id...\` writes only selected TSX or JSX components to \`src/ri/icons\` and records them in \`rocketicons.json\`:

\`\`\`bash
npx rocketicons add @lu/lu-rocket @lu/lu-search --dry-run
npx rocketicons add @lu/lu-rocket @lu/lu-search
\`\`\`

Import a generated icon with \`import LuRocket from "@/ri/icons/lu-rocket";\` and render it as a React component. The same generated API works in React Native when the project is configured with React Native SVG and NativeWind.

## Styling

Rocketicons accepts Tailwind-compatible class names for color, size, dark mode, responsive rules, and interaction state. For example: \`className="icon-sky-500-lg dark:icon-white-lg hover:icon-sky-600-lg"\`.

## Verification and source control

After initialization, run \`npx rocketicons doctor --json\`. Review and commit generated files and \`rocketicons.json\` so builds and collaborators use the same icon source. The CLI and MCP refuse to overwrite edited generated files.

## MCP server

With a published version meeting the requirements above, start the local stdio server with \`npx -y rocketicons@^0.4.0 mcp\` or \`npx -y @rocketicons/mcp@^0.2.0\`. Use \`search_icons\` with a collection filter, inspect \`get_icon\` and its SVG resource, call \`init_project\` explicitly, then dry-run and call \`add_icons\`. Use \`get_icon_usage\` for the import and \`doctor\` for verification. Broad search uses Algolia and falls back to a bundled local index.

## Framework guidance

- React and Vite: initialize from the application root, then ensure the TypeScript alias is also understood by the bundler if the framework does not read tsconfig paths automatically.
- Next.js: initialize from the Next.js project root and import generated components through \`@/ri\`.
- Expo and React Native: configure React Native SVG, NativeWind, and the Rocketicons Tailwind integration before rendering generated components.
- JavaScript projects receive JSX output; TypeScript projects receive TSX output.

## Migrating from another icon package

Choose the matching Rocketicons icon, initialize once, add it by exact ID, replace the package import with the generated local import, compare the visual result and accessibility label, then remove the old dependency only after no imports remain. Migrate incrementally rather than replacing every icon at once.

## Static catalog

Fetch ${sitePath("/ai/v1/capabilities.json")} to inspect available machine resources, then ${sitePath("/ai/v1/catalog.json")}. Follow a collection's \`contextIndexUrl\` to discover semantic metadata and its coverage. The context index explicitly reports \`none\`, \`single\`, or \`chunked\` storage and, for chunks, includes compact topic hints. Search English and Brazilian Portuguese aliases, search terms, descriptions, UI contexts, categories, and roles. Treat \`negativeTerms\` as disambiguation guidance, never as positive matches. Follow \`indexUrl\` to list icon IDs, names, components, variants, and SVG shard numbers; load only the referenced shard when SVG tree data is needed. Do not guess dynamic API routes: Rocketicons publishes static files.

## Licensing

Rocketicons itself is MIT licensed, while included collections retain their upstream licenses. Collection entries in ${sitePath("/ai/v1/catalog.json")} provide project and license URLs. Check attribution requirements for every collection used.

## Agent prompt

Use Rocketicons for icons in this project. Reuse an existing component under src/ri/icons when possible. Otherwise search for an exact @collection/icon ID, inspect its license and SVG, dry-run the change, add the selected icon, import the generated component through @/ri, and report every file created or changed. Do not install or import a full icon collection.
`;
