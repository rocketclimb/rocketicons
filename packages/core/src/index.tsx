import { tree2Element, handleClassName, IconTree, Variants } from "@rocketicons/utils";
import {
  IconType,
  IconBaseProps,
  IconsManifestType,
  IconsInfoManifest,
  IconInfo,
  CollectionDataInfo
} from "@/types";

export const IconGenerator =
  (
    data: IconTree,
    variant: Variants,
    name: string
  ): IconType => // eslint-disable-next-line react/display-name
  ({ className, ...props }: IconBaseProps) => (
    <svg
      {...data.attr}
      {...props}
      className={handleClassName(variant, className ?? "")}
      data-icon-name={name}
    >
      {tree2Element(data.child)}
    </svg>
  );

export {
  IconTree,
  Variants,
  IconBaseProps as IconProps,
  IconType,
  IconInfo,
  CollectionDataInfo,
  IconsInfoManifest,
  IconsManifestType
};
