// ./src/components/SearchHits.js

import { connectStateResults, Highlight } from "react-instantsearch-dom";
import Link from "next/link";
import { useLocale } from "@/locales";
import { Languages } from "@/types";
import { SiAlgolia } from "rocketicons/si";
import IconLoader from "@/components/icons/icon-loader";
import { RcRocketIcon } from "rocketicons/rc";
import { BiLoader, BiLoaderAlt } from "rocketicons/bi";

const borderClass = "border-slate-100 dark:border-slate-700";
const linkClass = `flex items-center gap-4 border-t ${borderClass} first:border-0 py-3 px-3 focus:outline-none focus:ring-4 ring-inset ring-slate-200 dark:ring-slate-600 transition-colors hover:bg-slate-200 dark:hover:bg-slate-600`;

const Loader = () => <BiLoaderAlt className="animate-spin duration-1000" />;

function IconHit(hit: any, lang: Languages) {
  return (
    <Link className={linkClass} href={`/en/icons/${hit.group}/${hit.objectID}`}>
      <IconLoader collectionId={hit.group} icon={hit.text} Loading={Loader} />
      <span className="grow">{hit.name}</span>
      <span>{`<${hit.text} />`}</span>
    </Link>
  );
}

function Hit(hit: any, lang: Languages) {
  const groupSlug = useLocale(hit.locale || lang, hit.group).docFromIndex()
    ?.slug;

  return (
    <Link
      className={linkClass}
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
  if (!searchResults) {
    return <></>;
  }

  const search = useLocale(lang).config("search");

  const groupedHits = searchResults?.hits.reduce((groups: any, hit: any) => {
    if (hit.group) {
      const key = hit.groupName || hit.group;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(hit);
    }
    return groups;
  }, {});

  const renderGroupedHits = Object.entries(groupedHits)
    .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
    .map(([group, hits]) => (
      <div key={group} className="m-2">
        <h2>{group}</h2>
        {(hits as any).map((hit: any) => {
          return hit.isIcon ? (
            <IconHit key={hit.objectID} lang={lang} {...hit} />
          ) : (
            <Hit key={hit.objectID} lang={lang} {...hit} />
          );
        })}
      </div>
    ));

  return (
    searchState.query && (
      <div className="relative float">
        <div
          className={`h-96 overflow-auto bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-200 ${borderClass} rounded-xl absolute top-1 right-0 left-0 shadow-2xl`}
        >
          {searchResults?.hits.length === 0 && (
            <div className="py-3 px-6">{search["no-results"]}</div>
          )}
          {searchResults?.hits.length > 0 && groupedHits && renderGroupedHits}
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
