"use client";

import { IconFromData } from "@rocketicons/core";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { IconProps } from "rocketicons";
import { RcRocketIcon } from "rocketicons/rc";

import { loadIconByComponent } from "@/catalog/client";
import type { StaticIconRecord } from "@/catalog/types";

const QuerySelectedIcon = (props: IconProps) => {
  const selected = useSearchParams().get("i");
  const [icon, setIcon] = useState<StaticIconRecord>();

  useEffect(() => {
    let active = true;
    const [collectionId, component] = selected?.split(".") ?? [];
    if (!collectionId || !component) {
      setIcon(undefined);
      return;
    }
    loadIconByComponent(collectionId, component)
      .then((loaded) => active && setIcon(loaded))
      .catch(() => active && setIcon(undefined));
    return () => {
      active = false;
    };
  }, [selected]);

  return icon ? (
    <IconFromData iconTree={icon.iconTree} variant={icon.variant} {...props} />
  ) : (
    <RcRocketIcon {...props} />
  );
};

export default QuerySelectedIcon;
