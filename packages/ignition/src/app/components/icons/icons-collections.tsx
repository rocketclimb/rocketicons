"use client";
import { useState } from "react";
import { IconsManifestType } from "rocketicons/core";
import { CollectionID, License } from "rocketicons/data";

import IconsCollectionSummary from "./icons-collection-summary";
import { PropsWithLang } from "@/app/types";

type IconsCollectionsProps = PropsWithLang & {
  manifests: IconsManifestType<CollectionID, License>[];
};

const IconsCollections = ({ lang, manifests }: IconsCollectionsProps) => {
  const [selected, setSelected] = useState<string>("");

  return (
    <ul className="transition-all duration-300 mt-6 grid grid-cols-2 grid-flow-dense lg:grid-cols-3 gap-3 min-[1218px]:pt-1">
      {manifests.map(({ id, name }, i) => (
        <IconsCollectionSummary
          key={i}
          id={id}
          name={name}
          isSelected={selected === id}
          setSelected={(id: string | undefined) => setSelected(id || "")}
          lang={lang}
        />
      ))}
    </ul>
  );
};

export default IconsCollections;
