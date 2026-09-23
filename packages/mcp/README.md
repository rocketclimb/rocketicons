# @rocketicons/mcp

Local MCP server for finding, inspecting, installing, and verifying Rocketicons.

Search thousands of open-source icons, then add only the icons your project uses. Rocketicons writes selected components into your source tree for React and React Native, with Tailwind-compatible styling. No full icon collection is imported into the application, and unused icons do not rely on tree-shaking to disappear.

Requires Node.js 20 or newer. After npm publication, configure an MCP client with command `npx` and arguments `-y`, `rocketicons`, `mcp`. The dedicated `npx -y @rocketicons/mcp` command also works. From this repository before publication, build `@rocketicons/toolkit`, `@rocketicons/mcp`, and `@rocketicons/cli`, then use `npx --no-install rocketicons mcp` from the repository root. Both commands run over stdio.

Search uses the public Algolia index when available and a bundled local semantic index when offline. The package bundles the same public search-only credentials used by rocketicons.com, so local MCP search can query Algolia without project setup. It first checks `/ai/v1/search-config.json` for updated public credentials. Set `ROCKETICONS_ALGOLIA_APP_ID` and `ROCKETICONS_ALGOLIA_SEARCH_KEY` to override them; never use an indexing key. Every Algolia result is resolved against the bundled catalog and checked against the requested filters. If the index offers an icon this package cannot add, search falls back locally.

Use `search_icons` with a `collections` filter to keep icon style consistent. Inspect a result with `get_icon` and its SVG resource. Call `init_project` explicitly, then `add_icons` with `dry_run: true` before adding exact IDs. `get_icon_usage` returns the generated import. `doctor` checks project health, and `remove_icons` removes managed components.

`init_project` requires compatible published `@rocketicons/utils` and `@rocketicons/tailwind` versions (0.7.0 or newer) when the project does not already have them. It accepts an absolute `project_path` and does not initialize a project as a side effect of `add_icons`.
