import { CollectionID } from "rocketicons/data";
import { PropsWithLang } from "@/types";

export type IconsCollectionsProps = PropsWithLang & {
  id: CollectionID;
  icon?: string;
};
