# Iconoir source and naming

Rocketicons imports [Iconoir](https://github.com/iconoir-icons/iconoir) v7.12.1 at
`d7dfa4d0341df0670bfed9fc24221c9d7ef2112e`. The exact source is MIT
licensed; the pinned [license](https://github.com/iconoir-icons/iconoir/blob/d7dfa4d0341df0670bfed9fc24221c9d7ef2112e/LICENSE)
must accompany a redistributed package.

The sparse source includes `icons/regular/*.svg` and `icons/solid/*.svg` only.
This revision contains 1,383 regular SVGs and 288 solid SVGs. Every solid name
has a regular counterpart, yielding 1,671 exports across 1,383 upstream names.
The upstream site metadata has exactly one category/tag row per regular name;
its `iconoir.com/icons.csv` snapshot is kept as `ICONOIR_CATEGORIES.csv`
(SHA-256 `11c2a88d35a42799c154db75c6625f9ef222b2a102d59f8427011f2f72fa637a`).
Tags guide bilingual context authoring, while the glyph and complete name decide
the final meaning. No fonts, framework packages, or non-icon assets are imported.

Regular names map to `Oir<Name>` and `oir-<name>`; solid names map to
`OirSolid<Name>` and `oir-solid-<name>`. Both styles retain their 24px viewBox,
path geometry, 1.5 stroke widths where present, and path-level `currentColor`.
Stroke-only paths explicitly keep `fill="none"` so variant color classes cannot
paint their interiors. Source validation rejects empty styles, malformed SVGs,
unexpected names, and normalized component or ID collisions before generation.
Update the count and CSV snapshot together when changing the pinned revision.
