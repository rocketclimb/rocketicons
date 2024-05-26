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
  <kbd className="font-sans font-semibold dark:text-primary-light docked:dark:text-primary-lighter">
    <abbr
      title="Command"
      className="no-underline mr-1 text-primary-bright dark:text-primary-light docked:dark:text-primary-lighter"
    >
      ⌘
    </abbr>
    K
  </kbd>
);

const SearchAsButton = ({ placeholder, ...props }: SearchAsButtonProps) => (
  <Button
    className="hidden lg:flex items-center w-72 docked:w-full docked:text-sm docked:py-1.5 docked:px-3 docked:ml-1 text-left space-x-3 px-4 h-12 docked:h-auto bg-background ring-1 ring-primary/10 hover:ring-primary-bright focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm rounded-lg docked:rounded-md text-primary-lighter dark:bg-surface-dark dark:ring-0 dark:text-primary-bright docked:dark:text-primary-lighter dark:highlight-background/5 dark:hover:bg-surface-medium"
    {...props}
  >
    <LuSearch className="icon-primary-bright dark:icon-primary-lighter docked:icon-primary-bright-sm docked:dark:icon-primary-lighter-sm docked:mr-1.5" />
    <span className="flex-auto">{`${placeholder}...`}</span>
    <Kbd />
  </Button>
);

const SearchAsInput = ({ placeholder, ...props }: SearchAsButtonProps) => (
  <Button
    className="w-72 m text-right bg-transparent focus:outline-none text-primary-lighter dark:text-primary-bright"
    {...props}
  >
    <div className="inline-block p-1 border-b border-surface-dark dark:border-surface">
      <span className="text-left text-sm w-40 inline-block">{`${placeholder}`}</span>
      <Kbd />
    </div>

    <LuSearch className="icon-primary-lighter" />
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
