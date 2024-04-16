"use client";

import { InstantSearch } from "react-instantsearch-dom";
import algoliasearch from "algoliasearch/lite";
import SearchBox from "./search-box";
import SearchHits from "./search-hits";
import { siteConfig } from "@/config/site";
import { serverEnv } from "@/env/server";
import { useLocale } from "@/locales";
import { Languages } from "@/types";
import { useRef, useState } from "react";
import SearchBoxInnerContents from "./search-box-inner-contents";

type SearchButtonProps = {
  lang: Languages;
};

const SearchButton = ({ lang }: SearchButtonProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const search = useLocale(lang).config("search");

  const searchClient = algoliasearch(
    serverEnv.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID,
    serverEnv.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY
  );

  const ToggleModal = (e: any) => {
    if (!modalOpen || (modalOpen && e.target.id === "backdrop")) {
      setModalOpen(!modalOpen);
    }
  };

  const SearchBoxInnerComponent = () => (
    <SearchBoxInnerContents label={search["placeholder"]} />
  );

  return (
    <>
      <InstantSearch
        searchClient={searchClient}
        indexName={`${siteConfig.name}-${lang}`}
      >
        <SearchBox
          onClick={ToggleModal}
          className={modalOpen ? "invisible" : ""}
        >
          <SearchBoxInnerComponent />
        </SearchBox>
        {modalOpen && (
          <div className="mx-1 flex flex-col relative z-50">
            <div
              id="backdrop"
              className="fixed inset-0 flex items-center justify-center bg-slate-900 bg-opacity-75"
              onClick={ToggleModal}
            >
              <div className="max-w-md w-full -translate-y-32">
                <SearchBoxInnerComponent />
                <SearchHits lang={lang}></SearchHits>
              </div>
            </div>
          </div>
        )}
      </InstantSearch>
    </>
  );
};

export default SearchButton;
