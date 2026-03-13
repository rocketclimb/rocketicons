import { getCollectionsInfo } from "@/components/icons/get-icons-data";
import IconLoader from "@/components/icons/icon-loader";
import { CollectionID, IconProps } from "@/app/components/icons/types";
import { PublicJSONIcon } from "@/app/components/icons/public-json-icon";

export const getCurrentIconData = (query?: string) => {
  const defaultCollection: CollectionID = "rc";
  const defaultIcon = "RcRocketIcon";

  const [collection, icon] = (query ?? "").split(".") as [CollectionID, string];

  if (!collection || !icon || !getCollectionsInfo(collection).exists(icon)) {
    return {
      Icon: (props: IconProps) => (
        <PublicJSONIcon collection="rc" iconId="rc-rocket-icon" {...props} />
      ),
      icon: defaultIcon,
      collection: defaultCollection
    };
  }

  return {
    Icon: (props: IconProps) => <IconLoader collectionId={collection} icon={icon} {...props} />,
    icon,
    collection
  };
};
