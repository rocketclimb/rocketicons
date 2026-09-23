import {
  ICON_PARAM,
  collectionNameFromIndex,
  iconDescription,
  iconDisplayName,
  iconTitle,
  iconUrl,
  indexContainsIcon,
  isWellFormedIconId,
  matchCollectionPath
} from "./og-icon-meta";

type Env = { ASSETS: Fetcher };

/**
 * Collection indexes reach 1 MB, so hold only a couple per isolate — enough to spare repeat
 * fetches on a hot collection without risking the 128 MB memory ceiling.
 */
const INDEX_CACHE_SIZE = 3;
const indexCache = new Map<string, string>();

const collectionIndex = async (env: Env, origin: string, collectionId: string) => {
  const cached = indexCache.get(collectionId);
  if (cached !== undefined) return cached;

  const response = await env.ASSETS.fetch(
    new Request(`${origin}/ai/v1/collections/${collectionId}/index.json`)
  );
  if (!response.ok) return undefined;

  const text = await response.text();
  if (indexCache.size >= INDEX_CACHE_SIZE) {
    indexCache.delete(indexCache.keys().next().value as string);
  }
  indexCache.set(collectionId, text);
  return text;
};

const setContent = (value: string) => ({
  element(element: HTMLRewriterElement) {
    element.setAttribute("content", value);
  }
});

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const iconId = url.searchParams.get(ICON_PARAM);
    const route = matchCollectionPath(url.pathname);

    // Anything that is not an icon deep link is served straight from the static export.
    if (!iconId || !route || !isWellFormedIconId(iconId)) return env.ASSETS.fetch(request);

    const response = await env.ASSETS.fetch(request);
    if (!response.headers.get("content-type")?.includes("text/html")) return response;

    const index = await collectionIndex(env, url.origin, route.collectionId);
    if (!index || !indexContainsIcon(index, iconId)) return response;

    const collectionName = collectionNameFromIndex(index);
    if (!collectionName) return response;

    const iconName = iconDisplayName(iconId);
    const title = iconTitle(iconName, collectionName, SITE_NAME);
    const description = iconDescription(iconName, collectionName, SITE_NAME);

    return (
      new HTMLRewriter()
        .on("title", {
          element(element) {
            element.setInnerContent(title);
          }
        })
        .on('meta[property="og:title"]', setContent(title))
        .on('meta[name="twitter:title"]', setContent(title))
        .on('meta[property="og:description"]', setContent(description))
        .on('meta[name="twitter:description"]', setContent(description))
        .on('meta[property="og:image:alt"]', setContent(title))
        .on('meta[name="twitter:image:alt"]', setContent(title))
        // Keep the shared link pointing at the selected icon. `canonical` stays on the
        // collection on purpose, so 51k query variants are never indexed separately.
        .on('meta[property="og:url"]', {
          element(element) {
            const next = iconUrl(element.getAttribute("content") ?? "", iconId);
            if (next) element.setAttribute("content", next);
          }
        })
        .transform(response)
    );
  }
};

export default worker;
