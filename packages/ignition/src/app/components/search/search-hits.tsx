"use client";
import { useInstantSearch } from "react-instantsearch";
import Link from "next/link";
import { withLocale } from "@/locales";
import { PropsWithLang } from "@/types";
import { SiAlgolia } from "rocketicons/si";
import IconLoader from "@/components/icons/icon-loader";
import { BiHash, BiLoaderAlt } from "rocketicons/bi";
import WithCopy from "@/components/documentation/with-copy";
import { PropsWithChildren } from "react";
import { GoBook } from "rocketicons/go";

const borderClass = "border-surface-lighter dark:border-surface-medium";

const Loader = () => (
  <BiLoaderAlt className="animate-spin duration-1000 icon-secondary-xl mr-3" />
);

type IconHitProps = {
  hit: any;
} & PropsWithLang;

const IconHit = ({ hit, lang }: IconHitProps) => {
  return (
    <>
      <Link
        className="grow py-3 pl-4 capitalize"
        href={`/${lang}/icons/${hit.group}/${hit.objectID}`}
      >
        <IconLoader
          collectionId={hit.group}
          icon={hit.text}
          className="icon-secondary-xl group-hover/result:icon-white-xl mr-3"
          Loading={Loader}
        />
        {hit.title}
      </Link>
      <WithCopy
        lang={lang}
        clipboardText={`<${hit.text} />`}
        className="text-left text-[0.6rem]/normal group-hover/result:xs:text-[0.7rem]/normal group-hover/result:md:text-sm md:text-sm  pr-4 !absolute md:!relative italic md:not-italic font-extralight opacity-40 md:opacity-100 group-hover/result:opacity-90 group-hover/result:md:opacity-100 right-0 bottom-0 after:hidden after:text-xs after:font-light after:-right-3 after:-top-3"
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
  const groupSlug = withLocale(hit.locale || lang).doc(hit.group)?.slug;

  return (
    <Link
      className="flex grow py-3 pl-4"
      href={
        hit.isFragment
          ? `/${hit.locale}/docs/${groupSlug}#${hit.objectID}`
          : `/${hit.locale}/docs/${hit.objectID}`
      }
    >
      <span className="grow">{hit.title}</span>
      {hit.isFragment ? (
        <BiHash className="icon-primary-bright dark:icon-primary-lighter align-center mr-3" />
      ) : (
        <GoBook className="icon-primary-bright dark:icon-primary-lighter align-center mr-3" />
      )}
    </Link>
  );
};

const ImporterInfo = ({ children }: PropsWithChildren) => (
  <span className="transition-opacity duration-300 opacity-5 group-hover/result-title:opacity-100">
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
    className="group/copy font-monospace text-[0.65rem]/normal md:text-xs/normal !absolute md:!relative top-0 right-0 font-light italic pt-2 after:text-primary-dark after:not-italic after:font-inter after:-right-3 after:-top-5"
  >
    <ImporterInfo>import * as Icons from &quot;</ImporterInfo>
    <span>{component}</span>
    <ImporterInfo>&quot;;</ImporterInfo>
  </WithCopy>
);

type ResultTitleProps = {
  label: string;
} & PropsWithChildren;

const ResultTitle = ({ label, children }: ResultTitleProps) => (
  <div className="group/result-title text-xs md:text-base/6 text-primary dark:text-primary-dark relative cursor-default pt-1 md:pt-6 mt-5 mb-4 md:flex">
    <h2 className="group-hover/result-title:opacity-0 transition-opacity duration-300 grow font-semibold">
      {label}
    </h2>
    {children}
  </div>
);

const ResultItem = ({ children }: PropsWithChildren) => (
  <li className="group/result relative w-full flex rounded-lg mb-2 text-sm font-normal text-primary-light dark:text-primary-dark hover:text-primary-dark bg-background dark:bg-surface-medium/30 hover:bg-secondary hover:dark:bg-secondary">
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

const IconResult = ({ id, group, hits, lang }: IconResultProps) => {
  const groupTitle = hits[0]?.groupName ?? group;

  return (
    <div className="m-2">
      <ResultTitle label={groupTitle}>
        <Importer lang={lang} component={`rocketicons/${id}`} />
      </ResultTitle>
      <ul>
        {hits.map((hit: any) => (
          <ResultItem key={hit.objectID}>
            <IconHit lang={lang} hit={hit} />
          </ResultItem>
        ))}
      </ul>
    </div>
  );
};

const HitResult = ({ group, hits, lang }: HitResultProps) => {
  const groupTitle = hits[0]?.groupName ?? group;

  const hitsWithNoParent = hits.filter((hit: any) => hit.group !== hit.objectID);

  return (
    <div className="m-2">
      <ResultTitle label={groupTitle} />
      <ul>
        {hitsWithNoParent.map((hit: any) => (
          <ResultItem key={hit.objectID}>
            <Hit lang={lang} hit={hit} />
          </ResultItem>
        ))}
      </ul>
    </div>
  );
};

type GroupedHitsProps = {
  groupedHits: any;
} & PropsWithLang;

const IconsGroupedHits = ({ lang, groupedHits }: GroupedHitsProps) =>
  Object.values(groupedHits || {})
    .sort(({ group: groupA }: any, { group: groupB }: any) => groupA.localeCompare(groupB))
    .map(({ id, group, hits }: any) => (
      <IconResult key={group} id={id} group={group} lang={lang} hits={hits} />
    ));

const GroupedHits = ({ lang, groupedHits }: GroupedHitsProps) =>
  Object.values(groupedHits || {})
    .sort(({ group: groupA }: any, { group: groupB }: any) => groupA.localeCompare(groupB))
    .map(({ group, hits }: any) => {
      return <HitResult key={group} group={group} lang={lang} hits={hits} />;
    });

const SearchHits = ({ lang }: PropsWithLang) => {
  const { "no-results": noResults } = withLocale(lang).config("search");
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
          hits: []
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
          className={`px-2 h-full min-h-40 max-h-80 xs:max-h-[80dvh] lg:max-h-[65vh] overflow-auto thin-scroll ${borderClass}`}
        >
          {results.nbHits > 0 && Object.keys(groupedHits.icons).length > 0 && (
            <IconsGroupedHits groupedHits={groupedHits.icons} lang={lang} />
          )}
          {results.nbHits > 0 && Object.keys(groupedHits.documents).length > 0 && (
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
