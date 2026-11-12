# Repository instructions

## Branch naming

Create branches as `<type>/<short-kebab-case-description>`, using one of these prefixes:

- `feature/` — new functionality or expanded capabilities.
- `fix/` — bug fixes.
- `chore/` — dependencies, configuration, tooling, and general maintenance.
- `hotfix/` — urgent production fixes.
- `docs/` — documentation-only changes.
- `test/` — adding or improving tests.
- `refactor/` — restructuring code without changing behavior.

Choose the prefix that describes the primary purpose of the change. Do not use `codex/` or add an agent-specific prefix. For example, use `feature/icon-context-half-collections` for a semantic metadata rollout.

## Pull request review replies

- Every code review comment deserves a concise reply, including comments that are fixed, already addressed, declined with a reason, or blocked.
- A request to review or address PR feedback authorizes posting these replies. Reply in the original inline thread when available; answer review summaries in a PR conversation comment and mention the reviewer.
- Implement and verify accepted changes before claiming they are fixed. Cite the fix commit and relevant checks, and verify that the reply was posted to the correct PR or thread.
- A chat summary does not replace a GitHub reply. Avoid duplicate replies when feedback already has an accurate response.

## AI roadmap maintenance

`AI_ROADMAP.md` is the source of truth for AI-first product progress.

- Read the relevant roadmap milestone before implementing work that belongs to it.
- Update `AI_ROADMAP.md` in the same change whenever a roadmap item is completed, changed, deferred, or removed.
- Mark an item complete only after the implementation and proportionate verification exist.
- Leave partial work unchecked and add a concise **Partial:** note explaining what remains.
- Record newly discovered follow-up work in the appropriate milestone.
- Keep roadmap terminology aligned with the current architecture and deployment platform.
