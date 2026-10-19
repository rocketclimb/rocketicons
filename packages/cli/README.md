# @rocketicons/cli

The Rocketicons CLI writes selected icon components into an application's source tree. Your project compiles only the icons it chooses instead of importing a complete collection.

## Current commands

Initialize an existing React or React Native project:

```bash
npx rocketicons init
```

This command detects TS or JS, configures `@/ri/*`, creates `src/ri/core` and `src/ri/icons`, and installs shared dependencies with the detected package manager. Use `--target react-native` or `--language js` to override detection.

Search, preview, and add exact icon IDs:

```bash
npx rocketicons search calendar --collection fi --json
npx rocketicons add @fi/fi-calendar @fi/fi-clock --dry-run --json
npx rocketicons add @fi/fi-calendar @fi/fi-clock
```

The generated components are written under `src/ri/icons`. `rocketicons.json` records their catalog version, paths, and hashes. Edited generated files are never overwritten or removed silently.

List collections or icons:

```bash
npx rocketicons list
npx rocketicons list @rc
```

Other commands include `info`, `usage`, `remove`, `doctor`, and `config`. Use `--cwd <absolute path>` to select a project. Collection-qualified IDs (`@collection/icon-id`) resolve collisions between collections.

Start the MCP server with `npx -y rocketicons mcp` after publication. From this checkout, build the CLI and MCP workspaces and use `npx --no-install rocketicons mcp`.

## Upgrade an existing project

Catalog upgrades require `@rocketicons/mcp@0.3.0` / `@rocketicons/toolkit@0.3.0` or newer (use a published release containing these versions, or build this checkout). When `CATALOG_MISMATCH` occurs:

1. Call `plan_project_upgrade` with `project_path` and review `fromCatalogVersion`, `toCatalogVersion`, `nextManifest`, `fileChanges`, `preservedIcons`, and diagnostics.
2. Call `apply_project_upgrade` with the same `project_path` and returned `planId` as `plan_id`. Set `dry_run: true` to preview without writing.
3. Retry `plan_icons` / `apply_icons` and run `doctor`.

The upgrade writes only `rocketicons.json`. Existing components, paths, hashes, and license records are preserved; each icon keeps its original catalog version. Missing files and unrelated setup issues remain visible. Removed catalog icons remain usable from their saved files, but missing ones must be restored from source control or their original catalog package. New additions and repairs use the installed catalog. Upgrades reject stale plans and downgrades. Repeating an upgrade to the current catalog makes no changes.

CLI equivalent (from the project root):

```sh
npx rocketicons upgrade --dry-run --json
npx rocketicons upgrade --plan-id <planId> --json
```

This migrates catalog metadata; it does not regenerate existing icons or upgrade runtime/core files. Commit the updated manifest with your project. Do not delete the setup or manually replace its catalog version.

## Current limits

The current release:

- Uses the fixed `src/ri` directory and `@/ri/*` alias.
- Dry-run setup previews package and lockfile effects, but the package manager determines the exact lockfile diff when dependencies are installed.

Review and commit generated files and `rocketicons.json`.

See the [Rocketicons documentation](https://rocketicons.com/en/docs/getting-started/) and [machine-readable guide](https://rocketicons.com/llms.txt).
