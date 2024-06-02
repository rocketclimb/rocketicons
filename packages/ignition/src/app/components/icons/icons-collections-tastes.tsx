"use client";
import { Fragment, useEffect, useState } from "react";
import { IconsManifestType } from "rocketicons/core";
import { CollectionID, License } from "rocketicons/data";

import Link from "next/link";

import { IoMdClose } from "rocketicons/io";

import { withLocale } from "@/locales";
import { PropsWithChildrenAndClassName, PropsWithChildrenAndLang, PropsWithLang } from "@/types";
import RocketiconsText from "@/components/rocketicons-text";
import Button from "@/components/button";

import NumberFormatter from "@/components/number-formatter";

import IconsLoader, { HandlerPros } from "@/data-helpers/icons/icons-loader";
import tastesLoader from "@/data-helpers/icons/tastes-loader";

const MAX_ITEMS = 200;

type TitleProps = {
  name: string;
};

const Title = ({ name }: TitleProps) => (
  <h4 className="truncate text-base lg:text-xl text-on-surface dark:text-on-surface-dark">
    {(name === "rocketclimb" && <RocketiconsText />) || name}
  </h4>
);

const UlContainer = ({ className, children }: PropsWithChildrenAndClassName) => (
  <ul className={`flex gap-1 overflow-hidden transition duration-700 ${className ?? ""}`}>
    {children}
  </ul>
);

type LiContainerProps = {
  id: CollectionID;
  selected: string;
} & PropsWithChildrenAndClassName;

const LiContainer = ({ id, className, selected, children }: LiContainerProps) => {
  const [isSelected, setIsSelected] = useState<boolean>(false);

  useEffect(() => {
    setIsSelected(id === selected);
  }, [selected]);

  return (
    <li
      data-selected={isSelected ? "true" : "false"}
      className={`animate-pulse has-[li]:animate-none min-h-[80px] relative px-2 py-1 rounded-xl border border-surface-border-light dark:border-0 dark:ring-1 dark:ring-inset dark:ring-surface/10 dark:bg-surface-dark data-[selected=false]:cursor-pointer data-[selected=true]:ring-1 data-[selected=true]:ring-secondary-light data-[selected=true]:dark:ring-2 data-[selected=true]:dark:ring-secondary/20 ${
        className || ""
      }`}
    >
      {children}
    </li>
  );
};

type ItemProps = {
  id: CollectionID;
  iconId?: string;
  name?: string;
} & PropsWithChildrenAndLang;

const Item = ({ id, iconId, name, lang, children }: ItemProps) => (
  <Link
    href={`/${lang}/icons/${id}/${iconId}`}
    className="group/button transition-all duration-200 flex flex-col flex-shrink-0 items-center justify-center overflow-auto size-20 xs:size-28 lg:size-36 mb-2 rounded border border-transparent hover:border-surface-border-medium dark:hover:bg-surface-medium"
  >
    {children}
    <span className="transition-all duration-200 capitalize text-[0.7rem] lg:text-[0.78rem] mt-2 max-w-16 xs:max-w-24 sm:max-w-24 lg:max-w-32 truncate group-hover/button:mt-1 group-hover/button:underline">
      {name}
    </span>
  </Link>
);

type ItemsLoaderProps = {
  size: number;
};

const ItemsLoader = ({ size }: ItemsLoaderProps) =>
  Array.from(Array(size).keys()).map((id) => (
    <li
      key={id}
      className="size-24 animate-pulse flex items-center rounded border border-surface-border dark:border-0 dark:ring-1 dark:ring-inset dark:ring-surface/10"
    ></li>
  ));

type ItemsProps = {
  id: CollectionID;
} & HandlerPros &
  PropsWithLang;

const Items = ({ id, lang, manifest, collection }: ItemsProps) => {
  return (
    <>
      {Object.values(manifest.icons)
        .slice(0, MAX_ITEMS)
        .map(({ id: iconId, name, compName }) => {
          const Icon = collection[compName];
          return (
            <li key={iconId}>
              <Item lang={lang} id={id} iconId={iconId} name={name}>
                <Icon className="transition-all duration-200 transform-gpu icon-sky-900 icon-xl xs:icon-2xl lg:icon-4xl dark:icon-sky-500 group-hover/button:icon-2xl group-hover/button:xs:icon-3xl group-hover/button:lg:icon-5xl" />
              </Item>
            </li>
          );
        })}
    </>
  );
};

type IconsCollectionsProps = PropsWithLang & {
  manifests: IconsManifestType<CollectionID, License>[];
};

const IconsCollectionsTastes = ({ lang, manifests }: IconsCollectionsProps) => {
  const locales = withLocale(lang);

  const { "show-all": showAllLabel, icon } = locales.config("show-all", "icon");

  const [selected, setSelected] = useState<string>("");

  return (
    <ul className="transition-all duration-300 mt-6 grid grid-cols-1 xs:grid-cols-2 grid-flow-dense lg:grid-cols-3 gap-3 min-[1218px]:pt-1">
      {manifests.map(({ id, name, totalIcons }, i) => {
        const tastes = tastesLoader(id);
        const isSelected = id === selected;

        return (
          <Fragment key={i}>
            <LiContainer
              id={id}
              selected={selected}
              className="group/collapsed data-[selected=true]:hidden data-[selected=true]:xs:block"
            >
              <div
                onClick={() => !isSelected && setSelected(id)}
                onKeyDown={({ key }) => key === "Enter" && !isSelected && setSelected(id)}
                role="button"
                tabIndex={0}
                className="transition-all duration-200 group-data-[selected=false]/collapsed:hover:scale-[1.01] group-data-[selected=true]/collapsed:opacity-60"
              >
                <Title name={name} />
                <p className="text-xs lg:text-sm text-primary-light rounded h-4 w-20 has-[span]:h-auto has-[span]:w-auto">
                  <span className="capitalize">
                    <NumberFormatter lang={lang} number={totalIcons} /> {icon}
                    {totalIcons > 1 && "s"}
                  </span>
                </p>

                <UlContainer className="group-data-[selected=true]/collapsed:opacity-0 md:my-1 justify-between group-data-[selected=false]/collapsed:[mask-image:--icons-fade]">
                  {tastes.slice(0, 10).map((Icon, i) => (
                    <li key={i}>
                      <Icon className="icon-sky-900-base dark:icon-sky-500-base xs:icon-sky-900-lg dark:xs:icon-sky-500-lg lg:icon-sky-900-xl dark:lg:icon-sky-500-xl" />
                    </li>
                  ))}
                </UlContainer>
              </div>
            </LiContainer>
            {isSelected && (
              <LiContainer
                id={id}
                selected={selected}
                className="group/expanded relative data-[selected=true]:col-span-1 data-[selected=true]:xs:col-span-2 data-[selected=true]:lg:col-span-3"
              >
                <Title name={name} />
                <Button
                  onClick={() => setSelected("")}
                  className="absolute top-1 right-2 w-8 h-8 items-center justify-center flex"
                >
                  <IoMdClose className="icon-slate-500 hover:icon-slate-600 dark:icon-slate-400 dark:hover:icon-slate-300" />
                </Button>
                <UlContainer className="opacity-0 has-[a]:opacity-100 min-h-32 justify-between px-0.5 gap-y-5 flex-wrap mt-4">
                  <IconsLoader
                    collectionId={id}
                    Handler={Items}
                    Loading={() => <ItemsLoader size={totalIcons} />}
                    id={id}
                    lang={lang}
                  />
                </UlContainer>
                {totalIcons > MAX_ITEMS && (
                  <div className="absolute inset-x-0 h-40 mx-0.5 bottom-1 bg-surface dark:bg-surface-dark">
                    <UlContainer className="px-6 pt-12 gap-x-5 flex-wrap justify-start h-24 sm:h-28 overflow-hidden">
                      {tastes.slice(0, 10).map((Icon, i) => (
                        <Item lang={lang} key={i} id={id}>
                          <Icon className="transition-all duration-200 transform-gpu icon-sky-900 dark:icon-sky-500 icon-4xl group-hover/button:icon-5xl" />
                        </Item>
                      ))}
                    </UlContainer>
                    <div className="absolute h-full w-full flex justify-center items-center bottom-0 rounded-xl bg-gradient-to-t from-background dark:from-background-dark">
                      <Link
                        href={`/${lang}/icons/${id}`}
                        className="transition duration-300 rounded-lg px-3 py-1 text-base text-on-surface dark:text-on-surface-dark border border-surface-border ring-1 ring-inset ring-surface/10 hover:ring-secondary-dark/95 hover:scale-105 dark:border-secondary-dark bg-surface dark:bg-surface-dark"
                      >
                        {showAllLabel}
                      </Link>
                    </div>
                  </div>
                )}
              </LiContainer>
            )}
          </Fragment>
        );
      })}
    </ul>
  );
};

export default IconsCollectionsTastes;
