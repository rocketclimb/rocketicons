"use client";
import Link from "next/link";
import { CollectionID } from "rocketicons/data";
import { IoMdClose } from "rocketicons/io";
import RocketiconsText from "@/components/rocketicons-text";
import Button from "@/components/button";

import { useIconsData } from "@/components/icons/use-icons-data";
import { PropsWithLang } from "@/types";

type IconsBlockProps = {
  id: CollectionID;
  name: string;
  isSelected: boolean;
  setSelected: (id: string | undefined) => void;
};

const IconsCollectionSummary = ({
  lang,
  id,
  name,
  isSelected,
  setSelected,
}: IconsBlockProps & PropsWithLang) => {
  const [icons, info] = useIconsData(id);

  return (
    <li
      data-selected={isSelected ? "true" : "false"}
      onClick={() => !isSelected && setSelected(id)}
      className="group animate-pulse has-[li]:animate-none min-h-[90px] relative transition-all px-2 py-1 rounded-xl border border-gray-200 dark:border-0 dark:ring-1 dark:ring-inset dark:ring-white/10 dark:bg-slate-800 data-[selected=true]:col-span-2 data-[selected=true]:lg:col-span-3 data-[selected=false]:cursor-pointer data-[selected=false]:overflow-auto"
    >
      <div className="transition-all duration-200 transform-gpu group-data-[selected=false]:hover:scale-[1.01]">
        <h4 className="text-xl text-slate-700 dark:text-slate-400">
          {(name === "rocketclimb" && <RocketiconsText />) || name}
        </h4>
        <Button
          onClick={() => setSelected(undefined)}
          className="absolute top-1 right-1 w-8 h-8 items-center justify-center hidden group-data-[selected=true]:flex"
        >
          <IoMdClose className="icon-slate-500 hover:icon-slate-600 dark:icon-slate-400 dark:hover:icon-slate-300" />
        </Button>
        <p className="text-sm text-slate-500 rounded h-4 w-20 bg-gray-200 dark:bg-slate-700 has-[span]:h-auto has-[span]:w-auto has-[span]:bg-transparent has-[span]:dark:bg-transparent">
          {icons.length !== 0 && (
            <span>
              {icons.length} Icon{icons.length > 1 && "s"}
            </span>
          )}
        </p>

        <ul className="flex gap-1 transition duration-1000 opacity-0 has-[li]:opacity-100 group-data-[selected=true]:min-h-32 group-data-[selected=true]:justify-start group-data-[selected=true]:px-4 group-data-[selected=true]:gap-x-5 group-data-[selected=true]:gap-y-10 group-data-[selected=true]:flex-wrap group-data-[selected=true]:mt-4 group-data-[selected=false]:justify-between group-data-[selected=false]:[mask-image:--icons-fade] group-data-[selected=false]:overflow-hidden">
          {(isSelected ? icons : icons.slice(0, 12)).map(([name, Icon], i) => (
            <li key={i}>
              {(!isSelected && (
                <Icon className="icon-sky-900-lg dark:icon-sky-500-lg min-[800px]:icon-sky-900-2xl dark:min-[800px]:icon-sky-500-2xl lg:icon-sky-900-lg dark:lg:icon-sky-500-lg min-[1340px]:icon-sky-900-2xl dark:min-[1340px]:icon-sky-500-2xl" />
              )) || (
                <Link
                  href={`/${lang}/icons/${id}/${info.icons[name].id}`}
                  className="group/button transition-all duration-200 flex flex-col items-center overflow-auto w-28 py-6 mb-2 hover:mb-0 rounded border border-transparent hover:border-sky-900 dark:hover:bg-slate-700"
                >
                  <Icon className="transition-all duration-200 transform-gpu icon-sky-900-4xl group-hover/button:icon-sky-900-5xl dark:icon-sky-500-4xl group-hover/button:dark:icon-sky-500-5xl" />
                  <span className="transition-all duration-200 capitalize text-xs mt-2 group-hover/button:mt-1 group-hover/button:underline">
                    {info.icons[name].name}
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
};

export default IconsCollectionSummary;
