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
import {
  ALGOLIA_INDEX_VERSION_KEY,
  AlgoliaIndexSettings,
  algoliaIndexSettingsMatch,
  buildAlgoliaIndexVersion,
  currentAlgoliaIndexVersion
} from "@/algolia/index-version";
import { getCollectionIcons, getCollections } from "@/catalog/server";
import { siteConfig } from "@/config/site";
import { buildContextArtifacts } from "@/icon-context/core";

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
  const settings: AlgoliaIndexSettings = {
    searchableAttributes: [
      "unordered(title)",
      "unordered(groupName)",
      "unordered(group)",
      "unordered(searchTermsEn)",
      "unordered(searchTermsPtBr)",
      "unordered(uiContexts)",
      "unordered(categories)",
      "unordered(descriptionEn)",
      "unordered(descriptionPtBr)",
      "unordered(text)"
    ],
    attributesForFaceting: [
      "filterOnly(recordType)",
      "filterOnly(locale)",
      "searchable(group)",
      "searchable(categories)",
      "searchable(uiContexts)",
      "filterOnly(roles)",
      "filterOnly(variant)"
    ],
    hitsPerPage: 60
  };
  const indexVersion = buildAlgoliaIndexVersion(records, settings);
  const currentSettings = (await index.exists()) ? await index.getSettings() : undefined;

  if (
    currentSettings &&
    currentAlgoliaIndexVersion(currentSettings.userData) === indexVersion &&
    algoliaIndexSettingsMatch(currentSettings, settings)
  ) {
    console.info(
      `Algolia index ${siteConfig.name} already matches ${records.length} records; synchronization skipped`
    );
    return;
  }

  const { objectIDs } = await index.replaceAllObjects(records, { safe: true });
  const existingUserData =
    currentSettings?.userData &&
    typeof currentSettings.userData === "object" &&
    !Array.isArray(currentSettings.userData)
      ? currentSettings.userData
      : {};

  await index
    .setSettings({
      ...settings,
      userData: {
        ...existingUserData,
        [ALGOLIA_INDEX_VERSION_KEY]: indexVersion
      }
    })
    .wait();
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
        getCollectionIcons(collectionId).then((collectionIcons) => {
          const contexts = new Map(
            buildContextArtifacts(collectionId, "algolia", collectionIcons).icons.map(
              (context) => [context.id, context]
            )
          );
          return collectionIcons.map((icon) => {
            const context = contexts.get(icon.id);
            return {
              collectionId,
              iconId: icon.id,
              name: icon.name,
              component: icon.component,
              categories: context?.categories ?? [icon.variant],
              descriptionEn: context?.description.en,
              descriptionPtBr: context?.description["pt-BR"],
              searchTermsEn: context ? [...context.aliases.en, ...context.searchTerms.en] : [],
              searchTermsPtBr: context
                ? [...context.aliases["pt-BR"], ...context.searchTerms["pt-BR"]]
                : [],
              uiContexts: context?.uiContexts,
              roles: context?.roles,
              variant: icon.variant
            };
          });
        })
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
