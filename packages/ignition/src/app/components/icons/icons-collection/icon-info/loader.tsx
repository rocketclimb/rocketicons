import { RcRocketIcon } from "rocketicons/rc";
import { CollectionID } from "rocketicons/data";
import { PropsWithLang } from "@/types";

import IconLoader from "@/components/icons/icon-loader";
import InfoHandler from "./info-handler";

const Loading = () => (
  <div className="h-full w-full flex justify-center items-center">
    <RcRocketIcon className="animate-ping size-16 lg:size-28" />
  </div>
);

type IconInfoProps = {
  iconId: string;
  collectionId: CollectionID;
} & PropsWithLang;

const IconInfoLoader = ({ lang, collectionId, iconId }: IconInfoProps) => (
  <IconLoader
    collectionId={collectionId}
    icon={iconId}
    Loading={Loading}
    Handler={InfoHandler}
    lang={lang}
  />
);

export default IconInfoLoader;
