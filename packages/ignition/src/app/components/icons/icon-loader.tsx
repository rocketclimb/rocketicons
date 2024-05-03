import { CollectionDataInfo, IconInfo, IconProps, IconType } from "rocketicons";
import { RcRocketIcon } from "rocketicons/rc";
import { CollectionID, License } from "rocketicons/data";
import IconsLoader, { HandlerPros } from "@/data-helpers/icons/icons-loader";
import { getCollectionsInfo, asCompName } from "./get-icons-data";

export type IconHandlerProps = {
  Icon: IconType;
  iconInfo: IconInfo;
};

type IconProxyHandlerProps<T extends IconHandlerProps> = {
  icon: string;
  Handler?: (props: T) => JSX.Element;
} & IconProps;

const IconProxyHandler = <T extends IconHandlerProps>({
  Handler,
  icon,
  ...props
}: IconProxyHandlerProps<T>) =>
  function IconProxyLoader({ collection, manifest, ..._props }: HandlerPros) {
    const iconId = asCompName(icon);
    const Icon = collection[iconId];
    const iconInfo = manifest.icons[iconId];
    props = { ..._props, ...props };
    return (
      // @ts-ignore TS2322
      (Handler && <Handler Icon={Icon} iconInfo={iconInfo} {...props} />) || <Icon {...props} />
    );
  };

type IconLoaderProps<T extends IconHandlerProps> = {
  collectionId: CollectionID;
  Loading?: () => JSX.Element;
} & Omit<T, "Icon" | "iconInfo"> &
  IconProxyHandlerProps<T>;

const IconLoader = <T extends IconHandlerProps>({
  collectionId,
  icon,
  Handler,
  Loading,
  ...props
}: IconLoaderProps<T>) => {
  if (!getCollectionsInfo(collectionId).exists(icon)) {
    return (
      // @ts-ignore TS2322
      (Handler && <Handler Icon={RcRocketIcon} {...props} />) || <RcRocketIcon {...props} />
    );
  }

  return (
    <IconsLoader
      collectionId={collectionId}
      Handler={IconProxyHandler({ Handler, icon, ...{ collectionId, ...props } })}
      Loading={Loading}
    />
  );
};

export default IconLoader;
