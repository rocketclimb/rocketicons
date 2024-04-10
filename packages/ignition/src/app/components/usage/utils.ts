import { getIconsData } from "@/components/icons/get-icons-data";
import { CollectionID } from "rocketicons/data";

export const getCurrentIconData = async (query?: string) => {
  const defaultCollection: CollectionID = "rc";
  const defaultIcon = "RcRocketIcon";

  const [collection, icon] = (
    query || `${defaultCollection}.${defaultIcon}`
  ).split(".") as [CollectionID, string];

  const icons =
    (await getIconsData(collection)) || (await getIconsData(defaultCollection));

  let Icon = icons[icon] || icons[defaultIcon];

  Icon = Icon || (await getIconsData(defaultCollection))[defaultIcon];

  return {
    Icon,
    ...((icons[icon] && { icon, collection }) || {
      icon: defaultIcon,
      collection: defaultCollection,
    }),
  };
};
