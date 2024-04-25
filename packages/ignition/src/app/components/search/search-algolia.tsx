"use client";
import { InstantSearch } from "react-instantsearch";
import algoliasearch from "algoliasearch/lite";
import SearchHits from "@/components/search/search-hits";
import { siteConfig } from "@/config/site";
import { serverEnv } from "@/env/server";
import { withLocale } from "@/locales";
import { Languages } from "@/types";
import SearchBox from "./search-box";

type SearchButtonProps = {
  lang: Languages;
  close: () => void;
};

const SearchAlgolia = ({ lang, close }: SearchButtonProps) => {
  const { placeholder } = withLocale(lang).config("search");

  const searchClient = algoliasearch(
    serverEnv.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID,
    serverEnv.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY
  );

  return (
    <>
      <InstantSearch searchClient={searchClient} indexName={`${siteConfig.name}-${lang}`}>
        <div className="fixed w-full h-full inset-0 flex flex-col items-center pt-8 lg:pt-[10vh] px-2 pointer-events-none">
          <div className="w-full max-w-2xl pointer-events-auto rounded-lg text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-800">
            <div className="w-full mb-2">
              <header className="flex items-center w-full px-4 border-b border-slate-100 dark:border-slate-200/5">
                <SearchBox label={placeholder} />
                <button type="reset" aria-label="Cancel" onClick={close}>
                  <abbr className="text-slate-900 dark:text-slate-400 border dark:border-0 border-slate-200 dark:bg-slate-600 p-1.5 rounded-md text-[8px] font-sans font-semibold">
                    ESC
                  </abbr>
                </button>
              </header>
            </div>
            <div className="w-full pointer-events-auto">
              <SearchHits lang={lang} />
            </div>
          </div>
        </div>
      </InstantSearch>
    </>
  );
};

export default SearchAlgolia;
