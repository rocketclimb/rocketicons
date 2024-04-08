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

export interface IconsManifestType<ID extends string, Licence extends string> {
  id: ID;
  name: string;
  projectUrl: string;
  license: Licence;
  licenseUrl: string;
}

export interface CollectionDataInfo<ID extends string, Licence extends string>
  extends IconsManifestType<ID, Licence> {
  icons: Record<string, IconInfo>;
}

export type IconsInfoManifest<
  ID extends string,
  Licence extends string
> = Record<ID, CollectionDataInfo<ID, Licence>>;
