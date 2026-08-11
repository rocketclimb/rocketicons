"use client";

import type {
  StaticCollectionIndex,
  StaticIconRecord,
  StaticIconShard
} from "./types";

const indexCache = new Map<string, Promise<StaticCollectionIndex>>();
const shardCache = new Map<string, Promise<StaticIconShard>>();

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to load Rocketicons catalog data: ${url}`);
  return (await response.json()) as T;
};

export const loadCollectionIndex = (collectionId: string) => {
  const existing = indexCache.get(collectionId);
  if (existing) return existing;
  const request = fetchJson<StaticCollectionIndex>(
    `/ai/v1/collections/${collectionId}/index.json`
  );
  indexCache.set(collectionId, request);
  return request;
};

export const loadCollectionShard = (collectionId: string, chunk: number) => {
  const key = `${collectionId}:${chunk}`;
  const existing = shardCache.get(key);
  if (existing) return existing;
  const request = fetchJson<StaticIconShard>(
    `/ai/v1/collections/${collectionId}/${chunk}.json`
  );
  shardCache.set(key, request);
  return request;
};

export const loadIcon = async (
  collectionId: string,
  iconId: string
): Promise<StaticIconRecord | undefined> => {
  const index = await loadCollectionIndex(collectionId);
  const item = index.icons.find(({ id }) => id === iconId);
  if (!item) return undefined;
  const shard = await loadCollectionShard(collectionId, item.chunk);
  return shard.icons.find(({ id }) => id === iconId);
};

export const loadIconByComponent = async (
  collectionId: string,
  component: string
): Promise<StaticIconRecord | undefined> => {
  const index = await loadCollectionIndex(collectionId);
  const item = index.icons.find(({ component: candidate }) => candidate === component);
  if (!item) return undefined;
  const shard = await loadCollectionShard(collectionId, item.chunk);
  return shard.icons.find(({ id }) => id === item.id);
};
