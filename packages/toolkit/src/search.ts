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
const terms = (icon: Icon) => [
  icon.name,
  icon.id,
  icon.component,
  ...(icon.aliases?.en ?? []),
  ...(icon.aliases?.["pt-BR"] ?? []),
  ...(icon.searchTerms?.en ?? []),
  ...(icon.searchTerms?.["pt-BR"] ?? []),
  ...(icon.categories ?? []),
  ...(icon.uiContexts ?? [])
];
const match = (icon: Icon, query: string) => {
  const normalized = norm(query);
  const words = normalized.split(/\s+/).filter(Boolean);
  if (!words.length) return { score: 0, reason: "" };
  const name = norm(icon.name);
  const id = norm(icon.id);
  const component = norm(icon.component);
  const negatives = [
    ...(icon.negativeTerms?.en ?? []),
    ...(icon.negativeTerms?.["pt-BR"] ?? [])
  ].map(norm);
  const haystack = terms(icon).map(norm);
  let score = id === normalized || component === normalized ? 100 : name === normalized ? 90 : 0;
  let reason = score ? "exact name or ID" : "";
  if (!score && haystack.includes(normalized)) {
    score = 75;
    reason = "semantic term";
  }
  if (!score && name.includes(normalized)) {
    score = 60;
    reason = "name contains query";
  }
  if (!score && words.every((word) => haystack.some((term) => term.includes(word)))) {
    score = 35;
    reason = "all query words matched";
  }
  if (negatives.includes(normalized)) score -= 50;
  return { score, reason };
};
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
      results: [{ ...iconSummary(exact), matchReason: "exact ID or component" }]
    };
  if (!input.query.trim()) return { source: "local", catalogVersion, results: [] };
  if (remote === algoliaSearch && Date.now() < remoteFailureUntil) return localSearch(input);
  try {
    const hits = await remote(input);
    const results = hits.map((hit) => {
      const icon = getIcon(`@${hit.group}/${hit.iconId}`);
      if (!icon || icon.collection !== hit.group || !filtered(icon, input))
        throw new Error("Index result mismatch");
      return {
        ...iconSummary(icon),
        matchReason: match(icon, input.query).reason || "Algolia semantic match"
      };
    });
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
