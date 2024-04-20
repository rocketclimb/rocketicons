import { InstantSearch } from "react-instantsearch-dom";
import algoliasearch from "algoliasearch/lite";
import SearchHits from "@/components/search/search-hits";
import { siteConfig } from "@/config/site";
import { serverEnv } from "@/env/server";
import { useLocale } from "@/locales";
import { Languages } from "@/types";
import SearchBoxInnerContentsAlgolia from "./search-box-inner-contents-algolia";

type SearchButtonProps = {
  lang: Languages;
  inputRef?: React.RefObject<HTMLInputElement>;
};

const SearchAlgolia = ({ lang, inputRef }: SearchButtonProps) => {
  const search = useLocale(lang).config("search");

  const searchClient = algoliasearch(
    serverEnv.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID,
    serverEnv.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY
  );

  const SearchBoxInnerComponent = ({ className }: { className?: string }) => (
    <SearchBoxInnerContentsAlgolia
      label={search["placeholder"]}
      inputRef={inputRef}
      className={className}
    />
  );

  return (
    <>
      <InstantSearch
        searchClient={searchClient}
        indexName={`${siteConfig.name}-${lang}`}
      >
        <div className="fixed w-full h-full inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-1/3 pointer-events-auto">
            <SearchBoxInnerComponent />
          </div>

          <div className="w-1/2 pointer-events-auto">
            <SearchHits lang={lang} />
          </div>
        </div>
      </InstantSearch>
    </>
  );
};

export default SearchAlgolia;
