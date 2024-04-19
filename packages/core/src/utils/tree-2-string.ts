import { IconTree } from "@/types";

export const attrToString = (attr: any): string =>
  Object.entries(attr)
    .map(([key, value]) => `${key}="${value}"`)
    .join("");

const elementToString = (tag: string, attr: any, children: string): string =>
  `<${tag} ${attrToString(attr)}>${children}</${tag}>`;

export const tree2String = (tree: IconTree[]): string =>
  tree
    ?.map((node) =>
      elementToString(node.tag, { ...node.attr }, tree2String(node.child))
    )
    .join("\n");
