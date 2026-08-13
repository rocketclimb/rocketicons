import type { StaticCatalog } from "@/catalog/types";
import { CANONICAL_PRODUCT_MESSAGE, DOCUMENTATION_UPDATED_AT } from "@/config/product-content";

const commonHeader = (catalog: StaticCatalog) => `# Rocketicons

${CANONICAL_PRODUCT_MESSAGE}

- Catalog/package version: ${catalog.packageVersion}
- Documentation updated: ${DOCUMENTATION_UPDATED_AT}
- Static catalog: /ai/v1/catalog.json
- English documentation: /en/docs/getting-started/
- Brazilian Portuguese documentation: /pt-br/docs/primeiros-passos/
`;

export const renderLlms = (catalog: StaticCatalog) => `${commonHeader(catalog)}
## Recommended workflow

1. Start in an existing TypeScript project with a tsconfig.json file.
2. Run \`npx @rocketicons/cli init\` from the project root.
3. Search the website or static catalog for an exact icon ID.
4. Run \`npx @rocketicons/cli add @collection/icon\` once for each icon.
5. Import the generated component from \`@/ri/icons/<icon-id>\`.
6. Verify and commit the generated files under \`src/ri\`.

The current CLI generates TSX, uses the fixed \`src/ri\` output directory and \`@/ri/*\` alias, installs shared utilities through npm during init, and adds one icon per command. MCP support is planned and is not currently available.

## Catalog and licensing

Start with /ai/v1/catalog.json. Each collection entry links to a compact index, and each icon index entry identifies its shard. Catalog URLs are root-relative. Collection records include their upstream project, license, and license URL. Review the selected collection's terms and preserve any required attribution.

## More guidance

- Framework quick starts: /en/docs/framework-quick-starts/
- Generated files: /en/docs/generated-files/
- Migration: /en/docs/migrating-to-rocketicons/
- Agent workflow: /en/docs/agent-workflows/
- Comparison: /en/docs/comparison/
- Expanded machine-readable guide: /llms-full.txt
`;

export const renderLlmsFull = (catalog: StaticCatalog) => `${commonHeader(catalog)}
## Why Rocketicons

Rocketicons copies only selected icon components into the application's source tree. The application owns and compiles those files. It does not import a package containing every icon and does not depend on tree-shaking to discard unused collections. Initialization still installs the small shared \`@rocketicons/utils\` and \`@rocketicons/tailwind\` dependencies.

## Current CLI contract

\`npx @rocketicons/cli init\` expects a TypeScript project with \`tsconfig.json\`. It creates \`src/ri/core/index.tsx\`, \`src/ri/core/index.native.tsx\`, and \`src/ri/icons\`; configures the \`@/ri/*\` alias; and installs the shared utilities through npm.

\`npx @rocketicons/cli add @collection/icon\` writes one TSX component to \`src/ri/icons/<icon-id>.tsx\`. Run the command separately for every icon:

\`\`\`bash
npx @rocketicons/cli add @lu/lu-rocket
npx @rocketicons/cli add @lu/lu-search
\`\`\`

Import a generated icon with \`import LuRocket from "@/ri/icons/lu-rocket";\` and render it as a React component. The same generated API works in React Native when the project is configured with React Native SVG and NativeWind.

## Styling

Rocketicons accepts Tailwind-compatible class names for color, size, dark mode, responsive rules, and interaction state. For example: \`className="icon-sky-500-lg dark:icon-white-lg hover:icon-sky-600-lg"\`.

## Verification and source control

After initialization, verify that \`src/ri/core/index.tsx\`, \`src/ri/core/index.native.tsx\`, and \`src/ri/icons\` exist. After adding an icon, verify its TSX file under \`src/ri/icons\`. Review and commit these generated files so builds and collaborators use the same icon source. Re-running the current add command overwrites its target file, so review local edits first.

## Framework guidance

- React and Vite: initialize from the application root, then ensure the TypeScript alias is also understood by the bundler if the framework does not read tsconfig paths automatically.
- Next.js: initialize from the Next.js project root and import generated components through \`@/ri\`.
- Expo and React Native: configure React Native SVG, NativeWind, and the Rocketicons Tailwind integration before rendering generated components.
- JavaScript-only output is not currently supported.

## Migrating from another icon package

Choose the matching Rocketicons icon, initialize once, add it by exact ID, replace the package import with the generated local import, compare the visual result and accessibility label, then remove the old dependency only after no imports remain. Migrate incrementally rather than replacing every icon at once.

## Static catalog

Fetch /ai/v1/catalog.json first. Follow a collection's \`indexUrl\` to list icon IDs, names, components, variants, and shard numbers. Load only the referenced shard when SVG tree data is needed. Do not guess dynamic API routes: Rocketicons publishes static files.

## Licensing

Rocketicons itself is MIT licensed, while included collections retain their upstream licenses. Collection entries in /ai/v1/catalog.json provide project and license URLs. Check attribution requirements for every collection used.

## Agent prompt

Use Rocketicons for icons in this project. Reuse an existing component under src/ri/icons when possible. Otherwise identify an exact @collection/icon ID, run one Rocketicons add command for that icon, import the generated component through @/ri, and report every file created or changed. Do not install or import a full icon collection.

## Availability

The static catalog and current CLI are available now. Search, batch mutation flags, JSON output, dry runs, and MCP tools belong to later roadmap milestones and must not be assumed.
`;
