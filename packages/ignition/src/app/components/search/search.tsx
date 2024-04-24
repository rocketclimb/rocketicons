"use client";
import { LuSearch } from "rocketicons/lu";
import { withLocale } from "@/locales";
import { Languages } from "@/types";
import { useDisclosure } from "@/components/modal-context";
import SearchAlgolia from "@/components/search/search-algolia";
import Button from "@/components/button";

import useKeyboardShortcut from "@/hooks/use-keyboard-shortcut";

type SearchButtonProps = {
  lang: Languages;
};

const SearchButton = ({ lang }: SearchButtonProps) => {
  const { open, close, Modal } = useDisclosure("search-disclosure");
  const { placeholder } = withLocale(lang).config("search");

  useKeyboardShortcut(() => open(), {
    code: "KeyK",
    metaKey: true,
  });

  return (
    <>
      <Button
        className="hidden lg:flex items-center w-72 docked:w-full docked:text-sm docked:py-1.5 docked:px-3 docked:ml-1 text-left space-x-3 px-4 h-12 docked:h-auto bg-white ring-1 ring-slate-900/10 hover:ring-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm rounded-lg docked:rounded-md text-slate-400 dark:bg-slate-800 dark:ring-0 dark:text-slate-300 docked:dark:text-slate-400 dark:highlight-white/5 dark:hover:bg-slate-700"
        onClick={() => open()}
      >
        <LuSearch className="icon-slate-300 dark:icon-slate-400 docked:icon-slate-300-sm docked:dark:icon-slate-400-sm docked:mr-1.5" />
        <span className="flex-auto">{`${placeholder}...`}</span>
        <kbd className="font-sans font-semibold dark:text-slate-500 docked:dark:text-slate-400">
          <abbr
            title="Command"
            className="no-underline mr-1 text-slate-300 dark:text-slate-500 docked:dark:text-slate-400"
          >
            ⌘
          </abbr>
          K
        </kbd>
      </Button>
      <Modal>
        <SearchAlgolia lang={lang} close={close} />
      </Modal>
    </>
  );
};

export default SearchButton;
