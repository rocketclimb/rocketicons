import { IconInfo, IconProps, IconType } from "rocketicons";
import { RcRocketIcon } from "rocketicons/rc";
import { CollectionID } from "rocketicons/data";
import IconsLoader, { HandlerPros } from "@/data-helpers/icons/icons-loader";
import { getCollectionsInfo, asCompName } from "./get-icons-data";

export type IconHandlerProps = {
  Icon: IconType;
  iconInfo: IconInfo;
};

type IconProxyHandlerProps<T extends IconHandlerProps> = {
  icon: string;
  collectionId: CollectionID;
  Handler?: (props: T) => JSX.Element;
} & IconProps;

const IconProxyHandler = <T extends IconHandlerProps>({
  Handler,
  icon,
  collectionId,
  ...props
}: IconProxyHandlerProps<T>) =>
  function IconProxyLoader({ collection, manifest, ..._props }: HandlerPros) {
    const iconId = asCompName(icon);
    const Icon = collection[iconId];
    const iconInfo = manifest.icons[iconId];
    props = { ..._props, ...props };
    return (
      (Handler && (
        // @ts-ignore TS2322
        <Handler Icon={Icon} iconInfo={iconInfo} collectionId={collectionId} {...props} />
      )) || <Icon {...props} />
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
      Handler={IconProxyHandler({ Handler, icon, collectionId, ...props })}
      Loading={Loading}
    />
  );
};

export default IconLoader;
