import { readFileSync } from "node:fs";
import { join } from "node:path";

export type IconTree = { tag: string; attr: Record<string, unknown>; child: IconTree[] };
export type Collection = {
  id: string;
  name: string;
  license: string;
  licenseUrl: string;
  projectUrl: string;
  totalIcons: number;
  indexUrl: string;
};
export type Icon = {
  id: string;
  name: string;
  component: string;
  variant: string;
  chunk: number;
  collection: string;
  description?: { en: string; "pt-BR": string };
  aliases?: { en: string[]; "pt-BR": string[] };
  searchTerms?: { en: string[]; "pt-BR": string[] };
  negativeTerms?: { en: string[]; "pt-BR": string[] };
  categories?: string[];
  uiContexts?: string[];
  roles?: string[];
  visual?: Record<string, boolean>;
};
type Index = {
  schemaVersion: number;
  packageVersion: string;
  collections: Collection[];
  icons: Icon[];
};

const index: Index = JSON.parse(
  readFileSync(join(__dirname, "..", "data", "search.json"), "utf8")
);
const byQualifiedId = new Map(index.icons.map((icon) => [`${icon.collection}/${icon.id}`, icon]));
const byId = new Map<string, Icon[]>();
for (const icon of index.icons) byId.set(icon.id, [...(byId.get(icon.id) ?? []), icon]);
const byComponent = new Map<string, Icon[]>();
for (const icon of index.icons) {
  const matches = byComponent.get(icon.component.toLowerCase()) ?? [];
  matches.push(icon);
  byComponent.set(icon.component.toLowerCase(), matches);
}
const collections = new Map(index.collections.map((collection) => [collection.id, collection]));
const shardCache = new Map<
  string,
  { icons: Array<{ id: string; component: string; iconTree: IconTree }> }
>();

export const catalogVersion = index.packageVersion;
export const allIcons = () => index.icons;
export const isCollidingId = (id: string) => (byId.get(id)?.length ?? 0) > 1;
export const listCollections = () => index.collections;
export const getCollection = (id: string) => collections.get(id);
export const getIcon = (value: string): Icon | undefined => {
  if (!value || typeof value !== "string") return undefined;
  const qualified = value.replace(/^@/, "");
  const direct = byQualifiedId.get(qualified);
  if (direct) return direct;
  if (qualified.includes("/")) {
    const [collection, component] = qualified.split("/");
    return byComponent
      .get(component.toLowerCase())
      ?.find((icon) => icon.collection === collection);
  }
  const exact = byId.get(qualified);
  if (exact?.length === 1) return exact[0];
  const component = byComponent.get(qualified.toLowerCase());
  return component?.length === 1 ? component[0] : undefined;
};
export const requireIcon = (value: string): Icon => {
  const icon = getIcon(value);
  if (!icon) {
    const matches = byId.get(value) ?? byComponent.get(value?.toLowerCase() ?? "") ?? [];
    if (matches.length > 1)
      throw new Error(
        `Ambiguous icon ${value}; use one of ${matches.map((item) => `@${item.collection}/${item.id}`).join(", ")}`
      );
    throw new Error(`Unknown icon: ${value}`);
  }
  return icon;
};
export const iconSummary = (icon: Icon) => {
  const collection = getCollection(icon.collection)!;
  return {
    id: `@${icon.collection}/${icon.id}`,
    name: icon.name,
    component: icon.component,
    collection: icon.collection,
    collectionName: collection.name,
    variant: icon.variant,
    description: icon.description,
    license: collection.license,
    licenseUrl: collection.licenseUrl,
    svgResource: `rocketicons://icons/${icon.collection}/${icon.id}/svg`
  };
};

export const localIconTree = (icon: Icon): IconTree => {
  const key = `${icon.collection}/${icon.chunk}`;
  let shard = shardCache.get(key);
  if (!shard) {
    shard = JSON.parse(
      readFileSync(
        join(__dirname, "..", "data", "collections", icon.collection, `${icon.chunk}.json`),
        "utf8"
      )
    );
    shardCache.set(key, shard!);
  }
  const tree = shard!.icons.find(
    (item) => item.id === icon.id && item.component === icon.component
  )?.iconTree;
  if (!tree) throw new Error(`Icon data missing for ${icon.id}`);
  return tree;
};

export const remoteIconTree = async (icon: Icon): Promise<IconTree> => {
  const url = `https://rocketicons.com/ai/v1/collections/${icon.collection}/${icon.chunk}.json`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const shard = (await response.json()) as {
      schemaVersion: number;
      collectionId: string;
      icons: Array<{ id: string; iconTree: IconTree }>;
    };
    if (shard.schemaVersion !== 1 || shard.collectionId !== icon.collection)
      throw new Error("Catalog shard does not match the installed catalog");
    const item = shard.icons.find(({ id }) => id === icon.id);
    if (!item) throw new Error(`Icon ${icon.id} is missing from its shard`);
    if (JSON.stringify(item.iconTree) !== JSON.stringify(localIconTree(icon)))
      throw new Error("Remote SVG differs from the installed catalog version");
    return item.iconTree;
  } catch {
    return localIconTree(icon);
  }
};

const escapeXml = (value: unknown) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const xmlName = (value: string) =>
  value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
export const treeToSvg = (tree: IconTree): string => {
  const attributes =
    tree.tag === "svg" && !tree.attr?.xmlns
      ? { xmlns: "http://www.w3.org/2000/svg", ...tree.attr }
      : tree.attr ?? {};
  const attrs = Object.entries(attributes)
    .map(
      ([key, value]) => ` ${xmlName(key === "className" ? "class" : key)}="${escapeXml(value)}"`
    )
    .join("");
  const children = (tree.child ?? []).map(treeToSvg).join("");
  return `<${tree.tag}${attrs}>${children}</${tree.tag}>`;
};
