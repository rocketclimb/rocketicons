// Runtime helpers come from their own files: the "@rocketicons/utils" index also exports
// build-time SVG parsing, which would add an XML parser to every app that renders an icon.
import { tree2Element } from "@rocketicons/utils/dist/tree-2-element.js";
import { handleClassName } from "@rocketicons/utils/dist/handle-class-name.js";
import type {
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

export const IconFromData = ({
  iconTree,
  variant,
  ...props
}: { iconTree: IconTree; variant: Variants } & IconBaseProps) => {
  const Icon = IconGenerator(iconTree, variant, "");
  return <Icon {...props} />;
};

export type {
  IconTree,
  Variants,
  IconBaseProps as IconProps,
  IconType,
  IconInfo,
  CollectionDataInfo,
  IconsInfoManifest,
  IconsManifestType
};
