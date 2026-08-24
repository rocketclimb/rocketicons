import Link from "next/link";
import { IconFromData } from "@rocketicons/core";
import { getCollectionIcons } from "@/catalog/server";
import { CollectionID } from "rocketicons/data";
import { PropsWithLang } from "@/types";

export const IconsCollapsedCollectionTastesLoader = async ({
  id,
  className
}: {
  id: string;
  className: string;
}) => {
  const svgs = await getCollectionIcons(id, 10);
  return (
    <>
      {svgs.map(({ id, iconTree, variant }) => (
        <li key={id}>
          <IconFromData className={className} iconTree={iconTree} variant={variant} />
        </li>
      ))}
    </>
  );
};

type ItemsProps = {
  id: CollectionID;
  maxItems: number;
} & PropsWithLang;

export const IconsExpandedCollectionTastesLoader = async ({ id, maxItems, lang }: ItemsProps) => {
  const svgs = await getCollectionIcons(id, maxItems);
  return (
    <>
      {svgs.map(({ id: iconId, name, iconTree, variant }) => (
        <li key={iconId}>
          <Link
            href={`/${lang}/icons/${id}/?icon=${encodeURIComponent(iconId)}`}
            className="group/button transition-all duration-200 flex flex-col flex-shrink-0 items-center justify-center overflow-auto size-20 xs:size-28 lg:size-36 mb-2 rounded border border-transparent hover:border-surface-border-medium dark:hover:bg-surface-medium"
          >
            <IconFromData
              className="transition-all duration-200 transform-gpu icon-sky-900 icon-xl xs:icon-2xl lg:icon-4xl dark:icon-sky-500 group-hover/button:icon-2xl group-hover/button:xs:icon-3xl group-hover/button:lg:icon-5xl"
              iconTree={iconTree}
              variant={variant}
            />
            <span className="transition-all duration-200 capitalize text-[0.7rem] lg:text-[0.78rem] mt-2 max-w-16 xs:max-w-24 sm:max-w-24 lg:max-w-32 truncate group-hover/button:mt-1 group-hover/button:underline">
              {name}
            </span>
          </Link>
        </li>
      ))}
    </>
  );
};
