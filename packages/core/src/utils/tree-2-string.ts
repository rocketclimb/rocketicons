import { IconTree } from "@/types";

export const attrToString = (attr: Record<string, string>): string =>
  Object.entries(attr)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");

const elementToString = (tag: string, attr: Record<string, string>, children: string): string =>
  `<${tag} ${attrToString(attr)}>${children}</${tag}>`;

export const tree2String = (tree: IconTree[]): string =>
  tree
    ?.map((node) => elementToString(node.tag, { ...node.attr }, tree2String(node.child)))
    .join("\n");
