"use client";
import { CollectionID } from "rocketicons/data";
import { PropsWithLang } from "@/types";
import Button from "@/components/button";

import { useIconsData } from "./use-icons-data";

type IconsCollectionsProps = PropsWithLang & {
  id: CollectionID;
};

const IconsCollections = ({ lang, id }: IconsCollectionsProps) => {
  const [icons, info] = useIconsData(id);
  return (
    <ul className="flex gap-1 justify-start px-4 gap-x-5 gap-y-10 flex-wrap mt-4">
      {icons.slice(0, 200).map(([name, Icon], i) => (
        <li key={i}>
          <Button
            onClick={() =>
              window.history.pushState(
                null,
                "",
                `/${lang}/icons/${id}/${info.icons[name].id}`
              )
            }
            className="group/button transition-all duration-200 flex flex-col items-center overflow-auto w-24 sm:w-28 py-6 mb-2 hover:mb-0 rounded border border-transparent hover:border-sky-900 dark:hover:bg-slate-700"
          >
            <Icon className="transition-all duration-200 transform-gpu icon-sky-900-4xl group-hover/button:icon-sky-900-5xl dark:icon-sky-500-4xl group-hover/button:dark:icon-sky-500-5xl" />
            <span className="transition-all duration-200 capitalize text-xs mt-2 group-hover/button:mt-1 group-hover/button:underline">
              {info.icons[name].name}
            </span>
          </Button>
        </li>
      ))}
    </ul>
  );
};

export default IconsCollections;
