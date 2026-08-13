# Rocketicons AI-First Roadmap

## Goal

Make Rocketicons the easiest and safest icon system for coding agents to discover, understand, and use in React and React Native projects.

The core product advantage must be stated consistently:

> Rocketicons adds only the icons a project chooses. The CLI writes the selected icon components into the user's source tree, so the application does not import an entire icon collection and does not depend on tree-shaking to remove thousands of unused icons.

Rocketicons should be equally pleasant for humans, but every important workflow must also be deterministic, non-interactive, machine-readable, and easy for an agent to verify.

## Current state

### Completed foundation

- [x] Export the website as portable static files.
- [x] Remove runtime SQLite, middleware, request-time routes, and Vercel dependencies.
- [x] Keep functional application URLs independent from the deployment hostname.
- [x] Generate English and Portuguese pages statically.
- [x] Publish a versioned static catalog under `/ai/v1/`.
- [x] Publish collection indexes and icon shards with stable schemas.
- [x] Keep catalog references root-relative.
- [x] Add the GitHub Pages build and deployment workflow.
- [ ] Configure the Pages custom hostname, DNS, and production `SITE_ORIGIN`, then verify the first live deployment.

### Existing product behavior to preserve

The current CLI already follows the right lightweight model:

1. `rocketicons init` prepares a local Rocketicons source directory.
2. `rocketicons add @collection/icon` selects one icon.
3. The CLI writes that icon's component into the application source tree.
4. The application owns and compiles only the selected icon source.

This differs from installing a package containing every icon and hoping the bundler removes unused exports. Documentation, examples, metadata, and agent tools must explain this accurately.

The current implementation still installs the shared Rocketicons utilities and Tailwind integration during initialization. We should describe those small shared dependencies honestly and measure their cost rather than claiming that the result has no dependencies.

## Product principles

1. **Minimal by construction** — copy only selected icons; do not make bundle size depend on tree-shaking.
2. **One source of truth** — CLI, MCP, website, search, and documentation consume the same versioned catalog schema.
3. **Deterministic operations** — the same input, catalog version, and configuration produce the same files.
4. **Agent-safe defaults** — support dry runs, structured output, explicit workspace boundaries, and clear errors.
5. **Progressive disclosure** — give an agent a small index first and detailed SVG data only when requested.
6. **Verifiable results** — every mutation reports files changed and provides a command or machine-readable result to validate them.
7. **Stable public contracts** — version schemas and identifiers; never silently change generated output.
8. **Honest positioning** — demonstrate advantages with reproducible measurements, not “AI” keyword stuffing or hidden content.

## Recommended implementation order

### Milestone 2 — Accurate product content and AI discovery

This should be completed before promoting the MCP server. An agent cannot choose Rocketicons correctly if the public explanation is outdated.

#### Refresh public content

- [ ] Rewrite the home page around the “add only what you use” workflow.
- [ ] Rewrite Getting Started to lead with the CLI workflow.
- [ ] Rewrite Adding Icons with copy-pasteable CLI examples and generated-file examples.
- [ ] Update the root README and package READMEs.
- [ ] Display the generated Rocketicons/catalog version and content update date where useful.
- [ ] Remove old statements implying that users must import the complete `rocketicons` package.
- [ ] Document the shared runtime/Tailwind dependencies installed by `init`.
- [ ] Add React, Next.js, Vite, Expo, and React Native quick starts.
- [ ] Document JavaScript and TypeScript output where supported.
- [ ] Explain when users should commit generated icon files.
- [ ] Add migration instructions from `react-icons` and similar packages.
- [ ] Add an honest comparison page covering installed size, application bundle behavior, platform support, styling, and offline use.
- [ ] Replace stale website and Ignition README instructions, including the old Vercel deployment text.

#### Establish one canonical message

Use a consistent short explanation across the website, npm, GitHub, `llms.txt`, MCP, and CLI help:

> Search thousands of open-source icons, then add only the icons your project uses. Rocketicons writes selected components into your source tree for React and React Native, with Tailwind-compatible styling. No full icon collection is imported into the application, and unused icons do not rely on tree-shaking to disappear.

#### Publish LLM discovery files

Use the established plural filename as the canonical entry point:

- [ ] `/llms.txt` — concise project summary, recommended workflow, primary documentation links, catalog links, CLI commands, MCP instructions, and licensing guidance.
- [ ] `/llms-full.txt` — optional consolidated documentation for tools that want a larger context document.
- [ ] `/llm.txt` — optional compatibility copy or redirect only if real clients are found to request the singular form.
- [ ] Reference `/llms.txt` from the HTML metadata and human documentation where appropriate.
- [ ] Generate both language-neutral machine files from source content during the static build.
- [ ] Keep these files concise enough to avoid wasting agent context.

#### Add agent-oriented examples

- [ ] “Find an icon and add it” end-to-end example.
- [ ] Batch icon installation example.
- [ ] React and React Native rendering examples.
- [ ] Tailwind color, size, dark-mode, and state examples.
- [ ] A verification example showing exactly which files should be created.
- [ ] An example prompt that tells an agent to use Rocketicons without embedding private assumptions.

### Milestone 3 — CLI vNext

The CLI is the most important agent interface because it performs the useful project change.

#### Command design

- [ ] `rocketicons init`
- [ ] `rocketicons search <terms>`
- [ ] `rocketicons list [collection]`
- [ ] `rocketicons info <icon>`
- [ ] `rocketicons add <icon...>` for one or many icons
- [ ] `rocketicons remove <icon...>`
- [ ] `rocketicons update [icon...]`
- [ ] `rocketicons doctor`
- [ ] `rocketicons config`

#### Agent-friendly behavior

- [ ] Add `--json` to every read command and mutation result.
- [ ] Add `--yes` for non-interactive execution.
- [ ] Add `--dry-run` with an exact file-change preview.
- [ ] Add `--cwd <path>` and never mutate outside the resolved project root.
- [ ] Add `--package-manager npm|pnpm|yarn|bun`, with safe automatic detection.
- [ ] Add `--catalog-version` or an equivalent reproducibility control.
- [ ] Use documented, stable exit codes.
- [ ] Write diagnostics to stderr and structured results to stdout.
- [ ] Make `init`, `add`, `remove`, and `update` idempotent.
- [ ] Support exact icon IDs, component names, and unambiguous search results.
- [ ] Return useful alternatives when an icon name is not found.
- [ ] Never require an interactive prompt when all required arguments are supplied.
- [ ] Avoid shell interpolation for paths and package commands.
- [ ] Use atomic writes and preserve unrelated user changes.

#### Project manifest and provenance

- [ ] Add a small project manifest such as `rocketicons.json`.
- [ ] Record catalog/package version, output path, platform, and installed icon IDs.
- [ ] Add a generated-file comment containing icon ID, collection, version, and license reference.
- [ ] Detect local modifications before overwriting generated icons.
- [ ] Provide a machine-readable diff when updating icons.
- [ ] Allow fully offline repeatable installation from a cached catalog.

#### Performance claims to measure

- [ ] Time to search and add one icon.
- [ ] Files and bytes added for one, ten, and one hundred icons.
- [ ] Shared runtime dependency size.
- [ ] Resulting web and React Native bundle impact.
- [ ] Comparison with importing from full icon packages, using reproducible fixtures.

### Milestone 4 — MCP server

Build the MCP server on the same application layer used by the CLI. Do not create separate search, resolution, or generation logic.

#### Recommended MCP tools

- [ ] `search_icons(query, collections?, variants?, limit?)`
- [ ] `get_icon(icon_id)`
- [ ] `get_icon_usage(icon_id, target, language?)`
- [ ] `list_collections()`
- [ ] `get_collection(collection_id)`
- [ ] `add_icons(icon_ids, project_path, dry_run?)`
- [ ] `remove_icons(icon_ids, project_path, dry_run?)`
- [ ] `inspect_project(project_path)`
- [ ] `doctor(project_path)`

#### Recommended MCP resources

- [ ] Catalog metadata and schema.
- [ ] Collection indexes.
- [ ] Documentation topics.
- [ ] License and attribution information.
- [ ] CLI configuration schema.

#### Delivery model

- [ ] Start with a local stdio MCP server distributed with the CLI or as a small sibling package.
- [ ] Make read-only discovery usable without initializing a project.
- [ ] Require an explicit project path for mutations.
- [ ] Restrict writes to the selected workspace.
- [ ] Return structured content plus a short human-readable summary.
- [ ] Expose dry-run results before file mutations.
- [ ] Consider a hosted read-only MCP server later; do not make local icon installation depend on a hosted service.
- [ ] Publish setup examples for Codex, Claude Code, VS Code, Cursor, and other clients only after verifying their current configuration formats.

### Milestone 5 — Expand `/ai/v1/`

The current catalog, collection indexes, and 500-icon shards are the correct base. Add discoverability and validation around them.

- [ ] Publish JSON Schema files for every public interface.
- [ ] Publish `/ai/v1/capabilities.json` describing versions and available resources.
- [ ] Publish a compact search index containing normalized names, aliases, tags, collection, component, and shard number.
- [ ] Add synonyms and semantic tags without changing stable icon IDs.
- [ ] Include license and upstream provenance at collection level.
- [ ] Publish checksums for catalog artifacts.
- [ ] Document cache behavior and immutable versioned snapshots.
- [ ] Consider `/ai/v1/versions/{packageVersion}/...` for reproducible historical access.
- [ ] Evaluate direct per-icon JSON resources against file count and Pages artifact cost; keep sharding if direct resources provide no measurable agent benefit.
- [ ] Provide small, valid request/response examples for every schema.
- [ ] Keep all functional references root-relative.

Do not add a fake query API to GitHub Pages. Search and resolution must either work from static indexes in the client or through the local CLI/MCP process.

### Milestone 6 — Search quality and icon semantics

Agents will prefer the catalog that helps them choose the correct icon, not merely the catalog with the most icons.

- [ ] Normalize names and common aliases, such as `delete`, `trash`, and `remove`.
- [ ] Add intent tags such as navigation, commerce, communication, status, files, and accessibility.
- [ ] Record visual properties such as filled, outlined, brand, directional, multicolor, and stroke support.
- [ ] Add negative guidance for easily confused icons.
- [ ] Support deterministic ranking and explain why a result matched.
- [ ] Allow collection and license filtering.
- [ ] Return a small diverse result set instead of hundreds of near-duplicates.
- [ ] Create a reviewed benchmark of common icon-selection requests.
- [ ] Measure top-1, top-5, and successful-install accuracy.

### Milestone 7 — Agent integration assets

- [ ] Provide an `AGENTS.md` snippet showing the preferred Rocketicons workflow.
- [ ] Provide a reusable skill/instruction package only after CLI and MCP contracts stabilize.
- [ ] Publish typed TypeScript clients for the static catalog if they reduce integration work.
- [ ] Publish an OpenAPI description only for real HTTP interfaces; do not describe nonexistent dynamic endpoints.
- [ ] Add copyable policies such as “reuse an installed icon before adding another.”
- [ ] Provide framework-specific verification commands.
- [ ] Add examples of safe automated replacement from another icon library.

### Milestone 8 — Reliability, trust, and governance

- [ ] Define schema compatibility and deprecation policies.
- [ ] Test duplicate IDs, missing source data, invalid SVG trees, licenses, aliases, and checksums.
- [ ] Test CLI output on macOS, Linux, and Windows.
- [ ] Test npm, pnpm, Yarn, and Bun projects.
- [ ] Test React DOM, Next.js, Vite, Expo, and React Native fixtures.
- [ ] Add supply-chain documentation and signed release provenance where practical.
- [ ] Document whether generated icon files require attribution for each collection.
- [ ] Add a process for upstream icon removals and license changes.
- [ ] Keep telemetry absent by default; document any future telemetry explicitly.

## What makes an agent prefer Rocketicons?

Preference should be earned through lower task cost and higher confidence:

1. The agent can discover Rocketicons through `llms.txt`, npm, GitHub, and normal web search.
2. It can search a compact catalog without loading thousands of SVG trees into context.
3. It receives stable IDs, previews, variants, licenses, and exact component names.
4. It can dry-run the installation.
5. One command installs only the selected icons.
6. The command returns structured evidence of the files changed.
7. The agent can run a documented verification command.
8. The generated project remains understandable and maintainable by a human.
9. The workflow works offline after the catalog is cached.
10. Benchmarks substantiate the size and performance claims.

## Suggested success metrics

- At least 90% top-5 relevance on the reviewed icon-search benchmark.
- At least 95% successful non-interactive installation across supported fixtures.
- Zero writes outside the selected workspace in CLI and MCP safety tests.
- Deterministic generated files across repeated runs and operating systems.
- A one-icon project imports no complete icon collection.
- Every CLI mutation supports `--dry-run` and `--json`.
- Every public machine schema has examples and automated compatibility tests.
- An agent can complete “find, add, use, and verify an icon” from a clean project using only the published instructions.

## Immediate next actions

1. Configure the custom domain and production `SITE_ORIGIN`, then verify the live Pages deployment.
2. Approve the canonical product message and terminology.
3. Rewrite the root README and English website Getting Started content.
4. Define CLI vNext commands, JSON envelopes, exit codes, and `rocketicons.json` schema.
5. Generate `/llms.txt`, `/llms-full.txt`, JSON Schemas, and `/ai/v1/capabilities.json` from version-controlled sources.
6. Extract shared catalog/search/install logic for both CLI and MCP.
7. Implement CLI search, batch add, `--json`, and `--dry-run` before building MCP mutations.
8. Build the local MCP server on those shared functions.
9. Create the first agent benchmark and run it in CI.

## Definition of done

Rocketicons is AI-first when a coding agent can independently:

1. Discover what Rocketicons does and why it is lightweight.
2. Search for an appropriate, licensed icon with little context usage.
3. Inspect the exact icon and usage contract.
4. Preview the intended project changes.
5. Add only the selected icon or icons.
6. Use them correctly in React or React Native.
7. Verify the result using deterministic commands.
8. Explain the resulting files and dependencies accurately to the user.

The goal is not merely to expose more AI endpoints. The goal is to make the complete icon-selection and installation task cheaper, safer, and more reliable than the alternatives.
