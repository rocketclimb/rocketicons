// Local type definitions to avoid bundling rocketicons package

export type CollectionID =
  | "rc"
  | "ai"
  | "bi"
  | "bs"
  | "cg"
  | "ci"
  | "di"
  | "fa"
  | "fa6"
  | "fc"
  | "fi"
  | "gi"
  | "go"
  | "gr"
  | "hi"
  | "hi2"
  | "im"
  | "io"
  | "io5"
  | "lia"
  | "lu"
  | "md"
  | "pi"
  | "ri"
  | "rx"
  | "si"
  | "sl"
  | "tb"
  | "tfi"
  | "ti"
  | "vsc"
  | "wi";

export interface IconProps {
  className?: string;
  size?: number | string;
  style?: React.CSSProperties;
}

export type IconType = React.ComponentType<IconProps>;

export interface IconTree {
  tag: string;
  attr: Record<string, any>;
  child: IconTree[];
}

export type Variants = "filled" | "outlined" | "full";

export interface License {
  type: string;
  url: string;
}

export interface CollectionInfo {
  id: CollectionID;
  name: string;
  jsonCount: number;
  license?: License;
}
