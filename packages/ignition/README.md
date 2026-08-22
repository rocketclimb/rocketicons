# Rocketicons website (Ignition)

Ignition is the statically exported Rocketicons website. It publishes localized English and Brazilian Portuguese pages, the versioned catalog under `/ai/v1/`, sitemaps, and the generated `/llms.txt` discovery files.

## Local development

From `packages/ignition`:

```bash
npm run dev
```

The pre-development step generates content collections and static assets. Open [http://localhost:3000](http://localhost:3000).

Useful commands:

```bash
npm run generate-content-collections
npm run generate-statics
npm test
npm run lint
npm run build
```

Use `SITE_ORIGIN` for the complete public deployment URL. Both root and path-based deployments are supported:

```bash
SITE_ORIGIN=https://rocketicons.com npm run build
SITE_ORIGIN=https://rocketclimb.github.io/rocketicons npm run build
```

The configured pathname becomes the Next.js base path and is added to generated catalog, discovery, sitemap, and browser-fetch URLs.

## Algolia search

Copy `.env.example` to `.env` for local search. The two `NEXT_PUBLIC_` values are embedded in the static browser bundle, so the API key must be search-only and the index must contain public data. Where practical, restrict that key to the `rocketicons` index and add a per-IP rate limit. `ALGOLIA_INDEXING_API_KEY` must remain server/CI-only.

The production workflow stores the application ID and restricted search-only key as GitHub Actions variables (`ALGOLIA_APPLICATION_ID` and `ALGOLIA_SEARCH_ONLY_API_KEY`). It stores the indexing key as the `ALGOLIA_INDEXING_API_KEY` Actions secret. After a successful production build, the workflow atomically replaces the shared `rocketicons` index before deploying the Cloudflare Pages export.

To regenerate and synchronize the complete catalog locally:

```bash
npm run generate-content-collections
npm run generate-statics:all-icons
npm run indexer -- --dry-run
npm run indexer
```

## Content principles

Preserve the existing UI and write copy that is upbeat, concise, and technically exact. The recommended product message is “add only what you use”: the CLI writes selected icon components into the application's source tree. Do not present full-package imports, unsupported CLI flags, or future MCP tools as current behavior.

See [CONTENT_STYLE.md](CONTENT_STYLE.md) before editing public copy.
