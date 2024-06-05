export type SpecialStyleProps = {
  h: string;
  w: string;
  size: string;
  stroke: string;
  fill: string;
};

export type SpecialProps = keyof SpecialStyleProps;

export type ResolverOptions<T> = {
  rootPath?: string;
  defaultConfig?: T;
};
