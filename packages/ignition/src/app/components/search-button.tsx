import { LuSearch } from "rocketicons/lu";
import Button from "./button";

type SearchButtonProps = {
  label: string;
};

const SearchButton = ({ label }: SearchButtonProps) => (
  <Button className="hidden sm:flex items-center w-72 text-left space-x-3 px-4 h-12 bg-white ring-1 ring-slate-900/10 hover:ring-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm rounded-lg text-slate-400 dark:bg-slate-800 dark:ring-0 dark:text-slate-300 dark:highlight-white/5 dark:hover:bg-slate-700">
    <LuSearch />
    <span className="flex-auto">{label}...</span>
    <kbd className="font-sans font-semibold dark:text-slate-500">
      <abbr
        title="Command"
        className="no-underline text-slate-300 dark:text-slate-500"
      >
        ⌘
      </abbr>{" "}
      K
    </kbd>
  </Button>
);

export default SearchButton;
