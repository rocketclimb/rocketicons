# Release 0.10.0: what went wrong and proposed fixes

This is a proposal for review. The workflow fixes below are not implemented by this PR.

## Current state

The website deployed successfully after [release PR #262](https://github.com/rocketclimb/rocketicons/pull/262) merged. The package release did not finish.

- The prepared archives passed CI and a clean installation test.
- The archives still contain 54,222 icons and bilingual metadata for 51,602 icons across 32 collections.
- The approved publication retry created the `v0.10.0-release` Git tag, then failed on the first npm package.
- npm still serves `rocketicons@0.3.3` and `@rocketicons/utils@0.2.7` as of September 26, 2026.
- `develop` has not received the merged release's version updates and Git history.

Passing the package tests did not prove that the workflows triggered after merging could find the archives, publish to npm, or synchronize branches.

## 1. The release could not find its prepared archives

**What happened:** the first [Release Packages run](https://github.com/rocketclimb/rocketicons/actions/runs/36251805921/attempts/1) could not find the successful Cut Release run, even though that run existed. The same lookup worked later, and the approved retry got past it. A temporary GitHub API lookup problem is suspected; the exact reason for the first empty result is not proven.

**Proposed fix:** use the exact Cut Release run URL already recorded in the release PR. Verify that the run succeeded, belongs to this repository and workflow, and matches the release's source commit. Keep the existing artifact identity checks. Retry temporary API errors a limited number of times, and report the run ID and commit when lookup fails. Use a bounded search only for older release PRs without a recorded run URL.

**How we would test it:** delayed or stale API results recover; a run from a different commit or repository is rejected; missing artifacts still stop publication.

## 2. Squash merging broke the automatic branch sync

**What happened:** [Sync main into develop](https://github.com/rocketclimb/rocketicons/actions/runs/36251805926) hit conflicts in package manifests, the lockfile, and the icon changelog. The release was squash-merged, so Git sees a new commit on `main` instead of the existing `develop` history. That makes already-integrated changes look like competing edits.

The release head `39ffb309` and the squash commit `86943b14` contain exactly the same files; their Git tree IDs match.

**Proposed fix:** teach synchronization to recognize a squash-merged release. After verifying the prepared release and squash commit have identical files and the release source is already in `develop`, record their shared history before merging. Preserve any newer work on `develop`. Stop on genuine conflicting edits; do not force-push or blindly replace files from either branch.

**How we would test it:** normal merges, squash merges, newer changes on `develop`, changes on `main` after the release, and real conflicts that must remain unresolved.

## 3. npm rejected publication, and retries must be safe

**What happened:** the approved [second publication attempt](https://github.com/rocketclimb/rocketicons/actions/runs/36251805921/attempts/2) created the tag, then npm returned `E404` while publishing `@rocketicons/utils@0.8.0`. The package already exists publicly, so this needs an authentication or package-permission investigation. The logs do not identify the exact npm setting that is wrong. The other packages were not reached.

**Proposed fix:** verify npm package access and trusted-publisher settings for all five packages. The GitHub publisher should match organization `rocketclimb`, repository `rocketicons`, and workflow filename `release.yml`, and allow direct publication. An npm package administrator may need to make these changes. Follow [npm's trusted-publishing documentation](https://docs.npmjs.com/trusted-publishers/).

Also make recovery resume safely: reuse an existing tag only when it points to the expected release commit, and skip an already-published package only when its version and archive integrity match the prepared artifact. Reject mismatches. This prevents a later retry from getting stuck after partial progress or publishing different files under the same version.

**How we would test it:** matching existing tags and packages can resume; different commits or archive contents are rejected; errors identify the package and failed stage. A dry-run package check alone cannot prove npm publishing permission.

## Suggested order

1. Review and implement the lookup, synchronization, and safe-retry changes.
2. Verify and correct npm publishing access with the package administrator.
3. Resume publication from the already-verified Cut Release run `36250310169`. Keep the existing artifacts and versions.
4. Confirm all five npm versions and the GitHub release exist, then verify a fresh installation from public npm and confirm `develop` includes the release updates.
