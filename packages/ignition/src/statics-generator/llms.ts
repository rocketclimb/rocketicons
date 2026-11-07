import type { StaticCatalog } from "@/catalog/types";
import { CANONICAL_PRODUCT_MESSAGE, DOCUMENTATION_UPDATED_AT } from "@/config/product-content";
import { absoluteSiteUrl } from "@/config/site-origin";

const siteLink = (label: string, path: string) =>
  `[${label}](${absoluteSiteUrl(path).toString()})`;

const commonHeader = (catalog: StaticCatalog) => `# Rocketicons

> ${CANONICAL_PRODUCT_MESSAGE}

- Catalog/package version: ${catalog.packageVersion}
- Documentation updated: ${DOCUMENTATION_UPDATED_AT}
- ${siteLink("Static catalog", "/ai/v1/catalog.json")}: Collection indexes, icon shards, and license records.
- ${siteLink("Catalog capabilities", "/ai/v1/capabilities.json")}: Available machine resources.
- ${siteLink("English getting started", "/en/docs/getting-started/")}: CLI setup and usage.
- ${siteLink("Primeiros passos em português", "/pt-br/docs/primeiros-passos/")}: Guia de instalação e uso.
- ${siteLink("Agent workflow", "/en/docs/agent-workflows/")}: MCP setup and reviewed icon selection.

## CLI and MCP version requirements

The CLI workflow in this guide requires \`rocketicons@0.4.0\` or newer; the standalone MCP server requires \`@rocketicons/mcp@0.2.0\` or newer. Check that the required version is published before running an npm command. For a version not yet on npm, build the repository workspaces and run \`npx --no-install rocketicons mcp\` from the repository root. The catalog version above does not indicate npm availability.

## Existing project catalog upgrades

Catalog migration requires \`@rocketicons/mcp@0.3.0\` / \`@rocketicons/toolkit@0.3.0\` or newer, in a compatible published CLI release or a built source checkout. On \`CATALOG_MISMATCH\`, call \`plan_project_upgrade(project_path)\`, review the manifest changes and preserved icons, then call \`apply_project_upgrade(project_path, plan_id, dry_run?)\`. CLI: \`rocketicons upgrade --dry-run --json\`, then \`rocketicons upgrade --plan-id <planId> --json\`. Retry adding icons afterward. The upgrade writes only \`rocketicons.json\`, records original per-icon catalog versions, and preserves existing files. Stale plans and downgrades are rejected; missing files and unrelated setup issues remain visible. Do not reset the project or manually replace its catalog version. This does not regenerate icons or migrate runtime/core files.
`;

export const renderLlms = (catalog: StaticCatalog) => `${commonHeader(catalog)}
## Recommended workflow

1. Start in an existing React or React Native project.
2. Use \`npx rocketicons search <terms> --json\` or MCP \`recommend_icons\` with a project path, intent, and source file. Compare exact IDs, variants, and licenses.
3. For CLI, preview setup with \`npx rocketicons init --dry-run --json\`, then run \`npx rocketicons init --json\` once to create \`rocketicons.json\`. MCP \`plan_icons\` and \`apply_icons\` handle setup within their plan.
4. Preview exact \`@collection/icon-id\` choices with CLI \`npx rocketicons add @collection/icon-id --dry-run --json\` or MCP \`plan_icons\`.
5. Apply the reviewed choice with CLI \`npx rocketicons add @collection/icon-id --json\` or MCP \`apply_icons\` using its returned plan ID.
6. Use the returned import path, run \`doctor --json\`, and commit generated files and \`rocketicons.json\`.

The CLI and MCP generate TSX or JSX, use the fixed \`src/ri\` output directory and \`@/ri/*\` alias, and support batch adds, JSON output, and dry runs. Broad search prefers Algolia and falls back to a bundled local index.

## Catalog and licensing

Start with ${siteLink("the static catalog", "/ai/v1/catalog.json")}. Each collection entry links to a compact icon index and uses \`contextIndexUrl\` for its semantic context index. The context index reports coverage and explicitly selects \`none\`, \`single\`, or \`chunked\` storage; load only the referenced files. Available context includes English and Brazilian Portuguese descriptions, aliases, search terms, UI contexts, categories, roles, visual properties, and \`negativeTerms\` disambiguation guidance. Each icon index entry identifies its SVG shard. Collection records include their upstream project, license, and license URL. Review the selected collection's terms and preserve any required attribution.

## More guidance

- ${siteLink("Framework quick starts", "/en/docs/framework-quick-starts/")}: React, Next.js, Vite, Expo, and React Native.
- ${siteLink("Generated files", "/en/docs/generated-files/")}: Project output and imports.
- ${siteLink("Migration", "/en/docs/migrating-to-rocketicons/")}: Move from other icon libraries.
- ${siteLink("Agent workflow", "/en/docs/agent-workflows/")}: MCP setup and reviewed icon selection.
- ${siteLink("Comparison", "/en/docs/comparison/")}: Product tradeoffs.
- ${siteLink("Expanded machine-readable guide", "/llms-full.txt")}: More implementation detail.
`;

export const renderLlmsFull = (catalog: StaticCatalog) => `${commonHeader(catalog)}
## Why Rocketicons

Rocketicons copies only selected icon components into the application's source tree. The application owns and compiles those files. It does not import a package containing every icon and does not depend on tree-shaking to discard unused collections. Initialization still installs the small shared \`@rocketicons/utils\` and \`@rocketicons/tailwind\` dependencies.

## Current CLI contract

Before CLI \`add\`, run \`npx rocketicons init\` from the project root. It detects TypeScript or JavaScript and React or React Native, creates \`rocketicons.json\` and core files, configures the \`@/ri/*\` alias, and installs shared utilities with the detected package manager. Use \`--dry-run\`, \`--json\`, and \`--cwd <absolute path>\` for agent workflows. The MCP \`plan_icons\` and \`apply_icons\` tools can plan and apply setup with the selected icons without a separate init call.

\`npx rocketicons add @collection/icon-id...\` writes only selected TSX or JSX components to \`src/ri/icons\` and records them in \`rocketicons.json\`:

\`\`\`bash
npx rocketicons init --dry-run --json
npx rocketicons init --json
npx rocketicons add @lu/lu-rocket @lu/lu-search --dry-run
npx rocketicons add @lu/lu-rocket @lu/lu-search
\`\`\`

Import a generated icon with \`import LuRocket from "@/ri/icons/lu-rocket";\` and render it as a React component. The same generated API works in React Native when the project is configured with React Native SVG and NativeWind.

## Styling

Rocketicons accepts Tailwind-compatible class names for color, size, dark mode, responsive rules, and interaction state. For example: \`className="icon-sky-500-lg dark:icon-white-lg hover:icon-sky-600-lg"\`.

## Verification and source control

After initialization, run \`npx rocketicons doctor --json\`. Review and commit generated files and \`rocketicons.json\` so builds and collaborators use the same icon source. The CLI and MCP refuse to overwrite edited generated files.

## MCP server

With a compatible published version, start the local stdio server with \`npx -y rocketicons@^0.4.0 mcp\` or \`npx -y @rocketicons/mcp@^0.2.0\`. For a React or React Native project, call \`recommend_icons\` with its path, intent, and source file; use \`compare_icons\` to inspect candidates. Call \`plan_icons\` with exact IDs, review the files and dependency effects, then call \`apply_icons\` with its returned plan ID. Use the returned import path and \`doctor\` result for verification. For plain HTML, use \`search_icons\` and \`get_icon_svg\` without project setup. Broad search uses Algolia and falls back to a bundled local index.

## Framework guidance

- React and Vite: initialize from the application root, then ensure the TypeScript alias is also understood by the bundler if the framework does not read tsconfig paths automatically.
- Next.js: initialize from the Next.js project root and import generated components through \`@/ri\`.
- Expo and React Native: NativeWind 4 uses Tailwind CSS 3, so register \`nativeIconPlugin\` from \`@rocketicons/tailwind\` in \`tailwind.config.*\` (\`init\` adds it to an existing config) and set up React Native SVG, the NativeWind preset, Babel preset, and Metro \`withNativeWind\`; \`doctor\` checks each piece.
- JavaScript projects receive JSX output; TypeScript projects receive TSX output.

## Migrating from another icon package

Choose the matching Rocketicons icon, initialize once, add it by exact ID, replace the package import with the generated local import, compare the visual result and accessibility label, then remove the old dependency only after no imports remain. Migrate incrementally rather than replacing every icon at once.

## Static catalog

Fetch ${siteLink("catalog capabilities", "/ai/v1/capabilities.json")} to inspect available machine resources, then ${siteLink("the static catalog", "/ai/v1/catalog.json")}. Follow a collection's \`contextIndexUrl\` to discover semantic metadata and its coverage. The context index explicitly reports \`none\`, \`single\`, or \`chunked\` storage and, for chunks, includes compact topic hints. Search English and Brazilian Portuguese aliases, search terms, descriptions, UI contexts, categories, and roles. Treat \`negativeTerms\` as disambiguation guidance, never as positive matches. Follow \`indexUrl\` to list icon IDs, names, components, variants, and SVG shard numbers; load only the referenced shard when SVG tree data is needed. Do not guess dynamic API routes: Rocketicons publishes static files.

## Licensing

Rocketicons itself is MIT licensed, while included collections retain their upstream licenses. Collection entries in ${siteLink("the static catalog", "/ai/v1/catalog.json")} provide project and license URLs. Check attribution requirements for every collection used.

## Agent prompt

Use Rocketicons for icons in this project. Reuse an existing component under src/ri/icons when possible. Otherwise search for an exact @collection/icon ID, inspect its license and SVG, dry-run the change, add the selected icon, import the generated component through @/ri, and report every file created or changed. Do not install or import a full icon collection.
`;
