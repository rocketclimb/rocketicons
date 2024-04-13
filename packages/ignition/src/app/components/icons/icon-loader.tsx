import { IconProps, IconType } from "rocketicons";
import { RcRocketIcon } from "rocketicons/rc";
import { getCollectionsInfo } from "./get-icons-data";
import { CollectionID } from "rocketicons/data";
import IconsLoader, { HandlerPros } from "./icons-loader";

export type IconHandlerProps = { Icon: IconType };
type IconHandler = (props: IconHandlerProps) => JSX.Element;

type IconLoaderProps = {
  collectionId: CollectionID;
  icon: string;
  Handler?: IconHandler;
  Loading?: () => JSX.Element;
} & IconProps;

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

  const IconHandler = ({ collection }: HandlerPros) => {
    const Icon = collection[icon];
    return (Handler && <Handler Icon={Icon} />) || <Icon {...props} />;
  };

  return (
    <IconsLoader
      collectionId={collectionId}
      Handler={IconHandler}
      Loading={Loading}
    />
  );
};

export default IconLoader;
