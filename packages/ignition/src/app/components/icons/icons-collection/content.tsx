"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { CollectionDataInfo, IconType } from "rocketicons";
import { IconInfo as IconInfoType } from "rocketicons";

import Button from "@/components/button";

import { HandlerPros } from "@/components/icons/icons-loader";
import IconInfo from "@/components/icons/icon-info";

import { IconsCollectionsProps } from "./types";
import { CollectionID, License } from "rocketicons/data";

type IconSelectorProp = {
  name: string;
  select: () => void;
  Icon: IconType;
  selected?: boolean;
};

const IconSelector = ({ name, select, Icon, selected }: IconSelectorProp) => (
  <Button
    onClick={() => select()}
    data-selected={selected}
    className="group/button transition-all duration-200 flex flex-col items-center overflow-none w-24 sm:w-28 py-6 mb-2 hover:mb-0 rounded border border-transparent data-[selected=true]:border-sky-900 data-[selected=true]:dark:border-slate-700 hover:border-sky-900 data-[selected=true]:dark:bg-slate-700 dark:hover:bg-slate-700"
  >
    <Icon className="transition-all duration-200 transform-gpu icon-sky-900-4xl group-hover/button:icon-sky-900-5xl dark:icon-sky-500-4xl group-hover/button:dark:icon-sky-500-5xl" />
    <span className="transition-all duration-200 capitalize max-w-24 truncate mx-3 text-xs mt-2 group-hover/button:mt-1 group-hover/button:underline">
      {name}
    </span>
  </Button>
);

type CurrentIcon = {
  id: string;
  info: IconInfoType;
  Icon: IconType;
};

type SelectedId = { id: string | "" };

type SelectedIcon = SelectedId | CurrentIcon;

const getCurrentInfo = (
  icon: string,
  manifest: CollectionDataInfo<CollectionID, License>,
  collection: Record<string, IconType>
) => {
  const info = Object.values(manifest.icons).find(({ id }) => id === icon)!;
  return { info, Icon: collection[info.compName] };
};

const Content = ({
  id,
  lang,
  icon,
  manifest,
  collection,
}: HandlerPros & IconsCollectionsProps) => {
  const [, , slug] = usePathname().split("/");

  const [selected, setSelected] = useState<SelectedIcon>(
    (icon && {
      id: icon,
      ...getCurrentInfo(icon, manifest, collection),
    }) || { id: "" }
  );

  const selectIcon = (iconId: string, info?: IconInfoType, Icon?: IconType) => {
    window.history.pushState(null, "", `/${lang}/icons/${id}/${iconId}`);
    setSelected({ id: iconId, info, Icon });
  };

  const getCurrentIcon = (): CurrentIcon =>
    ((selected as CurrentIcon).Icon ? selected : {}) as CurrentIcon;

  return (
    <>
      <IconInfo
        lang={lang}
        show={!!selected.id}
        collectionId={id}
        onClose={() => {
          window.history.pushState(null, "", `/${lang}/${slug}/${id}`);
          setSelected({ id: "" });
        }}
        {...getCurrentIcon()}
      />
      <ul className="transition-all duration-200 ml-0 mt-0 lg:mt-[-630px] min-h-[655px] flex gap-1 justify-between px-4 gap-x-5 gap-y-10 flex-wrap">
        {Object.values(manifest.icons).map((iconInfo, i) => {
          const { id, name, compName } = iconInfo;
          const Icon = collection[compName];
          return (
            <li key={i}>
              <IconSelector
                Icon={Icon}
                name={name}
                select={() => selectIcon(id, iconInfo, Icon)}
                selected={selected.id === id}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default Content;
