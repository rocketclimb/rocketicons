import { CollectionID } from "rocketicons/data";
import QuerySelectedIcon from "@/components/documentation/query-selected-icon";

import { defaultIconTree, defaultVariant } from "@/config";

const defaultCollection: CollectionID = "rc";
const defaultIcon = "RcRocketIcon";

export const getCurrentIconData = async (_query?: string) => {
  return {
    Icon: QuerySelectedIcon,
    icon: defaultIcon,
    collection: defaultCollection,
    iconTree: defaultIconTree,
    variant: defaultVariant
  };
};
