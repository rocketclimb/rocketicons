import {
  tree2Element,
  handleClassName,
  IconTree,
  Variants,
  IconType,
  IconBaseProps,
  IconsManifestType,
  IconsInfoManifest,
  IconInfo,
  CollectionDataInfo
} from "@rocketicons/utils";

export const IconGenerator = (data: IconTree, variant: Variants, name: string): IconType =>
  function Icon({ className, ...props }: IconBaseProps) {
    return (
      <svg
        {...data.attr}
        {...props}
        className={handleClassName(variant, className ?? "")}
        data-icon-name={name}
      >
        {tree2Element(data.child)}
      </svg>
    );
  };

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
