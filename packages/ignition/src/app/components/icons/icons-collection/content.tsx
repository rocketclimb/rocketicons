import { HandlerPros } from "@/data-helpers/icons/icons-loader";

import IconSelector from "./icon-selector";

import { IconsCollectionsProps } from "./types";

const Content = ({
  id,
  lang,
  icon,
  manifest,
  collection
}: HandlerPros & IconsCollectionsProps) => (
  <>
    <ul className="transition-all duration-200 ml-0 mt-0 lg:mt-[-630px] min-h-[655px] flex gap-1 justify-between px-4 gap-x-5 gap-y-10 flex-wrap">
      {Object.values(manifest.icons).map((iconInfo) => {
        const { id: iconId, name, compName } = iconInfo;
        const Icon = collection[compName];
        return (
          <li key={iconId}>
            <IconSelector lang={lang} collectionId={id} selected={icon} id={iconId} name={name}>
              <Icon className="transition-all duration-200 transform-gpu icon-sky-900-4xl group-hover/button:icon-sky-900-5xl dark:icon-sky-500-4xl group-hover/button:dark:icon-sky-500-5xl" />
            </IconSelector>
          </li>
        );
      })}
    </ul>
  </>
);

export default Content;
