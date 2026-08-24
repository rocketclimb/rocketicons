import { useSearchBox } from "react-instantsearch";
import { LuSearch } from "rocketicons/lu";
import { useEffect } from "react";
import { isSearchQueryReady, normalizeSearchQuery } from "./search-query";

type SearchBoxProps = {
  label: string;
  query: string;
  onQueryChange: (query: string) => void;
};

const SearchBox = ({ label, query, onQueryChange }: SearchBoxProps) => {
  const { refine } = useSearchBox();

  useEffect(() => {
    const normalizedQuery = normalizeSearchQuery(query);
    if (!isSearchQueryReady(normalizedQuery)) return;

    const timeoutId = setTimeout(() => refine(normalizedQuery), 500);
    return () => clearTimeout(timeoutId);
  }, [query, refine]);

  return (
    <form className="flex items-center h-14 w-full" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="search-input" id="search-label">
        <LuSearch className="icon-slate-500 dark:icon-slate-400 stroke-2" />
      </label>
      <input
        type="search"
        autoFocus={true}
        aria-autocomplete="both"
        aria-labelledby="search-label"
        id="search-input"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        enterKeyHint="search"
        spellCheck="false"
        placeholder={`${label}...`}
        className="bg-transparent w-full text-sm ml-3 mr-4 mt-1 outline-none -outline-offset-2 leading-5 appearance-none placeholder:text-slate-400"
        value={query}
        onChange={({ currentTarget: { value } }) => onQueryChange(value)}
        maxLength={60}
      />
    </form>
  );
};

export default SearchBox;
