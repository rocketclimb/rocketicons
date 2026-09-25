# Releasing Rocketicons

1. In GitHub, open **Actions → Cut Release → Run workflow** and select `develop`. The workflow calculates the release version; there is no version to enter.
2. After the workflow succeeds, review the pull request it opens from `release/<version>` into `main` and merge it. The merge triggers **Release Packages**, which creates the tag, publishes the prepared package to npm, and creates the GitHub Release.

**Cut Release** runs the build and tests before packaging. If the package version on `develop` matches npm, it runs `npm run release` to generate the next versions and changelog, then names the branch from the generated root version. If the package is already one valid unpublished SemVer increment ahead of npm, it uses the existing versions in `package.json` without another bump. Other version differences fail the cut.

The release now also packs and publishes `@rocketicons/utils`, `@rocketicons/tailwind`, `@rocketicons/toolkit`, and `@rocketicons/mcp` before `rocketicons`. Configure npm trusted publishing for each scoped package against the **Release Packages** workflow before the first release. `@rocketicons/toolkit` and `@rocketicons/mcp` must have unpublished versions for every Rocketicons release; update their versions and the exact `@rocketicons/toolkit` and `@rocketicons/mcp` dependencies in `packages/mcp/package.json` and `packages/icons/package.json` together. The cut workflow rejects already published versions and mismatched dependencies. It rebuilds the bundled catalog after the Rocketicons version bump.

The workflow uses the existing `GH_ACTIONS` organization secret to open the pull request. GitHub's repository setting currently prevents its default `GITHUB_TOKEN` from creating pull requests.

Do not merge the release PR until **Cut Release** succeeds for its source revision. **Release Packages** verifies the merged revision against that run's artifacts before publishing.
