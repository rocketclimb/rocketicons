import { CollectionID } from "rocketicons/data";
import { RcRocketIcon } from "rocketicons/rc";
import { IconProps } from "rocketicons";

import { svgInfoByCompNameAsJson } from "@/utils/svg-as-json";
import { IconFromData } from "@rocketicons/core";

import { defaultIconTree, defaultVariant } from "@/config";

const defaultCollection: CollectionID = "rc";
const defaultIcon = "RcRocketIcon";

export const getCurrentIconData = async (query?: string) => {
  const [collection, icon] = (query ?? "").split(".") as [CollectionID, string];

  const info = collection && icon && (await svgInfoByCompNameAsJson(collection, icon));

  if (!collection || !icon || !info) {
    return {
      Icon: (props: IconProps) => <RcRocketIcon {...props} />,
      icon: defaultIcon,
      collection: defaultCollection,
      iconTree: defaultIconTree,
      variant: defaultVariant
    };
  }

  return {
    Icon: (props: IconProps) => (
      <IconFromData iconTree={info.data.iconTree} variant={info.data.variant} {...props} />
    ),
    icon,
    collection,
    iconTree: info.data.iconTree,
    variant: info.data.variant
  };
};
