import { CollectionID, IconProps, IconType } from "@/app/components/icons/types";
import { PublicJSONIcon } from "@/app/components/icons/public-json-icon";
import IconsLoader, { HandlerPros } from "@/data-helpers/icons/icons-loader";
import { getCollectionsInfo, asCompName } from "./get-icons-data";

// Local IconInfo type to avoid bundling
interface IconInfo {
  id: string;
  name: string;
  compName: string;
  variant: string;
}

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

    // Handle case where manifest or manifest.iconsManifest is undefined/invalid
    if (!manifest || !manifest.iconsManifest || typeof manifest.iconsManifest !== "object") {
      console.warn(`Invalid manifest for collection ${collectionId}:`, manifest);
      return Handler ? (
        // @ts-ignore TS2322
        <Handler
          Icon={(props: any) => (
            <PublicJSONIcon collection="rc" iconId="rc-rocket-icon" {...props} />
          )}
          iconInfo={{
            id: "unknown",
            name: "Unknown",
            compName: "RcRocketIcon",
            variant: "outlined"
          }}
          collectionId={collectionId}
          {..._props}
          {...props}
        />
      ) : (
        <PublicJSONIcon collection="rc" iconId="rc-rocket-icon" {..._props} {...props} />
      );
    }

    // Find icon by component name in iconsManifest
    const iconInfo = Object.values(manifest.iconsManifest).find(
      (icon) => icon.compName === iconId
    );

    // Handle case where specific icon info is not found
    if (!iconInfo || !iconInfo.name) {
      console.warn(
        `Icon info not found for ${iconId} in collection ${collectionId}. Available icons:`,
        Object.values(manifest.iconsManifest).map((icon) => icon.compName)
      );
      return Handler ? (
        // @ts-ignore TS2322
        <Handler
          Icon={(props: any) => (
            <PublicJSONIcon collection="rc" iconId="rc-rocket-icon" {...props} />
          )}
          iconInfo={{
            id: iconId || "unknown",
            name: icon || "Unknown",
            compName: "RcRocketIcon",
            variant: "outlined"
          }}
          collectionId={collectionId}
          {..._props}
          {...props}
        />
      ) : (
        <PublicJSONIcon collection="rc" iconId="rc-rocket-icon" {..._props} {...props} />
      );
    }

    // Handle case where Icon component is not found
    if (!Icon) {
      console.warn(`Icon component ${iconId} not found in collection ${collectionId}`);
      return Handler ? (
        // @ts-ignore TS2322
        <Handler
          Icon={(props: any) => (
            <PublicJSONIcon collection="rc" iconId="rc-rocket-icon" {...props} />
          )}
          iconInfo={iconInfo}
          collectionId={collectionId}
          {..._props}
          {...props}
        />
      ) : (
        <PublicJSONIcon collection="rc" iconId="rc-rocket-icon" {..._props} {...props} />
      );
    }

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
      (Handler && (
        // @ts-ignore TS2322
        <Handler
          Icon={(props: any) => (
            <PublicJSONIcon collection="rc" iconId="rc-rocket-icon" {...props} />
          )}
          {...props}
        />
      )) || <PublicJSONIcon collection="rc" iconId="rc-rocket-icon" {...props} />
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
