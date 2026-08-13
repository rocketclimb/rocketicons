import { elementToTree } from "./element-to-tree";
import { IconTree } from "./types";

export const fromSvg = (svg: string) => elementToTree(svg, undefined).shift() as IconTree;
