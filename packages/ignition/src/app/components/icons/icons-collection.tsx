"use client";
import { useState } from "react";
import { IconType } from "rocketicons";
import { IconInfo as IconInfoType } from "@rocketicons/core";
import { CollectionID } from "rocketicons/data";
import { PropsWithLang } from "@/types";
import Button from "@/components/button";

import { useIconsData } from "./use-icons-data";
import IconInfo from "./icon-info";

type IconsCollectionsProps = PropsWithLang & {
  id: CollectionID;
  icon?: string;
};

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
  info: IconInfoType;
  Icon: IconType;
};

const IconsCollections = ({ lang, id, icon }: IconsCollectionsProps) => {
  const [icons, info, isLoaded] = useIconsData(id);
  const [selected, setSelected] = useState<string>(icon || "");

  const selectIcon = (iconId: string) => {
    window.history.pushState(null, "", `/${lang}/icons/${id}/${iconId}`);
    setSelected(iconId);
  };

  const getCurrentIcon = (): CurrentIcon => {
    if (!selected) {
      return {} as CurrentIcon;
    }
    const selectedInfo = info.icons.getById(selected);
    const Icon = icons.getById(selected);
    return { info: selectedInfo, Icon } as CurrentIcon;
  };

  return (
    <div className="relative pt-40 grid grid-cols-2">
      {isLoaded && selected && (
        <IconInfo
          collectionId={id}
          onClose={() => setSelected("")}
          {...getCurrentIcon()}
        />
      )}
      <ul
        className={`flex gap-1 justify-start px-4 gap-x-5 gap-y-10 flex-wrap mt-4 ${
          !selected && "col-span-2"
        }`}
      >
        {icons
          .toArray()
          .slice(0, 200)
          .map(([name, Icon], i) => {
            const current = info.icons.getByName(name);
            return (
              <li key={i}>
                <IconSelector
                  Icon={Icon}
                  name={current.name}
                  select={() => selectIcon(current.id)}
                  selected={current.id === selected}
                />
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default IconsCollections;
