# Icon metadata guidance

Generate metadata from both the family names and the contact-sheet glyphs. Describe what the icon communicates in a UI, not how its SVG paths are encoded.

Each batch response has this shape:

```json
{
  "schemaVersion": 1,
  "collectionId": "wi",
  "batchId": 0,
  "families": [
    {
      "familyId": "umbrella",
      "description": {
        "en": "An umbrella representing rain, weather protection, or coverage.",
        "pt-BR": "Um guarda-chuva representando chuva, proteção climática ou cobertura."
      },
      "aliases": { "en": ["parasol"], "pt-BR": ["sombrinha"] },
      "searchTerms": {
        "en": ["rain", "forecast", "protection", "insurance"],
        "pt-BR": ["chuva", "previsão do tempo", "proteção", "seguro"]
      },
      "negativeTerms": {
        "en": ["beach umbrella"],
        "pt-BR": ["guarda-sol de praia"]
      },
      "primaryCategory": "weather",
      "categories": ["weather", "objects"],
      "uiContexts": ["forecast", "travel", "insurance"],
      "roles": ["object", "status"]
    }
  ]
}
```

## Content rules

- Use natural, concise search language. Include indirect UI intent: a plate may match restaurant, dining, menu, reservation, food delivery, and hospitality.
- Generate English and idiomatic Brazilian Portuguese together. Do not merely preserve untranslated English terms when a normal Portuguese term exists, and do not construct descriptions by concatenating translated ID tokens.
- Keep descriptions literal enough to distinguish visually similar icons.
- Aliases are close names for the depicted concept. Search terms are broader intents and workflows where it fits.
- Negative terms name plausible confusions only. Never repeat positive concepts there.
- When deriving hints from an icon ID, tokenize only at separators, camel-case boundaries, and letter/number boundaries. Match complete tokens only: a substring such as `rain` inside `train` is not a semantic signal.
- Do not add a context solely because a word happens to occur in the icon ID. Confirm every term against the complete family name and the glyph.
- Before applying, audit every family in both locales and compare repeated aliases across the complete merged collection. The same alias must not describe families in unrelated categories.
- Keep positive aliases and search terms out of negative guidance, including case-only or Unicode-normalization variants.
- Preserve brand names accurately and do not infer a brand from a generic glyph.

Use stable category identifiers where possible: `weather`, `astronomy`, `environment`, `alerts`, `disasters`, `measurement`, `navigation`, `transportation`, `time`, `food-drink`, `commerce`, `finance`, `communication`, `files`, `media`, `people`, `places`, `devices`, `development`, `data`, `health`, `education`, `security`, `accessibility`, `gaming`, `brands`, `actions`, `status`, `objects`, and `shapes`.

Use UI-context identifiers such as `forecast`, `dashboard`, `charts`, `maps`, `travel`, `alerts`, `notifications`, `settings`, `forms`, `tables`, `search`, `navigation`, `ecommerce`, `restaurant`, `booking`, `messaging`, `profile`, `media-player`, `file-manager`, `admin`, `developer-tools`, `healthcare`, `education`, `finance`, `social`, `gaming`, and `accessibility`. Add a concise new identifier only when none fits.

Roles should normally come from `object`, `action`, `navigation`, `status`, `brand`, and `decorative`.
