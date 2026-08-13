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

Use `SITE_ORIGIN` for deployment-specific absolute URLs. Functional catalog and documentation references must remain root-relative so the static export works on any hostname.

## Content principles

Preserve the existing UI and write copy that is upbeat, concise, and technically exact. The recommended product message is “add only what you use”: the CLI writes selected icon components into the application's source tree. Do not present full-package imports, unsupported CLI flags, or future MCP tools as current behavior.

See [CONTENT_STYLE.md](CONTENT_STYLE.md) before editing public copy.
