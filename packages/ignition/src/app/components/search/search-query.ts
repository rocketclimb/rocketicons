export const MIN_SEARCH_LENGTH = 3;

export const normalizeSearchQuery = (query: string) => query.trim();

export const isSearchQueryReady = (query: string) =>
  normalizeSearchQuery(query).length >= MIN_SEARCH_LENGTH;

export const searchResultsMatchInput = (inputQuery: string, resultQuery: string) => {
  const normalizedInput = normalizeSearchQuery(inputQuery);

  return (
    isSearchQueryReady(normalizedInput) && normalizedInput === normalizeSearchQuery(resultQuery)
  );
};
