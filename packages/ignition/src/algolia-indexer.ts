import "@/env/loader";

import algoliasearch from "algoliasearch";
import { allDocs } from "content-collections";

import {
  AlgoliaSourceDocument,
  AlgoliaSourceIcon,
  buildDocumentRecords,
  buildIconRecords,
  validateAlgoliaRecords
} from "@/algolia/records";
import { getCollectionIcons, getCollections } from "@/catalog/server";
import { siteConfig } from "@/config/site";

const requiredEnvironmentVariable = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required to synchronize Algolia`);
  return value;
};

export const synchronizeAlgolia = async () => {
  const applicationId = requiredEnvironmentVariable("NEXT_PUBLIC_ALGOLIA_APPLICATION_ID");
  const indexingApiKey = requiredEnvironmentVariable("ALGOLIA_INDEXING_API_KEY");
  const { records, iconCount, documentCount } = await buildAlgoliaRecords();
  const index = algoliasearch(applicationId, indexingApiKey).initIndex(siteConfig.name);

  await index
    .setSettings({
      searchableAttributes: [
        "unordered(title)",
        "unordered(groupName)",
        "unordered(group)",
        "unordered(text)",
        "unordered(categories)"
      ],
      attributesForFaceting: ["filterOnly(recordType)", "filterOnly(locale)"],
      hitsPerPage: 60
    })
    .wait();

  const { objectIDs } = await index.replaceAllObjects(records, { safe: true });
  console.info(
    `Synchronized ${objectIDs.length} records (${iconCount} icons and ${documentCount} documents) to ${siteConfig.name}`
  );
};

export const buildAlgoliaRecords = async () => {
  const catalogCollections = await getCollections();
  const collectionNames = Object.fromEntries(
    catalogCollections.map(({ id, name }) => [id, name])
  );
  const icons: AlgoliaSourceIcon[] = (
    await Promise.all(
      catalogCollections.map(async ({ id: collectionId }) =>
        (await getCollectionIcons(collectionId)).map((icon) => ({
          collectionId,
          iconId: icon.id,
          name: icon.name,
          component: icon.component,
          categories: [icon.variant]
        }))
      )
    )
  ).flat();
  const documents = allDocs.map(
    (document): AlgoliaSourceDocument => ({
      title: document.title,
      slug: document.slug,
      enslug: document.enslug,
      group: document.group,
      locale: document.locale,
      content: document.content,
      isComponent: document.isComponent
    })
  );

  const records = [
    ...buildIconRecords(icons, collectionNames),
    ...buildDocumentRecords(documents, siteConfig.defaultLocale)
  ];
  validateAlgoliaRecords(records);
  return { records, iconCount: icons.length, documentCount: documents.length };
};

if (require.main === module) {
  const command = process.argv.includes("--dry-run")
    ? buildAlgoliaRecords().then(({ records, iconCount, documentCount }) => {
        console.info(
          `Validated ${records.length} records (${iconCount} icons and ${documentCount} documents) for ${siteConfig.name}`
        );
      })
    : synchronizeAlgolia();

  command.catch((error) => {
    console.error("Algolia synchronization failed", error);
    process.exitCode = 1;
  });
}
