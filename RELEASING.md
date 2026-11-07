# Releasing Rocketicons

1. In GitHub, open **Actions → Cut Release → Run workflow** and select `develop`. The workflow calculates the release version; there is no version to enter.
2. After the workflow succeeds, review the pull request it opens from `release/<version>` into `main` and merge it. The merge triggers **Release Packages**, which creates the tag, publishes the prepared package to npm, and creates the GitHub Release.

**Cut Release** runs the build and tests before packaging. If the package version on `develop` matches npm, it runs `npm run release` to generate the next versions and changelog, then names the branch from the generated root version. If the package is already one valid unpublished SemVer increment ahead of npm, it uses the existing versions in `package.json` without another bump. Other version differences fail the cut.

The release now also packs and publishes `@rocketicons/utils`, `@rocketicons/tailwind`, `@rocketicons/toolkit`, and `@rocketicons/mcp` before `rocketicons`. Configure npm trusted publishing for each scoped package against the **Release Packages** workflow before the first release. `@rocketicons/toolkit` and `@rocketicons/mcp` must have unpublished versions for every Rocketicons release; update their versions and the exact `@rocketicons/toolkit` and `@rocketicons/mcp` dependencies in `packages/mcp/package.json` and `packages/icons/package.json` together. The cut workflow rejects already published versions and mismatched dependencies. It rebuilds the bundled catalog after the Rocketicons version bump.

The workflow uses the existing `GH_ACTIONS` organization secret to open the pull request. GitHub's repository setting currently prevents its default `GITHUB_TOKEN` from creating pull requests.

Do not merge the release PR until **Cut Release** succeeds for its source revision. **Release Packages** verifies the merged revision against that run's artifacts before publishing.


## Release gates and recovery evidence

- Merge stacked PRs in dependency order. If GitHub reports a conflict after a base change, fetch the current refs and inspect a normal local merge. Push the integrated head without rewriting history; preserve real conflicts for review.
- Check the generated release PR's **Test and export static site** result before merging. It covers the complete static site and the Expo iOS bundle. As inspected on 2026-11-07, main's required-status list is empty; do not assume branch protection enforces this check.
- Cut Release should also run the native smoke test before packaging, so a native regression cannot produce a prepared release candidate.
- Treat catalog refreshes, Satori rendering changes and NativeWind/React Native dependencies as individually reviewed updates. A `0.x` minor version can require a platform migration. Group exclusions do not ignore security alerts or disable individual update PRs.
- Confirm npm trusted publishing for each package against owner `rocketclimb`, repository `rocketicons`, workflow `release.yml`. A green recovery that only logs `skip:` proves archive identity, not permission to publish a new version.
- Keep the successful cut's artifacts unchanged. After a partial publication, dispatch Release Packages on `main` with `release_pr` set to the merged release PR. Do not rebuild or bump to bypass a failed publish.
- Review the generated public release notes. For the November 2026 minor catalog refresh, include the `LuFlipHorizontal2` / `LuFlipVertical2` orientation swap and the migration advice from the package changelog.
- Verify public npm initialization and MCP startup after publishing, then update `AI_ROADMAP.md` with the result.

See [the November release findings](docs/releases/process-findings-2026-11-07.md) for evidence and remaining proposals.


For npm recovery, inspect each package's trusted publisher record before retrying. The current workflow needs owner `rocketclimb`, repository `rocketicons`, filename `release.yml`, no environment restriction, and permission to run `npm publish`. Check whether a pending configuration has expired. Repository metadata must point to the same GitHub repository. See [npm's current instructions](https://docs.npmjs.com/trusted-publishers/); saving a configuration does not prove a new-version publish will work.

For scripted checks of the public Pages catalog, use a descriptive application User-Agent, such as `RocketiconsReleaseQA/0.11.0`. The default Python urllib signature can receive Cloudflare 1010 even while the browser and an identified application client work. Keep site security settings unchanged.
