# Icon pack refresh — 2026-10-19

Two npm-installed sources change: `lucide-static` moves from 1.41.0 to 1.55.0, and `@primer/octicons` moves from 19.34.0 to 19.40.0. Dependabot's grouped update proposed these bumps. They were separated from the routine dependency consolidation because they change the published catalog. The other 31 collections, including MynaUI, are unchanged. npm's `latest` for `lucide-static` is already 1.59.0. This refresh pins 1.55.0, the version that was reviewed. A later refresh can move to the newer release.

The generated package grows from **54,226 to 54,313 exports** (+87 / −0). The web catalog has **54,309 distinct IDs**, because four existing Lucide AZ/Az alias pairs share IDs. No existing export is removed, renamed, or pointed at a different ID. Unlike the [2026-09-04 refresh](icon-pack-update-2026-09-04.md), this is an additive catalog change. However, some existing Lucide exports now render different artwork. See [Compatibility and release notes](#compatibility-and-release-notes).

## Pack inventory

| Pack | Source version                                                                         | Before | After | Added | Removed |
| ---- | -------------------------------------------------------------------------------------- | -----: | ----: | ----: | ------: |
| go   | [`@primer/octicons`](https://www.npmjs.com/package/@primer/octicons) 19.34.0 → 19.40.0 |    352 |   364 |    12 |       0 |
| lu   | [`lucide-static`](https://www.npmjs.com/package/lucide-static) 1.41.0 → 1.55.0         |  2,052 | 2,127 |    75 |       0 |

Lucide has 2,123 distinct IDs after the refresh, up from 2,048. The remaining 31 collections keep their pinned Git revisions or installed versions and their export counts.

## Compatibility and release notes

No imports break: every export name from the previous catalog still exists with the same ID. Release this as a minor (feature) catalog update rather than a patch-only dependency bump, and call out the artwork changes below. Generated files in a consumer's own source tree keep the old artwork until they are regenerated.

### Changed artwork for existing Lucide exports

Upstream redrew 30 existing Lucide glyphs; the export names and IDs are unchanged. Twenty-five are refinements that keep the same meaning: `LuAlbum`, `LuBookMarked`, `LuBroccoli`, `LuCardSim`, `LuCookie`, `LuCreditCard`, `LuCreditCardCheck`, `LuCreditCardMinus`, `LuCreditCardPlus`, `LuCreditCardX`, `LuDoorOpen`, `LuFolderBookmark`, `LuIdCard`, `LuIdCardLanyard`, `LuLectern`, `LuMailPen`, `LuMapPinned`, `LuPenTool`, `LuSalad`, `LuSatelliteDish`, `LuSaveOff`, `LuSoup`, `LuTable2`, `LuToolCase`, and `LuWifiCog`.

The other five can change what a consumer sees:

- **`LuFlipHorizontal2` and `LuFlipVertical2` swapped orientation.** `LuFlipHorizontal2` previously showed triangles mirrored across a vertical line. It now shows them mirrored across a horizontal line, which is a top-to-bottom flip. `LuFlipVertical2` changed the opposite way. Both now duplicate the new `LuTrianglesCenterlineDashedHorizontal` and `LuTrianglesCenterlineDashedVertical` icons. A consumer that used either export for a specific flip direction should swap the two, or use `LuFlipHorizontal` / `LuFlipVertical`.
- **`LuNut` and `LuNutOff` were redrawn** from an acorn into a hazelnut. They still represent food nuts and allergens.
- **`LuComputer` was redrawn** from a monitor over a keyboard into a single compact desktop unit.

### Upstream renames kept as duplicates

Upstream introduced new names for existing glyphs and kept the old names. Both exports render identical artwork, and the old names keep working:

| Pack | Existing export     | New export with the same glyph          |
| ---- | ------------------- | --------------------------------------- |
| lu   | `LuAlbum`           | `LuSquareBookmark`                      |
| lu   | `LuBookMarked`      | `LuBookBookmark`                        |
| lu   | `LuBuilding2`       | `LuBuildingComplex`                     |
| lu   | `LuFlipHorizontal2` | `LuTrianglesCenterlineDashedHorizontal` |
| lu   | `LuFlipVertical2`   | `LuTrianglesCenterlineDashedVertical`   |
| go   | `GoQuestionBubble`  | `GoChatQuestion`                        |
| go   | `GoPlay`            | `GoTriangleCircle`                      |

New code should prefer the new names. Upstream may remove the old ones in a future major release. When it does, a later refresh will record them as removals.

### go — 12 added exports

- `GoChatAdd`
- `GoChatQuestion`
- `GoCommentFill`
- `GoCursor`
- `GoLibrary`
- `GoPersonCursor`
- `GoRelease`
- `GoTerminalLocked`
- `GoTriangle`
- `GoTriangleCircle`
- `GoTriangleFill`
- `GoWall`

### lu — 75 added exports

- `LuArmenianDram`
- `LuBangladeshiTaka`
- `LuBookBookmark`
- `LuBriefcasePlus`
- `LuBuildingComplex`
- `LuBuildingComplexPlus`
- `LuCalendarChevronsRight`
- `LuCarton`
- `LuCartonOff`
- `LuCircleDashedCheck`
- `LuClefAlto`
- `LuClefBass`
- `LuClefTreble`
- `LuCupcake`
- `LuDome`
- `LuDoorClosedCog`
- `LuDoorClosedPackage`
- `LuEqualApproximatelyNot`
- `LuFaucet`
- `LuGapHorizontal`
- `LuGapVertical`
- `LuGlobeCode`
- `LuGroceries`
- `LuHandleBottomRight`
- `LuHikingStick`
- `LuHourglassCog`
- `LuHouseCog`
- `LuHouses`
- `LuIvBag`
- `LuKazakhTenge`
- `LuLambda`
- `LuLayoutArrowDown`
- `LuLayoutArrowRight`
- `LuLayoutGridCircles`
- `LuLens`
- `LuLetters`
- `LuLineDotBottomVertical`
- `LuLineDotLeftHorizontal`
- `LuLineDotTopVertical`
- `LuMailDot`
- `LuMessagesCircle`
- `LuMonitorPc`
- `LuMouth`
- `LuMouthOff`
- `LuNepaliRupee`
- `LuNotebookDot`
- `LuPark`
- `LuPhoneLog`
- `LuPlantPot`
- `LuPrinter3D`
- `LuRotateCwClock`
- `LuRugbyBall`
- `LuScratchBlocks`
- `LuScrew`
- `LuShieldHouse`
- `LuSquareBookmark`
- `LuSquareDashedPlus`
- `LuSquareDashedX`
- `LuSquareDashedXCorner`
- `LuSquareSparkles`
- `LuTextAlignJustifyCenter`
- `LuTextAlignJustifyEnd`
- `LuTextAlignJustifyStart`
- `LuTicTacToe`
- `LuToothbrush`
- `LuToothbrushSparkles`
- `LuTrashOff`
- `LuTrianglesCenterlineDashedHorizontal`
- `LuTrianglesCenterlineDashedVertical`
- `LuTubeLotion`
- `LuUserGroup`
- `LuUserRoundGroup`
- `LuUserRoundStar`
- `LuWifiLock`
- `LuWindArrowUp`

## Semantic metadata

Lucide and Go metadata is current against the lockfile-installed packages. No bindings are missing, stale, or orphaned.

- **Lucide:** 2,122 bilingual semantic families now cover 2,123 icons (previously 2,047 families and 2,048 icons). The 75 new icons each have a new reviewed family. The 30 redrawn glyphs were reviewed against their new artwork, and 25 records were kept verbatim, including `computer`, whose description still fits the new drawing.
- **Five Lucide records were rewritten:**
  - `flip-horizontal2` and `flip-vertical2` now describe their swapped orientation.
  - `nut` and `nut-off` previously described a hardware hex nut. They now describe the food nut that both the old and new glyphs show.
  - `wifi-cog` moved from the files category to devices and network settings.
- **Go:** 343 families now cover 364 icons (previously 333 families and 352 icons). `GoCommentFill` joins the existing `comment` family, and `GoTriangle`/`GoTriangleFill` share a new `triangle` family.

Upstream duplicates have consistent descriptions and aliases, and each one names its look-alikes as negative terms. Examples are the `book-bookmark`/`book-marked` and `chat-question`/`question-bubble` pairs and the triangles-centerline icons. Negative guidance also separates near-twins:

- `square-dashed-x` from `square-dashed-x-corner`
- the `line-dot-*` and `text-align-justify-*` sets
- `user-group` from `users` and `user-round-group` from `users-round`
- the music clefs
- `lens` from the concave and convex lenses
- Go `cursor` from the Cursor editor logo

The reviewed catalog now covers 51,689 bindings across 32 of 33 collections. MynaUI remains pending.

## Reproduce validation

After an authenticated `npm ci --ignore-scripts`:

1. Run `SKIP_IGNITION_BUILD=true npm run build-all` to fetch pinned sources and build all packages.
2. From `packages/ignition`, run `npm run icon-context -- status lu` and `npm run icon-context -- status go`. Both must report zero missing, stale, and orphaned bindings; `npm run icon-context -- audit <collection>` must report zero blockers.
3. Run `npm run generate-statics:all-icons -w ignition` to generate the complete web catalog, then `npm run build -w @rocketicons/toolkit` to rebuild the bundled search index from it.
4. Run `npm run test-all`, then `npm run test:catalog -w @rocketicons/generator` to render every export and validate every web index and shard record.
5. From `packages/ignition`, run `npm run indexer -- --dry-run` to validate the future Algolia record set without updating the live index.

Live Algolia indexing and native-device rendering are separate checks and were not performed for this refresh.
