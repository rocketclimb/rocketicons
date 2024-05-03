import IconsLoader from "@/data-helpers/icons/icons-loader";
import Content from "./content";
import { IconsCollectionsProps } from "./types";

const Loader = () => (
  <ul className="animate-pulse ml-0 mt-6 min-h-[655px] flex gap-1 justify-between px-4 gap-x-5 gap-y-10 flex-wrap">
    {Array.from(Array(48).keys()).map((current) => (
      <li
        key={current}
        className="size-24 sm:size-28 rounded border border-slate-200 dark:border-slate-700"
      ></li>
    ))}
  </ul>
);

const IconsCollections = (props: IconsCollectionsProps) => {
  return <IconsLoader collectionId={props.id} Handler={Content} {...props} Loading={Loader} />;
};

export default IconsCollections;
