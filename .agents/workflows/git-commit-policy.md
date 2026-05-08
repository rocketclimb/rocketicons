---
description: Git commit and push policy — always let the user review before committing
---

# Git Commit Policy

**NEVER commit or push changes without the user reviewing the files first.**

## Rules

1. After making code changes, **always use `notify_user`** with `PathsToReview` listing the changed files and ask for review before committing.
2. Only run `git commit` or `git push` **after the user has explicitly approved** the changes.
3. If the user says "proceed" or "looks good", that is approval to commit.
4. Stage files with `git add` for review purposes, but do NOT commit until approved.
5. Never auto-run `git commit` or `git push` commands (`SafeToAutoRun` must be `false`).
