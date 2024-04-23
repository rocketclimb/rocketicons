"use client";
import { useInstantSearch, Highlight } from "react-instantsearch";
import Link from "next/link";
import { useLocale } from "@/locales";
import { PropsWithChildrenAndClassName, PropsWithLang } from "@/types";
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

type LinkWithCloseProps = {
  href: string;
} & PropsWithChildrenAndClassName;

const IconHit = ({ hit, lang }: IconHitProps) => {
  console.log(hit);
  return (
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
};

type PropsHit = {
  hit: any;
} & PropsWithLang;

const Hit = ({ hit, lang }: PropsHit) => {
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
      <Highlight attribute="title" hit={hit} highlightedTagName="span" />
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

type ResultTitleProps = {
  label: string;
} & PropsWithChildren;

const ResultTitle = ({ label, children }: ResultTitleProps) => (
  <div className="text-slate-900 dark:text-slate-200 flex cursor-default pt-6 mb-4 leading-6">
    <h2 className="grow font-semibold">{label}</h2>
    {children}
  </div>
);

const ResultItem = ({ children }: PropsWithChildren) => (
  <li className="group/result w-full flex rounded-lg mb-2 text-sm font-normal text-slate-500 dark:text-slate-200 hover:text-white bg-slate-50 dark:bg-slate-700/30 hover:bg-sky-500 hover:dark:bg-sky-500">
    {children}
  </li>
);

type HitResultProps = {
  group: string;
  hits: any;
} & PropsWithLang;

type IconResultProps = {
  id: string;
} & HitResultProps;

const IconResult = ({ id, group, hits, lang }: IconResultProps) => (
  <div className="m-2">
    <ResultTitle label={group}>
      <Importer lang={lang} component={`rocketicons/${id}`} />
    </ResultTitle>
    <ul>
      {(hits as any).map((hit: any) => (
        <ResultItem key={hit.objectID}>
          <IconHit lang={lang} hit={hit} />
        </ResultItem>
      ))}
    </ul>
  </div>
);

const HitResult = ({ group, hits, lang }: HitResultProps) => (
  <div className="m-2">
    <ResultTitle label={group} />
    <ul>
      {(hits as any).map((hit: any) => (
        <ResultItem key={hit.objectID}>
          <Hit lang={lang} hit={hit} />
        </ResultItem>
      ))}
    </ul>
  </div>
);

type GroupedHitsProps = {
  groupedHits: any;
} & PropsWithLang;

const IconsGroupedHits = ({ lang, groupedHits }: GroupedHitsProps) =>
  Object.values(groupedHits || {})
    .sort(({ group: groupA }: any, { group: groupB }: any) =>
      groupA.localeCompare(groupB)
    )
    .map(({ id, group, hits }: any) => (
      <IconResult key={group} id={id} group={group} lang={lang} hits={hits} />
    ));

const GroupedHits = ({ lang, groupedHits }: GroupedHitsProps) =>
  Object.values(groupedHits || {})
    .sort(({ group: groupA }: any, { group: groupB }: any) =>
      groupA.localeCompare(groupB)
    )
    .map(({ group, hits }: any) => (
      <HitResult key={group} group={group} lang={lang} hits={hits} />
    ));

const SearchHits = ({ lang }: PropsWithLang) => {
  const { "no-results": noResults } = useLocale(lang).config("search");
  const { results } = useInstantSearch();

  const groupedHits = results.hits.reduce(
    (groups: any, hit: any) => {
      if (hit.group) {
        const key = hit.groupName || hit.group;
        const group = hit.isIcon ? groups["icons"] : groups["documents"];
        group[key] = group[key] || {
          id: hit.group,
          group: key,
          isIcon: hit.isIcon,
          hits: [],
        };
        group[key].hits.push(hit);
      }
      return groups;
    },
    { icons: {}, documents: {} }
  );

  return (
    <>
      <div className="px-1">
        {results.nbHits === 0 && <div className="py-3 px-6">{noResults}</div>}
        <div
          className={`px-2 h-full min-h-40 max-h-[600px] lg:max-h-[65vh] overflow-auto thin-scroll ${borderClass}`}
        >
          {results.nbHits > 0 && Object.keys(groupedHits.icons).length > 0 && (
            <IconsGroupedHits groupedHits={groupedHits.icons} lang={lang} />
          )}
          {results.nbHits > 0 &&
            Object.keys(groupedHits.documents).length > 0 && (
              <GroupedHits groupedHits={groupedHits.documents} lang={lang} />
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

export default SearchHits;
