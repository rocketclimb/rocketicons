<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/rocketclimb/rocketicons/develop/packages/ignition/public/logo-rocketicons-white-nobg-512.png">
  <img alt="Rocketicons" src="https://raw.githubusercontent.com/rocketclimb/rocketicons/develop/packages/ignition/public/logo-rocketicons-black-nobg-512.png">
</picture>

# Rocketicons

Search thousands of open-source icons, then add only the icons your project uses. Rocketicons writes selected components into your source tree for React and React Native, with Tailwind-compatible styling. No full icon collection is imported into the application, and unused icons do not rely on tree-shaking to disappear.

## Why Rocketicons?

Most icon libraries install a package containing a complete collection. Rocketicons takes a different route: choose an icon, run the CLI, and receive one local component that your application owns and compiles.

- Minimal by construction: selected icons become local source files.
- React and React Native: share the same component API across web and native projects.
- Tailwind-compatible: style color, size, dark mode, and states with familiar classes.
- Reviewable and repeatable: generated files can be inspected and committed with your feature.
- Agent-friendly discovery: browse the versioned static catalog starting at `/ai/v1/catalog.json`.

Initialization still installs the shared `@rocketicons/utils` and `@rocketicons/tailwind` dependencies. Rocketicons is precise about that tradeoff: selected icon source stays local, while common rendering and styling behavior remains shared.

## Quick start

The current CLI requires an existing TypeScript project with `tsconfig.json` and uses npm during initialization.

```bash
npx @rocketicons/cli init
npx @rocketicons/cli add @rc/rc-rocket-icon
```

Then import the generated component:

```tsx
import RcRocketIcon from "@/ri/icons/rc-rocket-icon";

export function LaunchButton() {
  return <RcRocketIcon className="icon-sky-500-lg dark:icon-white-lg" />;
}
```

The CLI currently writes TSX to `src/ri`, configures the `@/ri/*` alias, and adds one icon per command. Run `add` repeatedly when you need a small set.

Commit `src/ri` with your application so collaborators, CI, deployments, and offline builds use the same icon source.

## Documentation and machine discovery

- Website and icon explorer: [rocketicons.com](https://rocketicons.com)
- Getting Started: [rocketicons.com/en/docs/getting-started](https://rocketicons.com/en/docs/getting-started/)
- Machine-readable project guide: [rocketicons.com/llms.txt](https://rocketicons.com/llms.txt)
- Static catalog: [rocketicons.com/ai/v1/catalog.json](https://rocketicons.com/ai/v1/catalog.json)

MCP support and agent-oriented CLI flags are planned roadmap work; they are not part of the current CLI.

## Monorepo packages

- `@rocketicons/cli` — initializes projects and writes selected icon components.
- `rocketicons` — generated catalog data and legacy package exports.
- `@rocketicons/utils` — shared component utilities.
- `@rocketicons/tailwind` — Tailwind integration.
- `@rocketicons/core` and `@rocketicons/generator` — generation pipeline.
- `ignition` — the statically exported website.

## Development

Install dependencies and run workspace checks from the repository root:

```bash
npm install
npm run test-all
npm run lint-all
npm run build-all
```

Website-specific development commands live in [packages/ignition/README.md](packages/ignition/README.md).

## License

Rocketicons is released under the [MIT License](LICENSE). Included icon collections retain their upstream licenses; review the collection metadata and license URL before use.
