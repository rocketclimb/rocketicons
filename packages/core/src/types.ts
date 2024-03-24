export type Variants = "outlined" | "filled" | "full";

export interface IconTree {
  tag: string;
  attr: { [key: string]: string };
  child: IconTree[];
}

export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
  className?: string;
  title?: string;
}

export type IconType = (props: IconBaseProps) => JSX.Element;
