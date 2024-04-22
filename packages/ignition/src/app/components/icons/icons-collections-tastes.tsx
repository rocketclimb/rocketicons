"use client";
import { Fragment, useEffect, useState } from "react";
import { IconsManifestType } from "rocketicons/core";
import { CollectionID, License } from "rocketicons/data";

import Link from "next/link";

import { IoMdClose } from "rocketicons/io";

import { useLocale } from "@/locales";
import {
  PropsWithChildrenAndClassName,
  PropsWithChildrenAndLang,
  PropsWithLang,
} from "@/types";
import RocketiconsText from "@/components/rocketicons-text";
import Button from "@/components/button";

import IconsLoader, { HandlerPros } from "@/data-helpers/icons/icons-loader";
import tastesLoader from "@/data-helpers/icons/tastes-loader";

const MAX_ITEMS = 200;

type TitleProps = {
  name: string;
};

const Title = ({ name }: TitleProps) => (
  <h4 className="text-xl text-slate-700 dark:text-slate-400">
    {(name === "rocketclimb" && <RocketiconsText />) || name}
  </h4>
);

const UlContainer = ({
  className,
  children,
}: PropsWithChildrenAndClassName) => (
  <ul
    className={`flex gap-1 overflow-hidden transition duration-700 ${
      className ?? ""
    }`}
  >
    {children}
  </ul>
);

type LiContainerProps = {
  id: CollectionID;
  selected: string;
} & PropsWithChildrenAndClassName;

const LiContainer = ({
  id,
  className,
  selected,
  children,
}: LiContainerProps) => {
  const [isSelected, setIsSelected] = useState<boolean>(false);

  useEffect(() => {
    setIsSelected(id === selected);
  }, [selected]);

  return (
    <li
      data-selected={isSelected ? "true" : "false"}
      className={`animate-pulse has-[li]:animate-none min-h-[90px] relative px-2 py-1 rounded-xl border border-gray-200 dark:border-0 dark:ring-1 dark:ring-inset dark:ring-white/10 dark:bg-slate-800 data-[selected=false]:cursor-pointer data-[selected=true]:ring-1 data-[selected=true]:ring-sky-800 data-[selected=true]:dark:ring-2 data-[selected=true]:dark:ring-sky-500/20 ${
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
    className="group/button transition-all duration-200 flex flex-col flex-shrink-0 items-center overflow-auto size-24 sm:size-28 py-6 mb-2 hover:mb-0 rounded border border-transparent hover:border-sky-900 dark:hover:bg-slate-700"
  >
    {children}
    <span className="transition-all duration-200 capitalize text-xs mt-2 group-hover/button:mt-1 group-hover/button:underline">
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
      className="size-24 animate-pulse flex items-center rounded border border-slate-200 dark:border-0 dark:ring-1 dark:ring-inset dark:ring-white/10"
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
                <Icon className="transition-all duration-200 transform-gpu icon-sky-900-4xl group-hover/button:icon-sky-900-5xl dark:icon-sky-500-4xl group-hover/button:dark:icon-sky-500-5xl" />
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
  const locales = useLocale(lang);

  const { "show-all": showAllLabel, icon } = locales.config("show-all", "icon");

  const [selected, setSelected] = useState<string>("");

  return (
    <ul className="transition-all duration-300 mt-6 grid grid-cols-2 grid-flow-dense lg:grid-cols-3 gap-3 min-[1218px]:pt-1">
      {manifests.map(({ id, name, totalIcons }, i) => {
        const tastes = tastesLoader(id);
        const isSelected = id === selected;

        return (
          <Fragment key={i}>
            <LiContainer
              id={id}
              selected={selected}
              className="group/collapsed"
            >
              <div
                onClick={() => !isSelected && setSelected(id)}
                onKeyDown={({ key }) =>
                  key === "Enter" && !isSelected && setSelected(id)
                }
                role="button"
                tabIndex={0}
                className="transition-all duration-200 group-data-[selected=false]/collapsed:hover:scale-[1.01] group-data-[selected=true]/collapsed:opacity-60"
              >
                <Title name={name} />
                <p className="text-sm text-slate-500 rounded h-4 w-20 bg-gray-200 dark:bg-slate-700 has-[span]:h-auto has-[span]:w-auto has-[span]:bg-transparent has-[span]:dark:bg-transparent">
                  <span className="capitalize">
                    {totalIcons} {icon}
                    {totalIcons > 1 && "s"}
                  </span>
                </p>

                <UlContainer className="group-data-[selected=true]/collapsed:opacity-0 justify-between group-data-[selected=false]/collapsed:[mask-image:--icons-fade]">
                  {tastes.slice(0, 10).map((Icon, i) => (
                    <li key={i}>
                      <Icon className="icon-sky-900-lg dark:icon-sky-500-lg min-[800px]:icon-sky-900-2xl dark:min-[800px]:icon-sky-500-2xl lg:icon-sky-900-lg dark:lg:icon-sky-500-lg min-[1340px]:icon-sky-900-2xl dark:min-[1340px]:icon-sky-500-2xl" />
                    </li>
                  ))}
                </UlContainer>
              </div>
            </LiContainer>
            {isSelected && (
              <LiContainer
                id={id}
                selected={selected}
                className="group/expanded relative data-[selected=true]:col-span-2 data-[selected=true]:lg:col-span-3"
              >
                <Title name={name} />
                <Button
                  onClick={() => setSelected("")}
                  className="absolute top-1 right-2 w-8 h-8 items-center justify-center flex"
                >
                  <IoMdClose className="icon-slate-500 hover:icon-slate-600 dark:icon-slate-400 dark:hover:icon-slate-300" />
                </Button>
                <UlContainer className="opacity-0 has-[a]:opacity-100 min-h-32 justify-start px-4 gap-x-5 gap-y-10 flex-wrap mt-4">
                  <IconsLoader
                    collectionId={id}
                    Handler={Items}
                    Loading={() => <ItemsLoader size={totalIcons} />}
                    id={id}
                    lang={lang}
                  />
                </UlContainer>
                {totalIcons > MAX_ITEMS && (
                  <div className="absolute inset-x-0 h-40 mx-0.5 bottom-1 bg-white dark:bg-slate-800">
                    <UlContainer className="px-6 pt-12 gap-x-5 flex-wrap justify-start h-24 sm:h-28 overflow-hidden">
                      {tastes.slice(0, 10).map((Icon, i) => (
                        <Item lang={lang} key={i} id={id}>
                          <Icon className="transition-all duration-200 transform-gpu icon-sky-900-4xl group-hover/button:icon-sky-900-5xl dark:icon-sky-500-4xl group-hover/button:dark:icon-sky-500-5xl" />
                        </Item>
                      ))}
                    </UlContainer>
                    <div className="absolute h-full w-full flex justify-center items-center bottom-0 rounded-xl bg-gradient-to-t from-white dark:from-slate-900">
                      <Link
                        href={`/${lang}/icons/${id}`}
                        className="transition duration-300 rounded-lg px-3 py-1 text-base text-slate-700 dark:text-slate-400 border border-slate-200 ring-1 ring-inset ring-white/10 hover:ring-sky-900 hover:scale-105  dark:border-sky-950 bg-white dark:bg-slate-800"
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
