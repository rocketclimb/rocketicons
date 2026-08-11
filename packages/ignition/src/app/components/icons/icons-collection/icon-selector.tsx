"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { CollectionID } from "rocketicons/data";
import Button from "@/components/button";
import { PropsWithChildrenAndLang } from "@/types";

type IconSelectorProp = {
  id: string;
  name: string;
  collectionId: CollectionID;
} & PropsWithChildrenAndLang;

const IconSelector = ({ id, name, lang, collectionId, children }: IconSelectorProp) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Button
      onClick={() => {
        const next = new URLSearchParams(searchParams.toString());
        next.set("icon", id);
        router.push(`/${lang}/icons/${collectionId}/?${next.toString()}`);
      }}
      data-selected={searchParams.get("icon") === id}
      className="group/button transition-all duration-200 flex flex-col items-center overflow-none w-24 xs:w-28 sm:w-28 py-6 mb-2 hover:mb-0 rounded border border-transparent data-[selected=true]:border-secondary-medium data-[selected=true]:dark:border-slate-700 hover:border-surface-border-medium data-[selected=true]:dark:bg-surface-medium dark:hover:bg-surface-medium"
    >
      {children}
      <span className="transition-all duration-200 capitalize max-w-20 xs:max-w-24 truncate text-[0.7rem] mt-2 group-hover/button:mt-1 group-hover/button:underline">
        {name}
      </span>
    </Button>
  );
};

export default IconSelector;
