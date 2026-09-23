/**
 * Chooses which icon fronts a collection's open graph card. Kept separate from `og-images.ts`
 * so it stays unit-testable: that module pulls in satori and the locale index, which jest
 * cannot load.
 */

/**
 * Widely recognisable concepts, most icon sets have several. Order matters only as a starting
 * point — see `pickRepresentativeIcon`.
 */
const REPRESENTATIVE_CONCEPTS = [
  "rocket",
  "home",
  "star",
  "heart",
  "user",
  "search",
  "settings",
  "bell",
  "camera",
  "calendar",
  "cloud",
  "folder",
  "file",
  "mail",
  "bookmark",
  "globe",
  "music",
  "image",
  "map",
  "lock",
  "clock",
  "tag"
] as const;

const normalizeIconName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

/** "0", "1 k", "500 px", "ab" — real icons, but meaningless as a collection's cover. */
const isDegenerateName = (name: string) => {
  const normalized = normalizeIconName(name);
  return /^[0-9]/.test(normalized) || normalized.length <= 2;
};

/** Stable per-collection offset, so the picker is deterministic across builds. */
const conceptOffset = (collectionId: string) =>
  [...collectionId].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);

/**
 * Chooses the icon that fronts a collection's card.
 *
 * The original renderer took `icons[0]`, which is alphabetical: 8 of 32 collections led with
 * something meaningless ("0" for Font Awesome 6, "500 px", "1 k") and read as a broken image.
 * Walking a fixed concept list instead fixes that but makes 17 of 32 cards show the same
 * rocket, so start each collection at its own offset into the list — every card gets a
 * recognisable glyph, and they stay visually distinct from one another.
 */
export const pickRepresentativeIcon = <T extends { id: string; name: string }>(
  collectionId: string,
  icons: T[]
): T | undefined => {
  if (!icons.length) return undefined;

  const start = conceptOffset(collectionId) % REPRESENTATIVE_CONCEPTS.length;
  for (let step = 0; step < REPRESENTATIVE_CONCEPTS.length; step += 1) {
    const concept = REPRESENTATIVE_CONCEPTS[(start + step) % REPRESENTATIVE_CONCEPTS.length];
    const match =
      icons.find((icon) => normalizeIconName(icon.name) === concept) ??
      icons.find((icon) => normalizeIconName(icon.name).startsWith(concept));
    if (match) return match;
  }

  return icons.find((icon) => !isDegenerateName(icon.name)) ?? icons[0];
};
