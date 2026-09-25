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

## Current limits

The current release:

- Uses the fixed `src/ri` directory and `@/ri/*` alias.
- Dry-run setup previews package and lockfile effects, but the package manager determines the exact lockfile diff when dependencies are installed.

Review and commit generated files and `rocketicons.json`.

See the [Rocketicons documentation](https://rocketicons.com/en/docs/getting-started/) and [machine-readable guide](https://rocketicons.com/llms.txt).
