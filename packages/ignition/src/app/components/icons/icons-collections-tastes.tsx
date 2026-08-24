import { Fragment } from "react";
import { IconsManifestType } from "rocketicons/core";
import { CollectionID, License } from "rocketicons/data";

import Link from "next/link";

import { Title } from "./li-container";

import IconsTasteProvider from "./icon-taste-provider";

import { withLocale } from "@/locales";
import { PropsWithChildrenAndClassName, PropsWithLang } from "@/types";

import NumberFormatter from "@/components/number-formatter";

import {
  IconsCollapsedCollectionTastesLoader,
  IconsExpandedCollectionTastesLoader
} from "./icons-collection-tastes-loader";

import IconsTasteSelected from "./icons-taste-selected";

import IconsTasteSelector from "./icons-taste-selector";

const MAX_ITEMS = 200;

const UlContainer = ({ className, children }: PropsWithChildrenAndClassName) => (
  <ul className={`flex gap-1 overflow-hidden transition duration-700 ${className ?? ""}`}>
    {children}
  </ul>
);

type IconsCollectionsProps = PropsWithLang & {
  manifests: Omit<IconsManifestType<CollectionID, License>, "icons">[];
};

const IconsCollectionsTastes = ({ lang, manifests }: IconsCollectionsProps) => {
  const locales = withLocale(lang);

  const { "show-all": showAllLabel, icon } = locales.config("show-all", "icon");

  return (
    <IconsTasteProvider>
      <ul className="transition-all duration-300 mt-6 grid grid-cols-1 xs:grid-cols-2 grid-flow-dense lg:grid-cols-3 gap-3 min-[1218px]:pt-1">
        {manifests.map(({ id, name, totalIcons }, i) => {
          return (
            <Fragment key={i}>
              <IconsTasteSelector id={id}>
                <Title name={name} />
                <p className="text-xs lg:text-sm text-primary-light rounded h-4 w-20 has-[span]:h-auto has-[span]:w-auto">
                  <span className="capitalize">
                    <NumberFormatter lang={lang} number={totalIcons} /> {icon}
                    {totalIcons > 1 && "s"}
                  </span>
                </p>
                <UlContainer className="group-data-[selected=true]/collapsed:opacity-0 md:my-1 justify-between group-data-[selected=false]/collapsed:[mask-image:--icons-fade]">
                  <IconsCollapsedCollectionTastesLoader
                    id={id}
                    className="icon-sky-900-base dark:icon-sky-500-base xs:icon-sky-900-lg dark:xs:icon-sky-500-lg lg:icon-sky-900-xl dark:lg:icon-sky-500-xl"
                  />
                </UlContainer>
              </IconsTasteSelector>
              <IconsTasteSelected id={id} name={name}>
                <UlContainer className="opacity-0 has-[a]:opacity-100 min-h-32 justify-between px-0.5 gap-y-5 flex-wrap mt-4">
                  <IconsExpandedCollectionTastesLoader id={id} maxItems={MAX_ITEMS} lang={lang} />
                </UlContainer>
                {totalIcons > MAX_ITEMS && (
                  <div className="absolute inset-x-0 h-40 mx-0.5 bottom-1 bg-surface dark:bg-surface-dark">
                    <UlContainer className="px-6 pt-12 gap-x-5 flex-wrap justify-start h-24 sm:h-28 overflow-hidden">
                      <IconsCollapsedCollectionTastesLoader
                        id={id}
                        className="transition-all duration-200 transform-gpu icon-sky-900 dark:icon-sky-500 icon-4xl group-hover/button:icon-5xl"
                      />
                    </UlContainer>
                    <div className="absolute h-full w-full flex justify-center items-center bottom-0 rounded-xl bg-gradient-to-t from-background dark:from-background-dark">
                      <Link
                        href={`/${lang}/icons/${id}/`}
                        className="transition duration-300 rounded-lg px-3 py-1 text-base text-on-surface dark:text-on-surface-dark border border-surface-border ring-1 ring-inset ring-surface/10 hover:ring-secondary-dark/95 hover:scale-105 dark:border-secondary-dark bg-surface dark:bg-surface-dark"
                      >
                        {showAllLabel}
                      </Link>
                    </div>
                  </div>
                )}
              </IconsTasteSelected>
            </Fragment>
          );
        })}
      </ul>
    </IconsTasteProvider>
  );
};

export default IconsCollectionsTastes;
