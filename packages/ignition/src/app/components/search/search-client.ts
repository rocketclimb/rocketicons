import type { SearchClient as AlgoliaSearchClient } from "algoliasearch/lite";

import { isSearchQueryReady, normalizeSearchQuery } from "./search-query";

type SearchRequest = {
  query?: string;
  params?: {
    query?: string;
  };
  [key: string]: any;
};

type SearchClient = {
  search: (requests: readonly SearchRequest[], ...args: any[]) => Promise<{ results: any[] }>;
  [key: string]: any;
};

type SearchableClient = {
  search: (...args: any[]) => any;
};

const requestQuery = (request: SearchRequest) =>
  normalizeSearchQuery(request.params?.query ?? request.query ?? "");

const emptySearchResult = (query: string) => ({
  exhaustiveNbHits: true,
  hits: [],
  hitsPerPage: 0,
  nbHits: 0,
  nbPages: 0,
  page: 0,
  params: "",
  processingTimeMS: 0,
  query
});

export function createMinimumLengthSearchClient(client: AlgoliaSearchClient): AlgoliaSearchClient;
export function createMinimumLengthSearchClient<TClient extends SearchClient>(
  client: TClient
): Omit<TClient, "search"> & SearchClient;
export function createMinimumLengthSearchClient(client: SearchableClient) {
  const search = client.search.bind(client) as SearchClient["search"];

  return {
    ...client,
    async search(requests: readonly SearchRequest[], ...args: any[]) {
      const activeRequests = requests
        .map((request, index) => ({ index, query: requestQuery(request), request }))
        .filter(({ query }) => isSearchQueryReady(query));

      if (activeRequests.length === 0) {
        return { results: requests.map((request) => emptySearchResult(requestQuery(request))) };
      }

      const response = await search(
        activeRequests.map(({ request }) => request),
        ...args
      );
      let activeResultIndex = 0;

      return {
        ...response,
        results: requests.map((request, index) => {
          if (activeRequests[activeResultIndex]?.index === index) {
            return response.results[activeResultIndex++];
          }

          return emptySearchResult(requestQuery(request));
        })
      };
    }
  } as SearchableClient;
}
