import { tree2Element, handleClassName } from "./utils";
import {
  IconTree,
  Variants,
  IconType,
  IconBaseProps,
  IconsManifestType,
  IconsInfoManifest,
  IconInfo,
  CollectionDataInfo
} from "@/types";

export const IconGenerator =
  (data: IconTree, variant: Variants, _name: string): IconType =>
  ({ className, ...props }: IconBaseProps) => (
    <svg {...data.attr} {...props} className={handleClassName(variant, className ?? "")}>
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
