import type { IconTree } from "rocketicons";
import type { ContextSourceIcon } from "./types";

export const xml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const attrName = (name: string) =>
  ({
    className: "class",
    strokeWidth: "stroke-width",
    strokeLinecap: "stroke-linecap",
    strokeLinejoin: "stroke-linejoin",
    strokeDasharray: "stroke-dasharray",
    strokeDashoffset: "stroke-dashoffset",
    strokeOpacity: "stroke-opacity",
    fillOpacity: "fill-opacity",
    clipPath: "clip-path",
    stopColor: "stop-color",
    stopOpacity: "stop-opacity",
    fillRule: "fill-rule",
    clipRule: "clip-rule"
  })[name] ?? name;
const treeXml = (node: IconTree): string => {
  const attrs = Object.entries(node.attr ?? {})
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${attrName(k)}="${xml(String(v))}"`)
    .join(" ");
  return `<${node.tag}${attrs ? ` ${attrs}` : ""}>${(node.child ?? []).map(treeXml).join("")}</${node.tag}>`;
};

export const contactSheetGlyph = (icon: ContextSourceIcon): string => {
  const tree = icon.iconTree as IconTree;
  return treeXml({
    ...tree,
    attr: {
      fill: "currentColor",
      viewBox: "0 0 24 24",
      ...tree.attr,
      ...(["filled", "full"].includes(icon.variant) && { fill: "#111827" }),
      ...(["outlined", "full"].includes(icon.variant) && { stroke: "#111827" }),
      x: "80",
      y: "10",
      width: "80",
      height: "80",
      color: "#111827"
    }
  })
    .replace(/\bid="([^"]+)"/g, `id="${icon.id}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${icon.id}-$1)`);
};
