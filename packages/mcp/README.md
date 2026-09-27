# @rocketicons/mcp

Local MCP server for finding, inspecting, installing, and verifying Rocketicons.

Search thousands of open-source icons, then add only the icons your project uses. Rocketicons writes selected components into your source tree for React and React Native, with Tailwind-compatible styling. No full icon collection is imported into the application, and unused icons do not rely on tree-shaking to disappear.

## Configure an MCP client

Rocketicons runs locally over stdio with `npx -y @rocketicons/mcp`. Use Node.js 20 or newer, with `node` and `npx` available to the client. The client starts the server for you; no separate terminal process or global package installation is needed. The first launch needs internet access to download the package. Search uses Algolia when available and falls back to the bundled catalog offline.

For any client that supports local stdio MCP, set the command to `npx` and the arguments to `["-y", "@rocketicons/mcp"]`. Clients that only accept remote HTTP servers cannot use this command directly. No API key is required for the default search configuration. Project tools receive an explicit absolute `project_path` when called, so it is not part of the server configuration.

Merge these entries into existing configuration files without removing other servers. After saving, restart or reconnect the MCP server in your client. If startup reports that `npx` cannot be found, use its absolute path from `command -v npx` and ensure Node.js is available in the client's environment.

### Codex

Add this to `.codex/config.toml` in a trusted project, or `~/.codex/config.toml` to use it globally:

```toml
[mcp_servers.rocketicons]
command = "npx"
args = ["-y", "@rocketicons/mcp"]
startup_timeout_sec = 60
```

The 60-second startup timeout gives the first download more time. Restart Codex and use `/mcp` to check the connection. See the [Codex MCP documentation](https://developers.openai.com/codex/mcp).

### Cursor

Add this to `.cursor/mcp.json` in your project, or `~/.cursor/mcp.json` globally:

```json
{
  "mcpServers": {
    "rocketicons": {
      "command": "npx",
      "args": ["-y", "@rocketicons/mcp"]
    }
  }
}
```

Check that Rocketicons is enabled and connected in Cursor's MCP settings. See the [Cursor MCP documentation](https://cursor.com/docs/mcp).

### Claude Code

Add this directly to `.mcp.json` at the project root:

```json
{
  "mcpServers": {
    "rocketicons": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@rocketicons/mcp"]
    }
  }
}
```

Alternatively, run this from the project directory:

```bash
claude mcp add --scope project --transport stdio rocketicons -- npx -y @rocketicons/mcp
```

Use `--scope user` instead for all your projects. Restart Claude Code, approve the project server when prompted, and use `/mcp` to check the connection. These instructions are for Claude Code. See the [Claude Code MCP documentation](https://code.claude.com/docs/en/mcp).

### Check the connection

Ask your agent:

> Use Rocketicons MCP to find five food icons from the same collection and compare them visually. Do not change project files.

Search and SVG inspection do not require project initialization. To install components later, ask the agent to inspect the project and use `plan_icons` before `apply_icons`.

For repository development, build the toolkit, MCP, and CLI packages, then run `npx --no-install rocketicons mcp` from the repository root. The published CLI also exposes `npx -y rocketicons mcp`.

Search uses the public Algolia index when available and a bundled local semantic index when offline. The package bundles the same public search-only credentials used by rocketicons.com, so local MCP search can query Algolia without project setup. It first checks `/ai/v1/search-config.json` for updated public credentials. Set `ROCKETICONS_ALGOLIA_APP_ID` and `ROCKETICONS_ALGOLIA_SEARCH_KEY` to override them; never use an indexing key. Every Algolia result is resolved against the bundled catalog and checked against the requested filters. If the index offers an icon this package cannot add, search falls back locally.

Use `search_icons` with a `collections` filter to keep icon style consistent. Given a project path and an intent, `recommend_icons` checks installed icons for reuse and searches the collections already used in the project; each result includes Web and React Native usage. Pass `from_file` to get an import relative to the source file you are editing. Missing managed icons are marked `repair`; customized icons are offered for reuse and protected from regeneration. Pass up to five exact IDs to `compare_icons` to see their shapes together in a labeled PNG; the response also links each SVG.

For a plain HTML site or another framework, call `search_icons`, inspect an exact candidate with `get_icon`, then call `get_icon_svg` with its ID. The tool returns complete SVG markup as text and in `structuredContent.svg`, with license details. Embed the markup inline in HTML or save it as an `.svg` asset. This read-only path works offline and requires no project setup, React package, or Rocketicons configuration. The `rocketicons://icons/{collectionId}/{iconId}/svg` resource returns the same markup.

Every MCP tool advertises an output schema for its structured success result. Tool failures set `isError: true` and return `structuredContent.error` with `code`, `message`, and `nextStep`. The text content repeats that guidance for clients that do not use structured content. For example, an unknown icon returns `ICON_NOT_FOUND` and suggests calling `search_icons` with an exact ID.

To add icons, call `plan_icons` with exact IDs, `project_path`, and `from_file` pointing to an existing source file. Review `fileChanges`, `toInstall`, and `dependencyEffects`, then call `apply_icons` with the returned `planId` and the same inputs. Apply checks that the plan is current, runs setup and batch addition, then reports `doctor` verification and import statements relative to `from_file`. `apply_icons` also supports `dry_run: true`. The existing `init_project` and `add_icons` tools remain available for separate setup and addition. `get_icon_usage` returns a resolvable import when both `project_path` and `from_file` are provided; without them, it returns a path and JSX example without guessing an import alias.

Generated icon components belong to the project and can be edited. `inspect_project` marks a non-formatting edit as `customized`; `doctor` lists customized IDs without treating them as setup failures. `recommend_icons` can reuse them, while `plan_icons` reports them in `preservedIcons` and includes their current file hashes in the plan ID. Add and apply leave those files untouched. `remove_icons` refuses to delete a customized component. Formatting-only changes are ignored by a code-aware hash calculated in memory; neither Rocketicons nor the hash check reformats the project file.

In Tailwind CSS 4 web projects, setup registers `@rocketicons/tailwind` in the active stylesheet with `@plugin`, and plans include that CSS edit. `doctor` reports the Tailwind version, stylesheet path, whether it is imported by application code, plugin registration, and Vite or PostCSS build integration. If multiple Tailwind stylesheets are active, pass the same `stylesheet_path` to `plan_icons` and `apply_icons` (or to `init_project`). React Native styling setup remains separate.

Setup requires compatible published `@rocketicons/utils` and `@rocketicons/tailwind` versions (0.7.0 or newer) when the project does not already have them. Plans list the exact managed file paths and dependency packages. A package manager determines the final contents of `package.json` and its lockfile during installation; the plan lists those files and its cache and `node_modules` effects before apply.
When `project_path` is inside a parent npm, Yarn, Bun, or pnpm workspace, install missing dependencies with that workspace's package manager first. Rocketicons rejects an automatic install there because the package manager may change files outside `project_path`; setup and icon addition work after the dependencies are declared in the project package.
