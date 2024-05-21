import { Style } from "@/types";

export interface IStyleGenerator {
  add(name: string, styles: string): void;
  styles: Style;
}

export type SpecialStyleProps = {
  h: string;
  w: string;
  size: string;
  stroke: string;
  fill: string;
};

export type SpecialProps = keyof SpecialStyleProps;
