import { SvgCss } from "react-native-svg/css";
import { cssInterop } from "nativewind";
// Runtime helpers come from their own files: the "@rocketicons/utils" index also exports
// build-time SVG parsing, which would add an XML parser to every app that renders an icon.
import { attrToString, tree2String } from "@rocketicons/utils/dist/tree-2-string.js";
import { styleToString } from "@rocketicons/utils/dist/style-to-string.js";
import { nativeHandleClassName } from "@rocketicons/utils/dist/handle-class-name.native.js";
import { mergeStyles } from "@rocketicons/utils/dist/merge-styles.js";
import type { IconTree, Variants, IconType, IconBaseProps } from "@rocketicons/utils";

type NativeIconProps = {
  style?: Record<string, string>[];
  className?: string;
  name: string;
  variant: Variants;
  data: IconTree;
};

const NativeIcon = ({ style, name, variant, data }: NativeIconProps) => {
  const { width, height, ...styles } = mergeStyles(style || []);
  const xml = `
      <svg xmlns="http://www.w3.org/2000/svg" ${attrToString(data.attr)}>
        <style>
          .${name} ${styleToString(variant, styles)}
        </style>
        <g class="${name}">
          ${tree2String(data.child)}
        </g>
      </svg>`;
  return <SvgCss xml={xml} width={width} height={height} />;
};

// NativeWind v4: cssInterop maps className prop to style array
cssInterop(NativeIcon, { className: "style" });

const NativeGenIcon = (data: IconTree, variant: Variants, name: string): IconType =>
  function NativeGenIcon({ className }: IconBaseProps) {
    return (
      <NativeIcon
        data={data}
        name={name}
        variant={variant}
        className={nativeHandleClassName(variant, className ?? "")}
      />
    );
  };

export const IconGenerator = (svg: IconTree, variant: Variants, name: string): IconType =>
  NativeGenIcon(svg, variant, name);

export type { IconTree, Variants };
