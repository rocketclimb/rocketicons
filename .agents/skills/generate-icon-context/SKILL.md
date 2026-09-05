---
name: generate-icon-context
description: Generate or refresh bilingual semantic JSON metadata for a Rocketicons collection when asked to create icon context, enrich a collection, or make its icons searchable by UI intent. Use only inside the Rocketicons repository; do not run during builds or CI.
---

# Generate icon context

Create reviewed English and PT-BR semantic metadata for one collection through the repository's deterministic local workflow.

## Workflow

1. Work from `packages/ignition` and run `npm run icon-context -- status <collection>`.
2. If nothing is missing or stale, report that the collection is current and stop.
3. Run `npm run icon-context -- prepare <collection>`. If more than 500 families are reported, summarize the estimate and obtain user confirmation before retrying with `--confirm-large=<collection>`.
4. Read [the metadata guidance](references/metadata.md). For each batch, inspect both `batch-N.json` and `batch-N.png`, then write the matching `responses/batch-N.json`. Preserve every input `familyId` exactly and return exactly one metadata record per family.
5. Run `npm run icon-context -- validate <collection>`. Correct every validation failure; do not weaken limits or invent missing families.
6. Review all warnings and a deterministic cross-section of the results. Check common UI queries in both languages, ambiguous glyphs, directions, warnings, brands, and negative guidance.
7. Show the user the validation summary and representative sample. Apply only after the user approves, using `npm run icon-context -- apply <collection> --reviewed`.
8. Regenerate the static catalog, run the relevant tests, inspect the diff, and update `AI_ROADMAP.md` only for behavior proven complete.

## Incremental and force behavior

- Preparation skips bindings whose source and prompt hashes are current. Never regenerate them merely for stylistic variation.
- Resume an interrupted run from existing batch responses; do not discard completed work.
- Before forced recreation, state how many reviewed records will be replaced and obtain explicit confirmation. Then use both `--force` and `--confirm-force=<collection>`.
- Never call an external model API or place LLM generation in CI. The active agent performs the semantic work.
- Do not index `negativeTerms` as positive search terms.
