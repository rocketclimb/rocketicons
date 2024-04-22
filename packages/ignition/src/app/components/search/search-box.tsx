import { connectSearchBox } from "react-instantsearch-dom";
import { LuSearch } from "rocketicons/lu";
import useWaitToExecute from "@/hooks/use-wait-to-execute";
import { useEffect, useState } from "react";

const MIN_SEARCH_LENGH = 3;

const SearchBox = ({
  label,
  refine,
  className,
}: {
  label: string;
  refine: (value: string) => void;
  className?: string;
}) => {
  const [searching, setSearching] = useState<string>("");
  const [execute, cancel] = useWaitToExecute(500);

  useEffect(() => {
    execute(() => {
      if (searching.length >= MIN_SEARCH_LENGH) {
        refine(searching);
      }
    });
    return () => cancel();
  }, [searching]);

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

export default connectSearchBox(SearchBox);
