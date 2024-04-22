import { connectStateResults, Highlight } from "react-instantsearch-dom";
import Link from "next/link";
import { useLocale } from "@/locales";
import { Languages, PropsWithLang } from "@/types";
import { SiAlgolia } from "rocketicons/si";
import IconLoader from "@/components/icons/icon-loader";
import { BiLoaderAlt } from "rocketicons/bi";
import WithCopy from "@/components/documentation/with-copy";
import { PropsWithChildren } from "react";

const borderClass = "border-slate-100 dark:border-slate-700";

const Loader = () => (
  <BiLoaderAlt className="animate-spin duration-1000 icon-sky-500-xl mr-3" />
);

type IconHitProps = {
  hit: any;
} & PropsWithLang;

const IconHit = ({ hit, lang }: IconHitProps) => (
  <>
    <Link
      className="grow py-3 pl-4"
      href={`/${lang}/icons/${hit.group}/${hit.objectID}`}
    >
      <IconLoader
        collectionId={hit.group}
        icon={hit.text}
        className="icon-sky-500-xl group-hover/result:icon-white-xl mr-3"
        Loading={Loader}
      />
      {hit.name}
    </Link>
    <WithCopy
      lang={lang}
      clipboardText={`<${hit.text} />`}
      className="text-left pr-4 relative after:hidden after:text-xs after:font-light after:-right-3 after:-top-3"
    >
      <span className="font-monospace font-light">{`<${hit.text} />`}</span>
    </WithCopy>
  </>
);

const Hit = (hit: any, lang: Languages) => {
  const groupSlug = useLocale(hit.locale || lang).doc(hit.group)?.slug;

  return (
    <Link
      className="grow py-3 pl-4"
      href={
        hit.isFragment
          ? `/${hit.locale}/docs/${groupSlug}#${hit.objectID}`
          : `/${hit.locale}/docs/${hit.objectID}`
      }
    >
      <Highlight attribute="title" hit={hit} tagName="mark" />
    </Link>
  );
};

const ImporterInfo = ({ children }: PropsWithChildren) => (
  <span className="transition-opacity duration-300 opacity-5 group-hover/copy:opacity-100">
    {children}
  </span>
);

type ImporterProps = {
  component: string;
} & PropsWithLang;

const Importer = ({ component, lang }: ImporterProps) => (
  <WithCopy
    lang={lang}
    clipboardText={`import * as Icons from "${component}";`}
    className="group/copy font-monospace text-xs font-light italic pt-2 after:text-slate-200 after:not-italic after:font-inter after:-right-3 after:-top-5"
  >
    <ImporterInfo>import * as Icons from "</ImporterInfo>
    <span>{component}</span>
    <ImporterInfo>";</ImporterInfo>
  </WithCopy>
);

type GroupedHitsProps = {
  groupedHits: any;
} & PropsWithLang;

const GroupedHits = ({ lang, groupedHits }: GroupedHitsProps) =>
  Object.values(groupedHits || {})
    .sort(({ group: groupA }: any, { group: groupB }: any) =>
      groupA.localeCompare(groupB)
    )
    .map(({ id, group, isIcon, hits }: any) => (
      <div key={group} className="m-2">
        <div className="text-slate-900 dark:text-slate-200 flex cursor-default pt-6 mb-4 leading-6">
          <h2 className="grow font-semibold">{group}</h2>
          {isIcon && <Importer lang={lang} component={`rocketicons/${id}`} />}
        </div>
        <ul>
          {(hits as any).map((hit: any) => (
            <li
              key={hit.objectID}
              className="group/result w-full flex rounded-lg mb-2 text-sm font-normal text-slate-500 dark:text-slate-200 hover:text-white bg-slate-50 dark:bg-slate-700/30 hover:bg-sky-500 hover:dark:bg-sky-500"
            >
              {hit.isIcon ? (
                <IconHit lang={lang} hit={hit} />
              ) : (
                <Hit lang={lang} {...hit} />
              )}
            </li>
          ))}
        </ul>
      </div>
    ));

const SearchHits = ({
  lang,
  searchResults,
}: {
  searchState: any;
  searchResults: any;
} & PropsWithLang) => {
  const { "no-results": noResults } = useLocale(lang).config("search");

  const groupedHits = searchResults?.hits.reduce((groups: any, hit: any) => {
    if (hit.group) {
      const key = hit.groupName || hit.group;
      groups[key] = groups[key] || {
        id: hit.group,
        group: key,
        isIcon: hit.isIcon,
        hits: [],
      };
      groups[key].hits.push(hit);
    }
    return groups;
  }, {});

  return (
    <>
      <div className="px-1">
        {searchResults?.hits.length === 0 && (
          <div className="py-3 px-6">{noResults}</div>
        )}
        <div
          className={`px-2 h-full min-h-40 max-h-[600px] lg:max-h-[65vh] overflow-auto thin-scroll ${borderClass}`}
        >
          {searchResults?.hits.length > 0 && groupedHits && (
            <GroupedHits groupedHits={groupedHits} lang={lang} />
          )}
        </div>
      </div>
      <div className={`p-4 text-right h-14 border-t ${borderClass}`}>
        <Link href={"https://www.algolia.com"} target="_blank">
          <SiAlgolia />
        </Link>
      </div>
    </>
  );
};

export default connectStateResults(SearchHits);
