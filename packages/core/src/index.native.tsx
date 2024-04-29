import { SvgCss } from "react-native-svg/css";
import { styled } from "nativewind";
import { attrToString, styleToString, tree2String, handleClassName, mergeStyles } from "./utils";
import { IconTree, Variants, IconType, IconBaseProps } from "@/types";

type NativeIconProps = {
  style?: Record<string, string>[];
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

const StyledNativeIcon = styled(NativeIcon);

const NativeGenIcon =
  (data: any, variant: Variants, name: string): IconType =>
  ({ className }: IconBaseProps) => (
    <StyledNativeIcon
      data={data}
      name={name}
      variant={variant}
      className={handleClassName(variant, className ?? "")}
    />
  );

export const IconGenerator = (svg: IconTree, variant: Variants, name: string): IconType =>
  NativeGenIcon(svg, variant, name);

export { IconTree, Variants };
