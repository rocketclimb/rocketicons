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
- [x] Add the static-site build and deployment workflow (currently Cloudflare Pages).
- [x] Configure the custom hostname, DNS, and production `SITE_ORIGIN`, and verify the live deployment.

## Roadmap maintenance

This file is the source of truth for AI-first product progress.

**Last audited against the implementation:** 2026-09-23

Checkbox meaning:

- `[x]` — implemented and verified.
- `[ ]` — not complete; **Partial:** and **Deferred:** notes explain intentional intermediate states.

- Update this roadmap in the same pull request or commit that completes, changes, defers, or removes a roadmap item.
- Mark an item complete only after its implementation and proportionate verification are present in the repository or, for deployment work, verified in the target environment.
- Keep partially completed work unchecked and add a short **Partial:** note describing what remains.
- Add newly discovered follow-up work to the appropriate milestone instead of relying only on issues, pull-request descriptions, or chat history.
- When implementation changes the delivery model or terminology, update the affected roadmap text rather than preserving obsolete wording.
- During roadmap reviews, compare the checkboxes with the implementation and correct any drift.

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

- [x] Rewrite the home page around the “add only what you use” workflow.
- [x] Rewrite Getting Started to lead with the CLI workflow.
- [x] Rewrite Adding Icons with copy-pasteable CLI examples and generated-file examples.
- [x] Update the root README and package READMEs.
- [x] Display the generated Rocketicons/catalog version and content update date where useful.
- [x] Remove old statements implying that users must import the complete `rocketicons` package.
- [x] Document the shared runtime/Tailwind dependencies installed by `init`.
- [x] Add React, Next.js, Vite, Expo, and React Native quick starts.
- [x] Document JavaScript and TypeScript output where supported.
- [x] Explain when users should commit generated icon files.
- [x] Add migration instructions from `react-icons` and similar packages.
- [x] Add an honest comparison page covering installed size, application bundle behavior, platform support, styling, and offline use.
- [x] Replace all stale website and Ignition deployment instructions, including the old Vercel deployment text.

#### Establish one canonical message

Use a consistent short explanation across the website, npm, GitHub, `llms.txt`, MCP, and CLI help:

> Search thousands of open-source icons, then add only the icons your project uses. Rocketicons writes selected components into your source tree for React and React Native, with Tailwind-compatible styling. No full icon collection is imported into the application, and unused icons do not rely on tree-shaking to disappear.

**Progress:** the website, GitHub/npm READMEs, LLM discovery files, CLI help, and MCP package documentation use this message.

#### Publish LLM discovery files

Use the established plural filename as the canonical entry point:

- [x] `/llms.txt` — concise project summary, recommended workflow, primary documentation links, catalog links, CLI commands, MCP instructions, and licensing guidance.
- [x] `/llms-full.txt` — optional consolidated documentation for tools that want a larger context document.
- [ ] `/llm.txt` — optional compatibility copy or redirect only if real clients are found to request the singular form.
- [x] Reference `/llms.txt` from the HTML metadata and human documentation where appropriate.
- [x] Generate both language-neutral machine files from source content during the static build.
- [x] Keep these files concise enough to avoid wasting agent context.

#### Add agent-oriented examples

- [x] “Find an icon and add it” end-to-end example.
- [ ] Batch icon installation example. **Deferred:** the current CLI accepts one icon per command; the documentation shows a safe repeated-command workflow until batch add lands.
- [x] React and React Native rendering examples.
- [x] Tailwind color, size, dark-mode, and state examples.
- [x] A verification example showing exactly which files should be created.
- [x] An example prompt that tells an agent to use Rocketicons without embedding private assumptions.

### Milestone 3 — CLI vNext

The CLI is the most important agent interface because it performs the useful project change.

#### Command design

- [x] `rocketicons init`
- [x] `rocketicons search <terms>`
- [x] `rocketicons list [collection]`
- [x] `rocketicons info <icon>`
- [x] `rocketicons add <icon...>` for one or many icons
- [x] `rocketicons remove <icon...>`
- [ ] `rocketicons update [icon...]`
- [x] `rocketicons doctor`
- [x] `rocketicons config`
- [x] `rocketicons mcp` starts the local stdio server from the CLI package.

#### Agent-friendly behavior

- [x] Add `--json` to every read command and mutation result.
- [x] Add `--yes` for non-interactive execution.
- [ ] Add `--dry-run` with an exact file-change preview. **Partial:** generated-file changes are exact; package-manager lockfile effects are identified but their exact diff is only known after install.
- [x] Add `--cwd <path>` and never mutate outside the resolved project root.
- [ ] Add `--package-manager npm|pnpm|yarn|bun`, with safe automatic detection. **Partial:** detection and command routing are implemented; live installation fixtures for pnpm, yarn, and bun remain.
- [ ] Publish compatible `@rocketicons/utils` and `@rocketicons/tailwind` runtime versions before promoting init. **Partial:** setup now requests version 0.7.0 or newer; the current npm `@rocketicons/tailwind@0.2.6` depends on `@rocketclimb/tw-utils` from GitHub Packages and failed a clean npm initialization without credentials.
- [x] Add `--catalog-version` or an equivalent reproducibility control. `rocketicons.json` pins the catalog version and rejects mismatched add operations.
- [ ] Use documented, stable exit codes.
- [x] Write diagnostics to stderr and structured results to stdout.
- [ ] Make `init`, `add`, `remove`, and `update` idempotent. **Partial:** init, add, and remove are verified; update is not implemented.
- [x] Support exact icon IDs, component names, and unambiguous search results. Collection-qualified IDs disambiguate duplicate IDs across collections.
- [ ] Return useful alternatives when an icon name is not found.
- [x] Never require an interactive prompt when all required arguments are supplied.
- [x] Avoid shell interpolation for paths and package commands.
- [x] Use atomic writes and preserve unrelated user changes.

#### Project manifest and provenance

- [x] Add a small project manifest such as `rocketicons.json`.
- [x] Record catalog/package version, output path, platform, and installed icon IDs.
- [x] Add a generated-file comment containing icon ID, collection, version, and license reference.
- [x] Detect local modifications before overwriting generated icons.
- [x] Hash a code-aware normalized copy of generated icon components so formatting-only edits remain current; report other edits as reusable, protected customizations in CLI and MCP workflows. Legacy byte hashes remain readable.
- [ ] Provide a machine-readable diff when updating icons.
- [ ] Allow fully offline repeatable installation from a cached catalog. **Partial:** catalog and SVG assets are bundled and icon addition is offline; first-time runtime dependency installation still needs published compatible packages or an existing cache.

#### Performance claims to measure

- [ ] Time to search and add one icon.
- [ ] Files and bytes added for one, ten, and one hundred icons.
- [ ] Shared runtime dependency size.
- [ ] Resulting web and React Native bundle impact.
- [ ] Comparison with importing from full icon packages, using reproducible fixtures.

### Milestone 4 — MCP server

Build the MCP server on the same toolkit layer used by the CLI. Do not create separate search, resolution, or generation logic.

#### Recommended MCP tools

- [x] `search_icons(query, collections?, variants?, limit?)`
- [x] `recommend_icons(project_path, intent, from_file?, limit?)` checks installed icons for reuse, searches existing project collections first, and returns Web and React Native usage. An optional source file makes imports relative and resolvable.
- [x] `get_icon(icon_id)`
- [x] `get_icon_svg(icon_id)` returns complete SVG markup from bundled icon data for HTML and other non-React projects without setup.
- [x] `compare_icons(icon_ids)` returns an offline visual contact sheet for up to five exact icons, with cell metadata and SVG links.
- [x] `get_icon_usage(icon_id, target?, language?, project_path?, from_file?)` returns a resolvable relative import when given a project and source file, without guessing an alias otherwise.
- [x] `plan_icons(project_path, icon_ids, from_file, ...)` previews exact managed paths and hashes, dependencies, and package-manager effects without writes.
- [x] `apply_icons(project_path, icon_ids, plan_id, from_file, ..., dry_run?)` rejects stale plans, applies setup and batch addition, and verifies the files and project health in TS/JS React and React Native fixtures.
- [x] `list_collections()`
- [x] `get_collection(collection_id)`
- [x] `add_icons(icon_ids, project_path, dry_run?)`
- [x] `remove_icons(icon_ids, project_path, dry_run?)`
- [x] `inspect_project(project_path)`
- [x] `doctor(project_path)`
- [x] Treat edited installed components as project-owned customizations: `inspect_project` and `doctor` report them, recommendations reuse them, and add/plan preserve them while removal stays protected.
- [x] Register the Rocketicons plugin automatically in an existing Tailwind CSS 4 web stylesheet; include the CSS edit in dry runs and plans, and diagnose missing web styling integration. React Native styling configuration remains separate.
- [ ] `init_project(project_path, target?, language?, package_manager?, stylesheet_path?, dry_run?)`. **Partial:** file setup and dry runs pass TS/JS React/React Native fixtures, including Tailwind 4 web stylesheet registration; a clean real npm install waits on compatible runtime package publication.

#### Recommended MCP resources

- [x] Catalog metadata and schema.
- [x] Collection indexes.
- [x] Documentation topics.
- [x] License and attribution information.
- [x] CLI configuration schema.

#### Delivery model

- [ ] Start with a local stdio MCP server distributed with the CLI or as a small sibling package. **Partial:** `@rocketicons/mcp` is implemented and tested over stdio, and the CLI exposes `rocketicons mcp`; npm publication remains.
- [x] Make read-only discovery usable without initializing a project.
- [x] Require an explicit project path for mutations.
- [x] Restrict writes to the selected workspace.
- [x] Return structured content plus a short human-readable summary.
- [x] Advertise output schemas for every MCP tool and return structured errors with actionable next steps and a text fallback.
- [x] Expose dry-run results before file mutations.
- [ ] Consider a hosted read-only MCP server later; do not make local icon installation depend on a hosted service.
- [ ] Publish setup examples for Codex, Claude Code, VS Code, Cursor, and other clients only after verifying their current configuration formats.
- [x] Validate Algolia icon IDs and requested filters against the bundled catalog before returning results. This keeps older installed MCP versions from offering icons they cannot add when the shared Algolia index moves to a newer release; unknown hits trigger local fallback. Per-record catalog versioning was removed because the index contains only the current release.
- [ ] Deploy `/ai/v1/search-config.json` with a public search-only key. **Partial:** the package bundles the existing browser-visible search-only credentials, and live MCP searches for `food` return Algolia results with collection and variant filters. The public config endpoint still returns 404.
- [ ] Extend the release pipeline to publish `@rocketicons/utils`, `@rocketicons/tailwind`, `@rocketicons/toolkit`, and `@rocketicons/mcp` in dependency order before the `rocketicons` package. **Partial:** the cut and publish workflows are updated, but a live release and npm trusted publishing configuration for the scoped packages remain unverified; this local host has no npm publish credentials.
- [ ] Expand the scored search benchmark beyond the initial 15 Feather cases and measure live Algolia relevance. **Partial:** the local top-5 benchmark passes 14 of 15 English and PT-BR requests.

### Milestone 5 — Expand `/ai/v1/`

The current catalog, collection indexes, and 500-icon shards are the correct base. Add discoverability and validation around them.

- [ ] Publish JSON Schema files for every public interface. **Partial:** schemas now cover capabilities and icon-context index/data envelopes; the catalog, collection index, and SVG shard interfaces still need published schemas.
- [x] Publish `/ai/v1/capabilities.json` describing versions and available resources.
- [ ] Publish a compact search index containing normalized names, aliases, tags, collection, component, and shard number. **Partial:** a 48,590-icon compact index is generated and bundled with the local application/MCP packages; the public `/ai/v1/` artifact remains pending.
- [ ] Add synonyms and semantic tags without changing stable icon IDs. **Partial:** reviewed English and PT-BR semantics cover all 219 Weather Icons, 189 Simple Line Icons, 287 Feather Icons, 352 Go Icons, 192 Devicons, 332 Radix Icons, 288 Circum Icons, 329 Flat Color Icons, 1 Rocketicons icon, 336 Typicons, 352 Themify Icons, 653 VS Code Codicons, 460 Heroicons, 972 Heroicons 2, 491 IcoMoon Free icons, 637 Grommet Icons, 704 css.gg icons, 696 Ionicons, and 848 Ant Design Icons (8,338 total across 19 of 32 collections). BoxIcons and Font Awesome 5 have complete generated coverage for 1,634 and 1,611 bindings respectively, validated structurally and in the dry-run index; per-family human semantic review remains outstanding. The other 11 collections remain pending.
- [x] Include license and upstream provenance at collection level.
- [ ] Publish checksums for catalog artifacts. **Partial:** icon-context chunks publish SHA-256 checksums; the catalog, collection indexes, and SVG shards remain pending.
- [ ] Document cache behavior and immutable versioned snapshots.
- [ ] Consider `/ai/v1/versions/{packageVersion}/...` for reproducible historical access.
- [ ] Evaluate direct per-icon JSON resources against file count and static-hosting artifact cost; keep sharding if direct resources provide no measurable agent benefit.
- [ ] Provide small, valid request/response examples for every schema.
- [x] Keep all functional references root-relative.

Do not add a fake query API to static hosting. Search and resolution must either work from static indexes in the client or through the local CLI/MCP process.

### Milestone 6 — Search quality and icon semantics

Agents will prefer the catalog that helps them choose the correct icon, not merely the catalog with the most icons.

- [x] Add a local, manually triggered enrichment workflow with bounded batches, resumable runs, source/prompt hashes, visual contact sheets, bilingual validation, deterministic quality audits, review gates, confirmed force regeneration, and a consolidated local verification command.
- [x] Complete and verify the Weather Icons pilot: 219 icons represented by 171 reviewed semantic families with complete current-source coverage.
- [ ] Roll reviewed semantic metadata out to the remaining collections, prioritizing small and high-usage collections. **Partial:** Weather Icons, Simple Line Icons, Feather Icons, Go Icons, Devicons, Radix Icons, Circum Icons, Flat Color Icons, Rocketicons, Typicons, Themify Icons, VS Code Codicons, Heroicons, Heroicons 2, IcoMoon Free, Grommet Icons, css.gg, Ionicons, Ant Design Icons, BoxIcons, Font Awesome 5, and Lucide have reviewed metadata for 13,631 icon bindings across 22 of 32 collections. Lucide has 2,047 bilingual semantic families verified against lockfile-installed `lucide-static` 1.41.0, with no missing or stale bindings. Font Awesome 5 is verified against pinned Git revision `afecf2af5d897b763e5e8e28d46aad2f710ccad6`; Ant Design is verified against pinned Git revision `7f2516ac91226d2b41f93b35cb5197c8d94f7189`; Heroicons 2 is verified against pinned revision `616b7a4dbbf3d011760af8066262cd5c6b3868f3`; Go is verified against the lockfile-installed Octicons 19.34.0 catalog; Radix, Codicons, and Grommet are verified against their current pinned revisions.
- [x] Refresh Go and Radix metadata against the current clean-build catalog.
- [ ] Normalize names and common aliases, such as `delete`, `trash`, and `remove`. **Partial:** implemented and materialized per icon for Weather Icons, Simple Line Icons, Feather Icons, Go Icons, Devicons, Radix Icons, Circum Icons, Flat Color Icons, Rocketicons, Typicons, Themify Icons, VS Code Codicons, Heroicons, Heroicons 2, IcoMoon Free, Grommet Icons, css.gg, Ionicons, and Lucide.
- [ ] Add intent tags such as navigation, commerce, communication, status, files, and accessibility. **Partial:** bilingual categories, search terms, and UI contexts are available in the generated catalog and validated for indexing for Weather Icons, Simple Line Icons, Feather Icons, Go Icons, Devicons, Radix Icons, Circum Icons, Flat Color Icons, Rocketicons, Typicons, Themify Icons, VS Code Codicons, Heroicons, Heroicons 2, IcoMoon Free, Grommet Icons, css.gg, Ionicons, Ant Design Icons, and Lucide.
- [ ] Record visual properties such as filled, outlined, brand, directional, multicolor, and stroke support. **Partial:** deterministic properties are generated for enriched Weather Icons, Simple Line Icons, Feather Icons, Go Icons, Devicons, Radix Icons, Circum Icons, Flat Color Icons, Rocketicons, Typicons, Themify Icons, VS Code Codicons, Heroicons, Heroicons 2, IcoMoon Free, Grommet Icons, css.gg, Ionicons, Ant Design Icons, BoxIcons, and Lucide.
- [ ] Add negative guidance for easily confused icons. **Partial:** supported by the schema and present for ambiguous Weather Icons, Simple Line Icons, Feather Icons, Go Icons, Devicons, Radix Icons, Circum Icons, Flat Color Icons, Rocketicons, Typicons, Themify Icons, VS Code Codicons, Heroicons, Heroicons 2, IcoMoon Free, Grommet Icons, css.gg, Ionicons, and Lucide; negative terms are intentionally excluded from Algolia's positive search attributes.
- [ ] Support deterministic ranking and explain why a result matched. **Partial:** local search has deterministic scoring and a related-word fallback; MCP search now fetches a larger Algolia candidate pool, ranks those hits against bundled catalog fields, and gives field-specific reasons with available icon descriptions. Live top-five relevance and ranking remain unbenchmarked.
- [ ] Allow collection and license filtering.
- [ ] Return a small diverse result set instead of hundreds of near-duplicates.
- [ ] Create a reviewed benchmark of common icon-selection requests. **Partial:** collection-wide semantic invariants, unrelated alias leakage, 40 bilingual intent cases across earlier collections, and an initial 15-case scored Feather corpus are covered; a representative multi-collection scored corpus remains pending.
- [ ] Measure top-1, top-5, and successful-install accuracy.

### Milestone 7 — Agent integration assets

- [ ] Provide an `AGENTS.md` snippet showing the preferred Rocketicons workflow.
- [ ] Provide a reusable skill/instruction package only after CLI and MCP contracts stabilize.
- [ ] Publish typed TypeScript clients for the static catalog if they reduce integration work.
- [ ] Publish an OpenAPI description only for real HTTP interfaces; do not describe nonexistent dynamic endpoints.
- [x] Add copyable policies such as “reuse an installed icon before adding another.”
- [ ] Provide framework-specific verification commands.
- [ ] Add examples of safe automated replacement from another icon library.

### Milestone 8 — Reliability, trust, and governance

- [ ] Define schema compatibility and deprecation policies.
- [ ] Test duplicate IDs, missing source data, invalid SVG trees, licenses, aliases, and checksums. **Partial:** icon-context tests now cover duplicate and conflicting aliases, positive/negative term conflicts, stale and orphaned bindings, and strict source/public JSON size limits.
- [ ] Preserve Grommet child fill colors during SVG conversion. **Follow-up:** generated glyphs such as `gr-figma`, `gr-slack`, and `gr-zoom` lose source color or cutout details; enrichment review used the pinned upstream SVGs for these cases. Contact sheets now preserve root attributes, variant strokes, and isolated SVG definition IDs, with rendering regressions covered.
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

1. Roll reviewed semantic metadata out to additional small collections and create the first icon-selection benchmark. **Latest verified additions:** Ant Design Icons (848 bindings on `develop`) and Heroicons 2 (972 current icon bindings represented by 648 reviewed semantic families).
2. Publish the remaining `/ai/v1/` JSON Schemas and a compact semantic search index.
3. Publish a complete `rocketicons.json` schema and stable CLI exit codes; make dependency-install dry runs precise enough to review lockfile changes.
4. Verify pnpm, yarn, and bun initialization in real project fixtures and keep the shared toolkit layer aligned with the CLI and MCP.
5. Deploy the public search-only Algolia configuration, reindex with catalog versions, and verify collection-filtered online search.
6. Publish compatible runtime packages, then `@rocketicons/toolkit` and `@rocketicons/mcp`; verify a clean npm initialization and client setup examples against current configuration formats.

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
