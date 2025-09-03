export type Variants = "outlined" | "filled" | "full";

export interface IconTree {
  tag: string;
  attr: { [key: string]: string };
  child: IconTree[];
}
