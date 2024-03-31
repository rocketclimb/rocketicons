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

export interface IconInfo {
  id: string;
  name: string;
  compName: string;
  variant: string;
}

export interface IconsManifestType<ID extends string> {
  id: ID;
  name: string;
  projectUrl: string;
  license: string;
  licenseUrl: string;
}

export interface CollectionDataInfo<ID extends string>
  extends IconsManifestType<ID> {
  icons: Record<string, IconInfo>;
}

export type IconsInfoManifest<ID extends string> = Record<
  ID,
  CollectionDataInfo<ID>
>;
