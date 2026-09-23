import algoliasearch from "algoliasearch";
import { allIcons, catalogVersion, getCollection, getIcon, iconSummary, Icon } from "./catalog";

export type SearchInput = {
  query: string;
  collections?: string[];
  variants?: string[];
  limit?: number;
};
export type SearchResult = ReturnType<typeof iconSummary> & { matchReason: string };
export type SearchResponse = {
  source: "algolia" | "local";
  catalogVersion: string;
  results: SearchResult[];
};
type SearchConfig = {
  applicationId: string;
  searchOnlyApiKey: string;
  indexName: string;
};
// This search-only key is already shipped to browsers by rocketicons.com.
// Keep a bundled copy so the local MCP can search before the public config
// endpoint is deployed. The indexing key must never be bundled here.
const bundledSearchConfig: SearchConfig = {
  applicationId: "EDCZK9B3K7",
  searchOnlyApiKey: "0ae43858d0b9669e086fc84098e078b1",
  indexName: "rocketicons"
};
let configRequest: Promise<SearchConfig> | undefined;
let remoteFailureUntil = 0;

const config = () => {
  if (!configRequest) {
    configRequest = (async () => {
      if (process.env.ROCKETICONS_ALGOLIA_APP_ID && process.env.ROCKETICONS_ALGOLIA_SEARCH_KEY)
        return {
          applicationId: process.env.ROCKETICONS_ALGOLIA_APP_ID,
          searchOnlyApiKey: process.env.ROCKETICONS_ALGOLIA_SEARCH_KEY,
          indexName: process.env.ROCKETICONS_ALGOLIA_INDEX ?? "rocketicons"
        };
      try {
        const response = await fetch("https://rocketicons.com/ai/v1/search-config.json", {
          signal: AbortSignal.timeout(1800)
        });
        if (!response.ok) throw new Error(`Search config HTTP ${response.status}`);
        return (await response.json()) as SearchConfig;
      } catch {
        return bundledSearchConfig;
      }
    })();
  }
  return configRequest;
};

const norm = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
const aliases = (icon: Icon) => [...(icon.aliases?.en ?? []), ...(icon.aliases?.["pt-BR"] ?? [])];
const searchTerms = (icon: Icon) => [
  ...(icon.searchTerms?.en ?? []),
  ...(icon.searchTerms?.["pt-BR"] ?? [])
];
const relatedWord = (query: string, candidate: string) => {
  if (query.length < 8 || candidate.length < 8) return false;
  let shared = 0;
  while (shared < Math.min(query.length, candidate.length) && query[shared] === candidate[shared])
    shared++;
  return shared >= Math.max(6, Math.ceil(Math.min(query.length, candidate.length) * 0.7));
};
const match = (icon: Icon, query: string) => {
  const normalized = norm(query);
  const words = normalized.split(/\s+/).filter(Boolean);
  if (!words.length) return { score: 0, reason: "" };
  const name = norm(icon.name);
  const id = norm(icon.id);
  const component = norm(icon.component);
  const negative = [
    ...(icon.negativeTerms?.en ?? []),
    ...(icon.negativeTerms?.["pt-BR"] ?? [])
  ].some((term) => norm(term) === normalized);
  const alias = aliases(icon).find((term) => norm(term) === normalized);
  const searchTerm = searchTerms(icon).find((term) => norm(term) === normalized);
  const context = icon.uiContexts?.find((term) => norm(term) === normalized);
  const category = icon.categories?.find((term) => norm(term) === normalized);
  const metadata = [
    icon.name,
    icon.id,
    icon.component,
    ...aliases(icon),
    ...searchTerms(icon),
    ...(icon.uiContexts ?? []),
    ...(icon.categories ?? [])
  ];
  const relatedName = words.every((word) =>
    name.split(/\s+/).some((candidate) => relatedWord(word, candidate))
  );
  const relatedTerm = metadata.find((term) =>
    words.every((word) =>
      norm(term)
        .split(/\s+/)
        .some((candidate) => relatedWord(word, candidate))
    )
  );
  const evidence =
    id === normalized || component === normalized
      ? { score: 100, reason: `Exact icon ID or component: ${icon.component}` }
      : name === normalized
        ? { score: 90, reason: `Icon name exactly matches "${icon.name}"` }
        : name.includes(normalized)
          ? { score: 70, reason: `Icon name "${icon.name}" contains "${query.trim()}"` }
          : alias
            ? { score: 65, reason: `Catalog alias: "${alias}"` }
            : searchTerm
              ? { score: 60, reason: `Catalog search term: "${searchTerm}"` }
              : context
                ? { score: 50, reason: `Used in the "${context}" UI context` }
                : category
                  ? { score: 45, reason: `Catalog category: "${category}"` }
                  : words.every((word) => metadata.some((term) => norm(term).includes(word)))
                    ? {
                        score: 35,
                        reason: `Catalog terms contain all words in "${query.trim()}"`
                      }
                    : relatedName
                      ? {
                          score: 30 - Math.min(10, Math.abs(name.length - normalized.length)),
                          reason: `Icon name "${icon.name}" resembles "${query.trim()}"`
                        }
                      : relatedTerm
                        ? { score: 20, reason: `Related catalog term: "${relatedTerm}"` }
                        : { score: 0, reason: "" };
  const reason =
    icon.description?.en && evidence.reason
      ? `${evidence.reason}. ${icon.description.en}`
      : evidence.reason;
  return negative
    ? {
        score: evidence.score - 50,
        reason: `${reason || `Query "${query.trim()}"`}; catalog marks this as a misleading match`,
        misleading: true
      }
    : { ...evidence, reason, misleading: false };
};
export const matchIconIntent = (icon: Icon, query: string) => match(icon, query);
const validateFilters = ({ collections = [], variants = [] }: SearchInput) => {
  for (const id of collections)
    if (!getCollection(id)) throw new Error(`Unknown collection: ${id}`);
  for (const variant of variants)
    if (!/^[a-z][a-z0-9-]*$/i.test(variant)) throw new Error(`Invalid variant: ${variant}`);
};
const filtered = (icon: Icon, input: SearchInput) =>
  (!input.collections?.length || input.collections.includes(icon.collection)) &&
  (!input.variants?.length || input.variants.includes(icon.variant));

export const localSearch = (input: SearchInput): SearchResponse => {
  validateFilters(input);
  const limit = Math.max(1, Math.min(60, input.limit ?? 10));
  const results = allIcons()
    .filter((icon) => filtered(icon, input))
    .map((icon) => ({ icon, ...match(icon, input.query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.icon.id.localeCompare(b.icon.id))
    .slice(0, limit)
    .map(({ icon, reason }): SearchResult => ({ ...iconSummary(icon), matchReason: reason }));
  return { source: "local", catalogVersion, results };
};

export type RemoteHit = { iconId: string; group: string };
export type RemoteSearch = (_input: SearchInput) => Promise<RemoteHit[]>;
export const buildAlgoliaFilters = (input: SearchInput) => {
  validateFilters(input);
  const filters = ["recordType:icon"];
  if (input.collections?.length)
    filters.push(`(${input.collections.map((id) => `group:${id}`).join(" OR ")})`);
  if (input.variants?.length)
    filters.push(`(${input.variants.map((value) => `variant:${value}`).join(" OR ")})`);
  return filters.join(" AND ");
};
export const algoliaSearch: RemoteSearch = async (input) => {
  const { applicationId, searchOnlyApiKey, indexName } = await config();
  const client = algoliasearch(applicationId, searchOnlyApiKey, {
    timeouts: { connect: 2, read: 2, write: 2 }
  });
  const response = await client.initIndex(indexName).search<RemoteHit>(input.query, {
    filters: buildAlgoliaFilters(input),
    hitsPerPage: Math.max(1, Math.min(60, input.limit ?? 10)),
    attributesToRetrieve: ["iconId", "group"]
  });
  return response.hits;
};

const requestedLimit = (input: SearchInput) => Math.max(1, Math.min(60, input.limit ?? 10));
const candidateLimit = (input: SearchInput) =>
  Math.min(60, Math.max(20, requestedLimit(input) * 5));

export const searchIcons = async (
  input: SearchInput,
  remote: RemoteSearch = algoliaSearch
): Promise<SearchResponse> => {
  validateFilters(input);
  const exact = getIcon(input.query);
  if (exact && filtered(exact, input))
    return {
      source: "local",
      catalogVersion,
      results: [
        {
          ...iconSummary(exact),
          matchReason: `Exact icon ID or component: ${exact.component}${exact.description?.en ? `. ${exact.description.en}` : ""}`
        }
      ]
    };
  if (!input.query.trim()) return { source: "local", catalogVersion, results: [] };
  if (remote === algoliaSearch && Date.now() < remoteFailureUntil) return localSearch(input);
  try {
    const hits = await remote({ ...input, limit: candidateLimit(input) });
    const ranked = hits.map((hit, position) => {
      const icon = getIcon(`@${hit.group}/${hit.iconId}`);
      if (!icon || icon.collection !== hit.group || !filtered(icon, input))
        throw new Error("Index result mismatch");
      const evidence = match(icon, input.query);
      return { icon, position, ...evidence };
    });
    const results = ranked
      .sort((a, b) => b.score - a.score || a.position - b.position)
      .slice(0, requestedLimit(input))
      .map(
        ({ icon, reason }): SearchResult => ({
          ...iconSummary(icon),
          matchReason:
            reason ||
            `Algolia ranked this icon for "${input.query.trim()}"; no catalog term confirmed`
        })
      );
    if (!results.length) {
      const fallback = localSearch(input);
      if (fallback.results.length) return fallback;
    }
    if (remote === algoliaSearch) remoteFailureUntil = 0;
    return { source: "algolia", catalogVersion, results };
  } catch {
    if (remote === algoliaSearch) remoteFailureUntil = Date.now() + 30_000;
    return localSearch(input);
  }
};
