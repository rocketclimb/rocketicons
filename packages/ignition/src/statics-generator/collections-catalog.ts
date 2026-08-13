import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { version } from "rocketicons/package.json";
import type { CollectionID } from "rocketicons/data";
import type { Variants } from "rocketicons";

import { STATIC_CATALOG_CHUNK_SIZE, STATIC_CATALOG_SCHEMA_VERSION } from "../catalog/types";
import type {
  StaticCatalog,
  StaticCollectionIndex,
  StaticCollectionSummary,
  StaticIconIndexRecord,
  StaticIconRecord,
  StaticIconShard
} from "../catalog/types";
import { getManifest, templateBuilder, write } from "./utils";
import { withSiteBasePath } from "../config/site-origin";

const SOURCE_SVGS = resolve("../generator/svgs");
const SOURCE_MANIFESTS = resolve("../icons");
const OUTPUT_ROOT = resolve("./public/ai/v1");
const MANIFEST_OUTPUT_FILE = "icons/manifest.ts";

type GeneratedManifestIcon = {
  id: string;
  name: string;
  compName: string;
  variant: Variants;
};

export type GeneratedManifest = Omit<StaticCollectionSummary, "totalIcons" | "indexUrl"> & {
  icons: Record<string, GeneratedManifestIcon>;
};

const ManifestTemplate = `
// THIS FILE IS AUTO GENERATED
export const pkgVersion = "{0}";
export const totalCollections = {1};
export const totalIcons = {2};
`;

const writeJson = async (filename: string, value: unknown) => {
  await mkdir(resolve(filename, ".."), { recursive: true });
  await writeFile(filename, `${JSON.stringify(value)}\n`, "utf8");
};

const chunks = <T>(items: T[], size: number): T[][] => {
  const output: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    output.push(items.slice(index, index + size));
  }
  return output;
};

const compareIds = (left: string, right: string) => (left < right ? -1 : left > right ? 1 : 0);

export const buildCollectionArtifacts = (
  packageVersion: string,
  manifest: GeneratedManifest,
  sourceIcons: Array<{
    id: string;
    iconTree: StaticIconRecord["iconTree"];
    variant: Variants;
  }>
) => {
  const iconMetadata = new Map(
    Object.values(manifest.icons).map((icon) => [icon.id, icon] as const)
  );
  const seen = new Set<string>();
  const icons = sourceIcons
    .map(({ id, iconTree, variant }) => {
      if (seen.has(id)) throw new Error(`Duplicate icon id in ${manifest.id}: ${id}`);
      seen.add(id);
      const metadata = iconMetadata.get(id);
      if (!metadata) throw new Error(`Missing manifest metadata for ${manifest.id}/${id}`);
      return {
        id,
        name: metadata.name,
        component: metadata.compName,
        variant: metadata.variant || variant,
        iconTree
      } satisfies StaticIconRecord;
    })
    .sort(({ id: left }, { id: right }) => compareIds(left, right));

  if (icons.length !== iconMetadata.size) {
    const missing = [...iconMetadata.keys()].filter((id) => !seen.has(id));
    throw new Error(`Missing source data for ${manifest.id}: ${missing.join(", ")}`);
  }

  const collection: StaticCollectionSummary = {
    id: manifest.id,
    name: manifest.name,
    license: manifest.license,
    projectUrl:
      manifest.id === "rc" ? "https://github.com/rocketclimb/rocketicons" : manifest.projectUrl,
    licenseUrl: manifest.licenseUrl,
    totalIcons: icons.length,
    indexUrl: withSiteBasePath(`/ai/v1/collections/${manifest.id}/index.json`)
  };
  const shards: StaticIconShard[] = chunks(icons, STATIC_CATALOG_CHUNK_SIZE).map(
    (shardIcons, chunk) => ({
      schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
      collectionId: manifest.id,
      chunk,
      icons: shardIcons
    })
  );
  const indexIcons: StaticIconIndexRecord[] = shards.flatMap(({ chunk, icons }) =>
    icons.map(({ iconTree: _iconTree, ...icon }) => ({ ...icon, chunk }))
  );
  const index: StaticCollectionIndex = {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    packageVersion,
    collection,
    icons: indexIcons
  };
  return { collection, index, shards };
};

const loadManifest = async (collectionId: CollectionID): Promise<GeneratedManifest> => {
  const loaded = await import(join(SOURCE_MANIFESTS, collectionId, "manifest"));
  return (loaded.manifest ?? loaded.default?.manifest) as GeneratedManifest;
};

const loadSourceIcons = (collectionId: CollectionID) => {
  const collectionPath = join(SOURCE_SVGS, collectionId);
  if (!existsSync(collectionPath))
    throw new Error(`Missing icon source directory: ${collectionId}`);
  return readdirSync(collectionPath)
    .filter((filename) => filename.endsWith(".json"))
    .sort()
    .map((filename) => {
      const id = filename.slice(0, -5);
      const { iconTree, variant } = JSON.parse(
        readFileSync(join(collectionPath, filename), "utf8")
      ) as Pick<StaticIconRecord, "iconTree" | "variant">;
      return { id, iconTree, variant };
    });
};

export const generateStaticCatalog = async () => {
  rmSync(OUTPUT_ROOT, { recursive: true, force: true });
  const collections: StaticCollectionSummary[] = [];
  for (const { id } of getManifest()) {
    const artifacts = buildCollectionArtifacts(
      version,
      await loadManifest(id),
      loadSourceIcons(id)
    );
    const collectionRoot = join(OUTPUT_ROOT, "collections", id);
    await writeJson(join(collectionRoot, "index.json"), artifacts.index);
    await Promise.all(
      artifacts.shards.map((shard) =>
        writeJson(join(collectionRoot, `${shard.chunk}.json`), shard)
      )
    );
    collections.push(artifacts.collection);
  }
  const sortedCollections = collections.sort(({ id: left }, { id: right }) =>
    compareIds(left, right)
  );
  const catalog: StaticCatalog = {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    packageVersion: version,
    collections: sortedCollections
  };
  await writeJson(join(OUTPUT_ROOT, "catalog.json"), catalog);
  const totalIcons = sortedCollections.reduce((total, item) => total + item.totalIcons, 0);
  await write(
    MANIFEST_OUTPUT_FILE,
    templateBuilder(ManifestTemplate, version, `${sortedCollections.length}`, `${totalIcons}`)
  );
};
