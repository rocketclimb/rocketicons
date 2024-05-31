import { HandlerPros } from "@/data-helpers/icons/icons-loader";

import IconSelector from "./icon-selector";

import { IconsCollectionsProps } from "./types";

const Content = ({ id, lang, manifest, collection }: HandlerPros & IconsCollectionsProps) => (
  <ul className="transition-all duration-200 ml-0 mt-10 peer-data-[open=true]/info:min-h-[655px] flex justify-between gap-x-2 gap-y-4 flex-wrap">
    {Object.values(manifest.icons).map((iconInfo) => {
      const { id: iconId, name, compName } = iconInfo;
      const Icon = collection[compName];
      return (
        <li key={iconId}>
          <IconSelector lang={lang} collectionId={id} id={iconId} name={name}>
            <Icon className="transition-all duration-200 transform-gpu icon-secondary-medium-3xl group-hover/button:icon-secondary-medium-4xl dark:icon-secondary-3xl group-hover/button:dark:icon-secondary-4xl xs:icon-secondary-medium-4xl group-hover/button:xs:icon-secondary-medium-5xl dark:xs:icon-secondary-4xl group-hover/button:dark:xs:icon-secondary-5xl " />
          </IconSelector>
        </li>
      );
    })}
  </ul>
);

export default Content;
