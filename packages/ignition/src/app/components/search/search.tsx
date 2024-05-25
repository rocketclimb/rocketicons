"use client";
import { ButtonHTMLAttributes } from "react";
import { LuSearch } from "rocketicons/lu";
import { withLocale } from "@/locales";
import { PropsWithLang } from "@/types";
import { useDisclosure } from "@/components/modal-context";
import SearchAlgolia from "@/components/search/search-algolia";
import Button from "@/components/button";

import useKeyboardShortcut from "@/hooks/use-keyboard-shortcut";

type SearchButtonProps = {
  asInput?: boolean;
} & PropsWithLang;

type SearchAsButtonProps = {
  placeholder: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Kbd = () => (
  <kbd className="font-sans font-semibold dark:text-slate-500 docked:dark:text-slate-400">
    <abbr
      title="Command"
      className="no-underline mr-1 text-slate-300 dark:text-slate-500 docked:dark:text-slate-400"
    >
      ⌘
    </abbr>
    K
  </kbd>
);

const SearchAsButton = ({ placeholder, ...props }: SearchAsButtonProps) => (
  <Button
    className="hidden lg:flex items-center w-72 docked:w-full docked:text-sm docked:py-1.5 docked:px-3 docked:ml-1 text-left space-x-3 px-4 h-12 docked:h-auto bg-white ring-1 ring-slate-900/10 hover:ring-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm rounded-lg docked:rounded-md text-slate-400 dark:bg-slate-800 dark:ring-0 dark:text-slate-300 docked:dark:text-slate-400 dark:highlight-white/5 dark:hover:bg-slate-700"
    {...props}
  >
    <LuSearch className="icon-slate-300 dark:icon-slate-400 docked:icon-slate-300-sm docked:dark:icon-slate-400-sm docked:mr-1.5" />
    <span className="flex-auto">{`${placeholder}...`}</span>
    <Kbd />
  </Button>
);

const SearchAsInput = ({ placeholder, ...props }: SearchAsButtonProps) => (
  <Button
    className="w-72 m text-right bg-transparent focus:outline-none text-slate-400 dark:text-slate-300"
    {...props}
  >
    <div className="inline-block p-1 border-b border-slate-800 dark:border-white">
      <span className="text-left text-sm w-40 inline-block">{`${placeholder}`}</span>
      <Kbd />
    </div>

    <LuSearch className="icon-slate-400 dark:icon-slate-400" />
  </Button>
);

const SearchButton = ({ lang, asInput }: SearchButtonProps) => {
  const { open, close, Modal } = useDisclosure("search-disclosure");
  const { placeholder } = withLocale(lang).config("search");

  useKeyboardShortcut(() => open(), {
    code: "KeyK",
    metaKey: true
  });

  return (
    <>
      {(asInput && <SearchAsInput placeholder={placeholder} onClick={() => open()} />) || (
        <SearchAsButton placeholder={placeholder} onClick={() => open()} />
      )}
      <Modal keepOnResize>
        <SearchAlgolia lang={lang} close={close} />
      </Modal>
    </>
  );
};

export default SearchButton;
