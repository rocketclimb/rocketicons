# Rocketicons website deployment

Ignition is exported as a static site and deployed to the `rocketicons` Cloudflare Pages project by [the Cloudflare Pages workflow](../../.github/workflows/pages.yml). Production is published from `main`; pull requests targeting `develop` or `main` receive isolated previews.

The deployment does not run a Next.js server. Cloudflare serves the generated files from `packages/ignition/out`.

## GitHub configuration

Configure these GitHub Actions variables:

| Variable                      | Purpose                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SITE_ORIGIN`                 | Complete production origin used in canonical URLs, sitemaps, catalog references, and LLM discovery files. Defaults to `https://rocketicons.com`. |
| `ALGOLIA_APPLICATION_ID`      | Public Algolia application ID embedded in the static browser bundle.                                                                             |
| `ALGOLIA_SEARCH_ONLY_API_KEY` | Restricted search-only key embedded in the static browser bundle.                                                                                |

Configure these GitHub Actions secrets:

| Secret                     | Purpose                                                      |
| -------------------------- | ------------------------------------------------------------ |
| `CLOUDFLARE_API_TOKEN`     | Token allowed to deploy the `rocketicons` Pages project.     |
| `CLOUDFLARE_ACCOUNT_ID`    | Cloudflare account that owns the Pages project.              |
| `ALGOLIA_INDEXING_API_KEY` | Server-only key used to replace the production search index. |

The workflow uses the automatic `GITHUB_TOKEN` to read GitHub Packages, publish deployment records, and update pull requests. Do not create a personal access token for the workflow.

The Cloudflare Pages project must be named `rocketicons`, and the production custom domain and DNS must point `rocketicons.com` to that project.

## Production deployment

A push to `main` runs the complete production pipeline:

1. Validate the deployment and Algolia configuration.
2. Install dependencies with Node.js 22 and GitHub Packages authentication.
3. Build the workspace packages and generate the complete icon data.
4. Run all workspace tests.
5. Generate localized content, the complete `/ai/v1/` catalog, sitemaps, and LLM discovery files.
6. Export the static Next.js site.
7. Verify required output files and enforce the 900 MiB deployment-artifact limit.
8. Deploy `packages/ignition/out` to the `main` branch of the Cloudflare Pages project.
9. Replace the production Algolia index.

The production site is expected at [https://rocketicons.com](https://rocketicons.com).

The workflow can also be run manually. Enable `synchronize_algolia` only when the production Algolia index should be replaced from the selected `main` revision.

## Pull-request previews

For pull requests targeting `develop` or `main`, the same workflow builds and tests the complete static export. Pull requests from branches in this repository, except Dependabot branches, are deployed to the Cloudflare branch `pr-<number>`.

The workflow publishes the resulting preview URL in the workflow summary and as a GitHub deployment linked to the pull request. A preview normally uses:

```text
https://pr-<number>.rocketicons.pages.dev
```

When the pull request closes, the workflow replaces that stable branch alias with the small retirement page under `.github/preview-closed` and marks the GitHub preview deployment inactive. Cloudflare deployment history is intentionally retained.

If automatic retirement was interrupted, run the workflow manually and set `cleanup_preview_pr` to the numeric pull-request number. This recovery run retires only that preview and does not rebuild the website.

## Reproduce the production export locally

Run these commands from the repository root. Node.js 22 is required.

First configure access to the private `@rocketclimb` packages. Use a local token with `read:packages`; never commit it:

```bash
npm config set @rocketclimb:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken "$GITHUB_TOKEN"
npm ci --ignore-scripts
```

Then run the same build stages used by CI:

```bash
SKIP_IGNITION_BUILD=true npm run build-all
npm run test-all
npm run generate-content-collections --workspace=packages/ignition
RI_GENERATE_ALL_ICONS=true npm run generate-statics:all-icons --workspace=packages/ignition
SITE_ORIGIN=https://rocketicons.com \
  SKIP_GENERATE_CONTENT_COLLECTIONS=true \
  SKIP_GENERATE_IGNITION_STATICS=true \
  npm run build --workspace=packages/ignition
```

Local Algolia search additionally needs `NEXT_PUBLIC_ALGOLIA_APPLICATION_ID` and `NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY`. Replacing the shared index requires `ALGOLIA_INDEXING_API_KEY` and should normally be left to the production workflow.

## Icon context metadata

Semantic icon metadata is created manually and committed as source data under `packages/ignition/icon-context`. Builds and deployments consume that reviewed data, but they never invoke an LLM or generate new semantic metadata. This keeps model usage, nondeterministic output, and review work out of CI.

Use the repository-local `generate-icon-context` skill when enriching a collection. The underlying commands run from `packages/ignition`:

```bash
npm run icon-context -- status wi
npm run icon-context -- prepare wi
npm run icon-context -- validate wi
npm run icon-context -- apply wi --reviewed
```

`prepare` skips icons whose source and prompt hashes are current and preserves a matching interrupted run. It generates ignored batch inputs and contact sheets under `.cache/icon-context`; the active agent reviews those inputs and writes bilingual English and PT-BR responses locally. `apply` requires the explicit `--reviewed` gate and atomically writes bounded source chunks.

Forced recreation is intentionally harder because it replaces reviewed metadata. After user confirmation, pass both `--force` and `--confirm-force=<collection>` to `prepare`. Runs exceeding 500 icon families also require `--confirm-large=<collection>`.

The static build publishes a context index for every collection under `/ai/v1/collections/<collection>/context/index.json`. The index explicitly reports `none`, `single`, or `chunked` storage, coverage, content hashes, and chunk URLs. Every context JSON file is limited to 64 KiB. Missing or stale entries are omitted safely and reported through coverage instead of blocking deployment.

Algolia synchronization uses the same reviewed metadata to add English and PT-BR descriptions, aliases, search terms, UI contexts, categories, roles, and variants. Negative terms remain guidance in the context envelopes and are never indexed as positive search terms.

Verify the static export before publishing it:

```bash
test -f packages/ignition/out/index.html
test -f packages/ignition/out/en/index.html
test -f packages/ignition/out/pt-br/index.html
test -f packages/ignition/out/ai/v1/catalog.json
du -sh packages/ignition/out
```

## Troubleshooting

### GitHub Packages authentication fails

- Confirm the workflow has `packages: read` permission.
- For local builds, confirm `GITHUB_TOKEN` has `read:packages` and that npm is configured for `https://npm.pkg.github.com`.
- Do not print tokens or commit them to `.npmrc`.

### Deployment fails

- Confirm the Cloudflare token can deploy Pages and belongs to `CLOUDFLARE_ACCOUNT_ID`.
- Confirm the Pages project is named `rocketicons`.
- Inspect the export-verification step before retrying deployment.

### Search synchronization fails

- Confirm both public Algolia variables are configured and the search key is restricted to read-only operations.
- Confirm `ALGOLIA_INDEXING_API_KEY` can update the production `rocketicons` index.
- Re-run the workflow from `main` with `synchronize_algolia` enabled after correcting the configuration.

### A closed pull request still serves its preview

Run the workflow manually with `cleanup_preview_pr` set to the pull-request number. The value must be a positive integer.

## Optional bundle analysis

Bundle analysis is a local diagnostic and is not part of the deployment gate:

```bash
npm run size-check --workspace=packages/ignition
```

The deployment workflow currently enforces only the total static-export limit of 900 MiB.
