import type { IconTree, Variants } from "rocketicons";
import type { CollectionID, License } from "rocketicons/data";

export const STATIC_CATALOG_SCHEMA_VERSION = 1 as const;
export const STATIC_CATALOG_CHUNK_SIZE = 500;

export type StaticCollectionSummary = {
  id: CollectionID;
  name: string;
  license: License;
  projectUrl: string;
  licenseUrl: string;
  totalIcons: number;
  indexUrl: string;
};

export type StaticCatalog = {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  packageVersion: string;
  collections: StaticCollectionSummary[];
};

export type StaticIconIndexRecord = {
  id: string;
  name: string;
  component: string;
  variant: Variants;
  chunk: number;
};

export type StaticCollectionIndex = {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  packageVersion: string;
  collection: StaticCollectionSummary;
  icons: StaticIconIndexRecord[];
};

export type StaticIconRecord = Omit<StaticIconIndexRecord, "chunk"> & {
  iconTree: IconTree;
};

export type StaticIconShard = {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  collectionId: string;
  chunk: number;
  icons: StaticIconRecord[];
};
