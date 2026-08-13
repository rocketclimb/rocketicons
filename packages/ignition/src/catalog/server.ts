import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type {
  StaticCatalog,
  StaticCollectionIndex,
  StaticCollectionSummary,
  StaticIconRecord,
  StaticIconShard
} from "./types";

const catalogRoot = join(process.cwd(), "public", "ai", "v1");

const readJson = async <T>(...path: string[]): Promise<T> =>
  JSON.parse(await readFile(join(catalogRoot, ...path), "utf8")) as T;

export const getCatalog = () => readJson<StaticCatalog>("catalog.json");

export const getCollections = async (): Promise<StaticCollectionSummary[]> =>
  (await getCatalog()).collections;

export const getCollectionIndex = (collectionId: string) =>
  readJson<StaticCollectionIndex>("collections", collectionId, "index.json");

export const getCollection = async (collectionId: string) =>
  (await getCollectionIndex(collectionId)).collection;

export const getCollectionShard = (collectionId: string, chunk: number) =>
  readJson<StaticIconShard>("collections", collectionId, `${chunk}.json`);

export const getCollectionIcons = async (
  collectionId: string,
  limit?: number
): Promise<StaticIconRecord[]> => {
  const index = await getCollectionIndex(collectionId);
  const chunkIds = [...new Set(index.icons.map(({ chunk }) => chunk))];
  const shards = await Promise.all(
    chunkIds.map((chunk) => getCollectionShard(collectionId, chunk))
  );
  const icons = shards.flatMap(({ icons }) => icons);
  return typeof limit === "number" ? icons.slice(0, limit) : icons;
};

export const getIcon = async (
  collectionId: string,
  iconId: string
): Promise<StaticIconRecord | undefined> => {
  const index = await getCollectionIndex(collectionId);
  const item = index.icons.find(({ id }) => id === iconId);
  if (!item) return undefined;
  const shard = await getCollectionShard(collectionId, item.chunk);
  return shard.icons.find(({ id }) => id === iconId);
};

export const getCatalogTotals = async () => {
  const collections = await getCollections();
  return {
    totalCollections: collections.length,
    totalIcons: collections.reduce((total, collection) => total + collection.totalIcons, 0)
  };
};
