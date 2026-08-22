import { useSearchBox } from "react-instantsearch";
import { LuSearch } from "rocketicons/lu";
import { useEffect, useState } from "react";

const MIN_SEARCH_LENGTH = 3;

type SearchBoxProps = {
  label: string;
};

const SearchBox = ({ label }: SearchBoxProps) => {
  const { refine } = useSearchBox();
  const [searching, setSearching] = useState<string>("");

  useEffect(() => {
    const timeoutId = setTimeout(
      () => refine(searching.length >= MIN_SEARCH_LENGTH ? searching : ""),
      500
    );
    return () => clearTimeout(timeoutId);
  }, [refine, searching]);

  return (
    <form className="flex items-center h-14 w-full">
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
        onChange={({ currentTarget: { value } }) => setSearching(value)}
        maxLength={60}
      />
    </form>
  );
};

export default SearchBox;
