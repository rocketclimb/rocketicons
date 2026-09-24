# MynaUI source and naming

Rocketicons imports [MynaUI Icons](https://github.com/praveenjuge/mynaui-icons)
from the official repository at immutable revision
`579977f9afb1991c24a32da73417a9cbcc4d5b22` (three commits after v0.4.11).
The pinned [MIT license](https://github.com/praveenjuge/mynaui-icons/blob/579977f9afb1991c24a32da73417a9cbcc4d5b22/LICENSE)
has SHA-256 `eebf4868e5d0ea0dda86648bb1cd0caa67a3fca0c49fa15cf469b9896e6b0ff9`.
Its text is included in the generated package license.

The sparse checkout includes `icons/*.svg`, `icons-solid/*.svg`, and root
`tags.json`. This revision has 1,310 regular SVGs and 1,310 solid SVGs with
identical stems: 1,310 concepts and 2,620 exports. The repository contains no
unpaired SVGs or excluded aliases. `tags.json` covers every concept exactly once
and has SHA-256 `2680590001722b29109a3642fd916a8d17fa8b1c2f4dfbd649199bb62b0a43d2`.
Tags are semantic hints; icon names and glyphs remain authoritative during
bilingual review. No webfont, generated framework component, or Pro asset is used.

Regular `home.svg` becomes `MyHome` / `my-home`; solid `home.svg` becomes
`MySolidHome` / `my-solid-home`. The same rule applies to every stem, with no
renames, exclusions, or normalized component/ID collisions at this revision.
The source validator checks both complete styles, their exact pairing, tags,
24px viewBox, valid SVG paths, and root color semantics before generation. Raw
SVGs are not passed through SVGO. Their 1.5 stroke width, round joins/caps,
`currentColor`, and solid fills are preserved in the generated tree.
