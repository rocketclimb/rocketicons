# @rocketicons/cli

The Rocketicons CLI writes selected icon components into an application's source tree. Your project compiles only the icons it chooses instead of importing a complete collection.

## Current commands

Initialize an existing TypeScript project:

```bash
npx @rocketicons/cli init
```

This command expects `tsconfig.json`, configures `@/ri/*`, creates `src/ri/core` and `src/ri/icons`, and installs `@rocketicons/utils` and `@rocketicons/tailwind` through npm.

Add one exact icon ID:

```bash
npx @rocketicons/cli add @rc/rc-rocket-icon
```

The generated component is written to `src/ri/icons/rc-rocket-icon.tsx`.

List collections or icons:

```bash
npx @rocketicons/cli list
npx @rocketicons/cli list @rc
```

## Current limits

The current release:

- Generates TypeScript/TSX only.
- Uses the fixed `src/ri` directory and `@/ri/*` alias.
- Adds one icon per command.
- Uses npm during initialization.
- Does not yet provide JSON output, dry runs, configurable working directories, batch arguments, or MCP tools.

Review and commit generated files. Adding an existing icon again overwrites its target file, so preserve local customizations first.

See the [Rocketicons documentation](https://rocketicons.com/en/docs/getting-started/) and [machine-readable guide](https://rocketicons.com/llms.txt).
