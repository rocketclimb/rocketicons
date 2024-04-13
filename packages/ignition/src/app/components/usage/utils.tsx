import { getCollectionsInfo } from "@/components/icons/get-icons-data";
import IconLoader from "@/components/icons/icon-loader";
import { CollectionID } from "rocketicons/data";
import { RcRocketIcon } from "rocketicons/rc";
import { IconProps } from "rocketicons";

export const getCurrentIconData = (query?: string) => {
  const defaultCollection: CollectionID = "rc";
  const defaultIcon = "RcRocketIcon";

  const [collection, icon] = (query || "").split(".") as [CollectionID, string];

  if (!collection || !icon || !getCollectionsInfo(collection).exists(icon)) {
    return {
      Icon: (props: IconProps) => <RcRocketIcon {...props} />,
      icon: defaultIcon,
      collection: defaultCollection,
    };
  }

  return {
    Icon: (props: IconProps) => (
      <IconLoader collectionId={collection} icon={icon} {...props} />
    ),
    icon,
    collection,
  };
};
