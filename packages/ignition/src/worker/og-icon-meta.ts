/**
 * Per-icon social card metadata.
 *
 * Icons are a query parameter on a statically exported collection page, so every `?icon=` URL
 * shares one HTML file and cannot carry its own meta tags. These helpers let the Pages Worker
 * rewrite the title and description per request. The image stays the collection's — rendering
 * a per-icon PNG needs far more than the 10 ms CPU a Worker gets on the free plan.
 */

export const ICON_PARAM = "icon";

/** Collection pages, the only routes worth rewriting. */
const COLLECTION_PATH = /^\/(en|pt-br)\/icons\/([^/]+)\/?$/;

export type CollectionRoute = { lang: string; collectionId: string };

export const matchCollectionPath = (pathname: string): CollectionRoute | undefined => {
  const match = COLLECTION_PATH.exec(pathname);
  return match ? { lang: match[1], collectionId: match[2] } : undefined;
};

/**
 * Shape guard applied before the value is looked up. Existence is still checked against the
 * collection index — this only cheaply rejects input that could never be an icon id, so a
 * crafted `?icon=` cannot put arbitrary text into a card that links to rocketicons.com.
 */
export const isWellFormedIconId = (value: string) =>
  value.length <= 64 && /^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(value);

/**
 * Existence check against the collection index without `JSON.parse`.
 *
 * The index is written compact, so ids appear verbatim as `"id":"fa-0"`. Parsing the largest
 * index (Phosphor, 1 MB) costs ~2.9 ms against a 10 ms budget; a substring scan costs ~0.002 ms.
 */
export const indexContainsIcon = (indexText: string, iconId: string) =>
  indexText.includes(`"id":"${iconId}"`);

/** `fa-accessible-icon` -> `Accessible Icon`, matching how the site titles an icon. */
export const iconDisplayName = (iconId: string) => {
  const withoutPrefix = iconId.split("-").slice(1).join(" ") || iconId;
  return withoutPrefix.replace(/(^|\s)([a-z0-9])/g, (_, lead, char) => lead + char.toUpperCase());
};

/**
 * Reads the collection's display name out of the index without parsing it. `name` is the second
 * field of the `collection` object, before any nested object, so the match cannot run past it.
 */
export const collectionNameFromIndex = (indexText: string) =>
  /"collection":\{[^}]*?"name":"([^"]*)"/.exec(indexText)?.[1];

/**
 * The built title is `{Collection} | {site} | {tagline}`. Lead with the icon and drop the
 * tagline, so the card still fits the ~60 characters most clients show.
 */
export const iconTitle = (iconName: string, collectionName: string, siteName: string) =>
  [iconName, collectionName, siteName].filter(Boolean).join(" | ");

export const iconDescription = (iconName: string, collectionName: string, siteName: string) =>
  `${iconName} from ${collectionName}. Add the React or React Native component to your project with ${siteName}.`;

/**
 * Appends the icon to the page's own canonical URL rather than using the request URL, so the
 * card keeps pointing at the production origin no matter which host served it.
 */
export const iconUrl = (pageUrl: string, iconId: string) => {
  try {
    const url = new URL(pageUrl);
    url.searchParams.set(ICON_PARAM, iconId);
    return url.toString();
  } catch {
    return undefined;
  }
};
