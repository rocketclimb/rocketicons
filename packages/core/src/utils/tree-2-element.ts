import React from "react";
import { IconTree } from "@/types";

export const tree2Element = (tree: IconTree[]): React.ReactElement[] =>
  tree &&
  tree.map((node, i) =>
    React.createElement(
      node.tag,
      { key: i, ...node.attr },
      tree2Element(node.child)
    )
  );
