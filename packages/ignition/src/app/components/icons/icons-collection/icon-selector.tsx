"use client";
import { useRouter } from "next/navigation";
import { CollectionID } from "rocketicons/data";
import Button from "@/components/button";
import { PropsWithChildrenAndLang } from "@/types";

type IconSelectorProp = {
  id: string;
  name: string;
  selected?: string;
  collectionId: CollectionID;
} & PropsWithChildrenAndLang;

const IconSelector = ({ id, name, lang, selected, collectionId, children }: IconSelectorProp) => {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push(`/${lang}/icons/${collectionId}/${id}`)}
      data-selected={selected === id}
      className="group/button transition-all duration-200 flex flex-col items-center overflow-none w-24 xs:w-28 sm:w-28 py-6 mb-2 hover:mb-0 rounded border border-transparent data-[selected=true]:border-sky-900 data-[selected=true]:dark:border-slate-700 hover:border-sky-900 data-[selected=true]:dark:bg-slate-700 dark:hover:bg-slate-700"
    >
      {children}
      <span className="transition-all duration-200 capitalize max-w-20 xs:max-w-24 truncate text-[0.7rem] mt-2 group-hover/button:mt-1 group-hover/button:underline">
        {name}
      </span>
    </Button>
  );
};

export default IconSelector;
