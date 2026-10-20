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

## Collection source validation

- Put collection-specific source validators and source loaders in `packages/generator/src/source-validation/<collection>.ts`, following Iconoir and MynaUI.
- Keep their tests beside them as `<collection>.test.ts` and import the loaders from `packages/generator/src/definitions.ts`.
- Keep shared generation utilities in `packages/generator/src/`; place collection-specific SVG, filename, variant, and upstream tag checks in the collection's source-validation module.
- When moving a validator, update all imports and run the generator tests and typecheck.

## AI roadmap maintenance

`AI_ROADMAP.md` is the source of truth for AI-first product progress.

- Read the relevant roadmap milestone before implementing work that belongs to it.
- Update `AI_ROADMAP.md` in the same change whenever a roadmap item is completed, changed, deferred, or removed.
- Mark an item complete only after the implementation and proportionate verification exist.
- Leave partial work unchecked and add a concise **Partial:** note explaining what remains.
- Record newly discovered follow-up work in the appropriate milestone.
- Keep roadmap terminology aligned with the current architecture and deployment platform.
