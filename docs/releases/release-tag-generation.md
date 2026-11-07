# Release tag generation

[Cut Release 42394464196](https://github.com/rocketclimb/rocketicons/actions/runs/42394464196) passed its workspace tests, then failed before packaging with `Generated tag mismatch: expected v0.11.0-release, received v0.10.0-release`.

The legacy releaser had generated root version 0.11.0, but the workflow scraped the last tag-shaped string from all releaser output. Historical changelog or log output can contain an older tag; the failure proves the scraped value did not match the generated manifest. No remote release branch, tag or package was created by that cut.

Cut Release now runs the releaser normally and derives the tag from the generated root package version through the existing stable-version guard. It still checks the generated commit subject, source branch, root version, package increment and artifact identity. This removes a console-output dependency without weakening release verification.

Regression coverage validates stable tag generation and checks that the workflow reads the generated manifest after the releaser runs rather than scraping console output. Final CI and publication results are recorded in the current QA report.
