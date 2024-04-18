import { IconProps, IconType } from "rocketicons";
import { RcRocketIcon } from "rocketicons/rc";
import { getCollectionsInfo } from "./get-icons-data";
import { CollectionID } from "rocketicons/data";
import IconsLoader, { HandlerPros } from "./icons-loader";

export type IconHandlerProps = { Icon: IconType };
type IconHandler = (props: IconHandlerProps) => JSX.Element;

type IconProxyHandlerProps = {
  icon: string;
  Handler?: IconHandler;
} & IconProps;

const IconProxyHandler =
  ({ Handler, icon, ...props }: IconProxyHandlerProps) =>
  ({ collection }: HandlerPros) => {
    const Icon = collection[icon];
    return (Handler && <Handler Icon={Icon} />) || <Icon {...props} />;
  };

type IconLoaderProps = {
  collectionId: CollectionID;
  Loading?: () => JSX.Element;
} & IconProxyHandlerProps;

const IconLoader = ({
  collectionId,
  icon,
  Handler,
  Loading,
  ...props
}: IconLoaderProps) => {
  if (!getCollectionsInfo(collectionId).exists(icon)) {
    return (
      (Handler && <Handler Icon={RcRocketIcon} />) || (
        <RcRocketIcon {...props} />
      )
    );
  }

  return (
    <IconsLoader
      collectionId={collectionId}
      Handler={IconProxyHandler({ Handler, icon, ...props })}
      Loading={Loading}
    />
  );
};

export default IconLoader;
