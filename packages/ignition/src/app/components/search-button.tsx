"use client";

import { InstantSearch } from "react-instantsearch-dom";
import algoliasearch from "algoliasearch/lite";
import SearchBox from "./search-box";
import SearchHits from "./search-hits";
import { siteConfig } from "@/config/site";
import { serverEnv } from "@/env/server";
import { useLocale } from "@/locales";
import { Languages } from "@/types";

type SearchButtonProps = {
  lang: Languages;
};

const SearchButton = ({ lang }: SearchButtonProps) => {
  const search = useLocale(lang).config("search");

  const searchClient = algoliasearch(
    serverEnv.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID,
    serverEnv.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY
  );

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={`${siteConfig.name}-${lang}`}
    >
      <div className="mx-1 flex flex-col relative z-50">
        <SearchBox label={search["placeholder"]} />
        <SearchHits lang={lang} />
      </div>
    </InstantSearch>
  );
};

export default SearchButton;
