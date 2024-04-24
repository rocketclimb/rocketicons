import { ReactElement, Children } from "react";
import { DataElement, DataChildren } from "./types";

const typeToTagName = (type: string | Function): string =>
  typeof type === "function" ? type.name : type;

const nodeMap = ({ type, props }: ReactElement): DataElement => {
  const { children, "data-cb-tag": dataTag, ...rest } = props || {};

  const mapChildren = (
    child: string | undefined | ReactElement
  ): DataChildren => (typeof child === "object" ? nodeMap(child) : child);

  return {
    tag: dataTag || typeToTagName(type),
    props: rest,
    children: Array.isArray(children)
      ? children.map(mapChildren)
      : mapChildren(children),
  };
};

const elements2Array = (nodes: any): DataElement[] =>
  (Children.toArray(nodes) as ReactElement[])
    .filter(({ type }) => !!type)
    .map(nodeMap);

export default elements2Array;
