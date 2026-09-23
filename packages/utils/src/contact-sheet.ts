import type { IconTree } from "./types";

type SvgTree = { tag: string; attr: Record<string, unknown>; child?: SvgTree[] };

type ContactSheetIcon = {
  id: string;
  variant: string;
  iconTree: unknown;
};

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
    clipRule: "clip-rule",
    dataSlot: "data-slot",
    enableBackground: "enable-background",
    strokeMiterlimit: "stroke-miterlimit"
  })[name] ?? name;
const treeXml = (node: SvgTree): string => {
  const attrs = Object.entries(node.attr ?? {})
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${attrName(k)}="${xml(String(v))}"`)
    .join(" ");
  return `<${node.tag}${attrs ? ` ${attrs}` : ""}>${(node.child ?? []).map(treeXml).join("")}</${node.tag}>`;
};

/** Serialize a catalog icon for direct use in HTML or as a standalone SVG file. */
export const renderIconSvg = (iconTree: SvgTree): string => {
  if (iconTree.tag !== "svg") throw new Error("Icon tree root must be an svg element");
  return treeXml({
    ...iconTree,
    attr: { xmlns: "http://www.w3.org/2000/svg", ...iconTree.attr }
  });
};

export const contactSheetGlyph = (icon: ContactSheetIcon): string => {
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
