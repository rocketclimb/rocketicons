import React from "react";

// Local copy of tree2Element to avoid bundling rocketicons/core
export interface IconTree {
  tag: string;
  attr: Record<string, any>;
  child?: IconTree[] | string;
}

export const tree2Element = (tree: IconTree[] | string | undefined): React.ReactNode => {
  if (!tree) return null;
  if (typeof tree === "string") return tree;
  if (!Array.isArray(tree)) return null;

  return tree
    .map((node, i) => {
      if (!node || typeof node !== "object") return null;

      const { tag, attr = {}, child } = node;
      if (!tag) return null;

      return React.createElement(tag, { key: i, ...attr }, tree2Element(child));
    })
    .filter(Boolean);
};
