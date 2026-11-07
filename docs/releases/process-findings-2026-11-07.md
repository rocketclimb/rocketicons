# November 2026 release process findings

## Scope and observed behavior

The owner authorized #284–#288 and #290–#292 for this release, with #284 classified as a minor update and the flipped Lucide artwork documented. #283, #294 and major tooling upgrades remain deferred.

The first merge attempt through the GitHub connector returned `403 Resource not accessible by integration`; the authenticated GitHub CLI completed the authorized merges. This is a connector permission limitation, not a repository code defect.

After the base changed, GitHub reported #288 and #284 as conflicting. A normal local merge of the current develop revision completed without textual conflicts for both branches. Those integration commits were pushed without force, preserving the NativeWind configuration, React Native SVG 15.15.x pin, runtime-template migration and telemetry changes. GitHub's earlier conflict response alone was not enough to justify a rebase or discarded changes.

## Blocking integration failure and fix

[Cut Release 42393521458](https://github.com/rocketclimb/rocketicons/actions/runs/42393521458) stopped before packaging because two MCP telemetry fixtures lacked the NativeWind setup newly required by #288. [#298](https://github.com/rocketclimb/rocketicons/pull/298) fixes the fixtures without relaxing production checks or telemetry assertions. [Its validation](https://github.com/rocketclimb/rocketicons/actions/runs/42393909350) passed all 753 automated tests, the full catalog check, the Expo iOS bundle and the static site export before it merged. The release cut is retried from that corrected integrated source.

## Proposed improvements in this PR

1. Run the Expo iOS smoke test in Cut Release after the complete catalog build. Pages CI already has the smoke test, while the cut workflow currently packages without it. This PR adds the missing gate and checks its ordering in the release workflow regression test.
2. Exclude catalog sources, Satori, Cheerio and the NativeWind/React Native dependency stack from routine version and security groups. Individual update PRs remain enabled. The deferred [#294](https://github.com/rocketclimb/rocketicons/pull/294) fails in `element-to-tree.ts` because Cheerio no longer exports `Element`, and also proposes unreviewed artwork/rendering and React Native version changes.
3. Record explicit merge, publisher and post-publication verification gates in the release runbook.

The grouping syntax follows [GitHub's Dependabot options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference). An exclude-pattern only removes a package from that group; it does not ignore the dependency.

## Further proposals requiring a separate decision

- Require `Test and export static site` on the generated release PR. Main is protected and normally requires one approving review, but its required status-check list was empty on 2026-11-07. This is repository policy configuration rather than a file change; this PR does not alter it.
- Verify unattended npm publication of a new version. The [successful September recovery](https://github.com/rocketclimb/rocketicons/actions/runs/36262440163) logged `skip:` for all five packages after manual publication. It establishes identical archives, not successful trusted-publisher writes. Do not add a personal-token fallback based on that evidence.
- Make curated compatibility notes an explicit input to Cut Release. The current release notes come from the legacy releaser; package changelog entries need an explicit check before the GitHub release is finalized.

## Validation and disposition

This is a follow-up proposal for review, separate from the already authorized release scope. It makes no dependency upgrades, npm publisher changes, branch-protection changes, or production deployments. Workflow tests and YAML/document checks are recorded in the PR before handoff. The release's actual publication result will be recorded in the current QA report.


## Publication gate after the main merge

The corrected [cut 42395102753](https://github.com/rocketclimb/rocketicons/actions/runs/42395102753) prepared repository release 0.11.0 and `rocketicons@0.5.0`. All five archives passed identity/catalog checks, and every new version was absent from public npm before merge. [Release PR #305](https://github.com/rocketclimb/rocketicons/pull/305) passed its complete CI before the owner's administrator merge; main's normal one-review rule could not be satisfied by the same account that authored the generated PR. No protection settings were changed.

[Publication run 42396281909](https://github.com/rocketclimb/rocketicons/actions/runs/42396281909) verified and created the tag, then npm rejected the first upload (`@rocketicons/utils@0.9.0`) with E404/permission denied. No package in the new set had been published by that attempt. Local npm reported ENEEDAUTH and the npm browser opened at Sign In. Account access is needed to inspect the actual trusted-publisher records; the error does not establish which setting is wrong.

Current [npm trusted-publishing documentation](https://docs.npmjs.com/trusted-publishers/) requires a matching repository URL, exact owner/repository/workflow fields and permission for the publish operation used. New, unvalidated publisher configurations can also expire. This proposal adds the correct repository URL and workspace directory to all four scoped package manifests. It does not alter the already prepared archives or claim that metadata caused the observed E404.

After the package-side settings are verified, dispatch Release Packages from main with `release_pr=305`. Reuse cut 42395102753 and the existing tag; never rebuild the archives or bump versions to hide a permission failure. Keep the npm publication task open until all five registry integrities match and clean public installation checks pass.

## Public notes and machine access

The generated notes for 0.11.0 use an outdated comparison (`v0.9.4-release...v0.10.0`), repeat historical entries, and omit the explicit flipped-icon migration note. The packaged changelog does contain that note. Reviewed public notes are included in #305 and will be applied when the GitHub release is finalized. A follow-up should derive the comparison from the previous successful release and support a curated compatibility section as an explicit input to Cut Release.

A production catalog request using Python urllib's default User-Agent returned HTTP 403 with Cloudflare error 1010. The in-app browser succeeded, and the same HTTP client succeeded with the descriptive `RocketiconsReleaseQA/0.11.0` application User-Agent. This is the [documented Cloudflare Pages behavior](https://developers.cloudflare.com/pages/platform/known-issues/#browser-integrity-check-on-pages). Client examples should identify their application; this finding does not justify disabling site security or a hosting migration.

Production Pages/Algolia deployment currently runs independently of npm publishing. Consider a separate change that gates release-related deployment on successful package publication, so a registry permission failure cannot expose a newer catalog before its npm packages exist. Preserve ordinary website-only deployment behavior when designing that dependency.
