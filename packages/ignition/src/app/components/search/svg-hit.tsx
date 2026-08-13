"use client";

import { useEffect, useState } from "react";
import { IconFromData } from "@rocketicons/core";
import { BiLoaderAlt } from "rocketicons/bi";

import { loadIcon } from "@/catalog/client";
import type { StaticIconRecord } from "@/catalog/types";

const SvgHit = ({ collectionId, iconId }: { collectionId: string; iconId: string }) => {
  const [icon, setIcon] = useState<StaticIconRecord>();

  useEffect(() => {
    let active = true;
    loadIcon(collectionId, iconId)
      .then((loaded) => active && setIcon(loaded))
      .catch((error) => console.error("Error loading icon preview:", error));
    return () => {
      active = false;
    };
  }, [collectionId, iconId]);

  return icon ? (
    <IconFromData
      className="icon-secondary-xl group-hover/result:icon-white-xl mr-3"
      iconTree={icon.iconTree}
      variant={icon.variant}
    />
  ) : (
    <BiLoaderAlt className="animate-spin duration-1000 icon-secondary-xl mr-3" />
  );
};

export default SvgHit;
