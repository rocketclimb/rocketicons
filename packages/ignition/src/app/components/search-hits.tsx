// ./src/components/SearchHits.js

import { connectStateResults, Highlight } from "react-instantsearch-dom";
import Link from "next/link";
import { Key } from "react";
import { useLocale } from "@/locales";
import { Languages } from "@/types";
import { BiLogoAlgolia } from "rocketicons/bi";
import { SiAlgolia } from "rocketicons/si";

const borderClass = "border-slate-100 dark:border-slate-700";

function Hit(hit: any) {
  const groupSlug = useLocale(hit.locale, hit.group).docFromIndex().slug;

  return (
    <Link
      key={hit.objectID}
      className={`flex items-center gap-4 border-t ${borderClass} first:rounded-t-xl last:rounded-b-xl first:border-0 py-3 px-3 focus:outline-none focus:ring-4 ring-inset ring-slate-200 dark:ring-slate-600 transition-colors hover:bg-slate-200 dark:hover:bg-slate-600`}
      href={
        hit.isFragment
          ? `/${hit.locale}/docs/${groupSlug}#${hit.objectID}`
          : `/${hit.locale}/docs/${hit.objectID}`
      }
    >
      <Highlight attribute="title" hit={hit} tagName="mark" />
    </Link>
  );
}

function SearchHits({
  lang,
  searchState,
  searchResults,
}: {
  lang: Languages;
  searchState: any;
  searchResults: any;
}) {
  const search = useLocale(lang).config("search");

  return (
    searchState.query && (
      <div className="relative">
        <div
          className={`bg-white dark:bg-slate-800 border ${borderClass}  rounded-xl absolute top-1 right-0 left-0 shadow-2xl`}
        >
          {searchResults?.hits.length === 0 && (
            <div className="py-3 px-6">{search["no-results"]}</div>
          )}
          {searchResults?.hits.length > 0 &&
            searchResults.hits.map((hit: any) => {
              return <Hit {...hit} />;
            })}{" "}
          <div className={`p-2 text-right border-t ${borderClass}`}>
            <Link href={"https://www.algolia.com"} target="_blank">
              <SiAlgolia />
            </Link>
          </div>
        </div>
      </div>
    )
  );
}

export default connectStateResults(SearchHits);