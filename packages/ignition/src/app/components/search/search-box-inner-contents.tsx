import { LuSearch } from "rocketicons/lu";

const SearchBoxInnerContents = ({
  label,
  inputRef,
  refine,
  className,
}: {
  label: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  refine?: (value: string) => void;
  className?: string;
}) => {
  return (
    <div
      className={`flex flex-row items-center text-left sm:space-x-3 lg:space-x-0 px-3 h-12 bg-white ring-1 ring-slate-900/10 hover:ring-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm rounded-lg text-slate-300 dark:bg-slate-800 dark:ring-0 dark:text-slate-500 dark:highlight-white/5 dark:hover:bg-slate-700 ${className}`}
    >
      <LuSearch />
      <input
        ref={inputRef}
        type="search"
        className="grow bg-transparent focus:outline-none"
        placeholder={`${label}...`}
        onChange={(e) => refine && refine(e.currentTarget.value)}
      />
      <kbd className="flex font-sans font-semibold dark:text-slate-500">
        <abbr
          title="Command"
          className="no-underline text-slate-300 dark:text-slate-500"
        >
          ⌘
        </abbr>{" "}
        K
      </kbd>
    </div>
  );
};

export default SearchBoxInnerContents;
