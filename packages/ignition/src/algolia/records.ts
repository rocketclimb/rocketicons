export const ALGOLIA_MAX_RECORD_BYTES = 9_500;

export type AlgoliaIconRecord = {
  objectID: string;
  title: string;
  group: string;
  groupName: string;
  locale: "all";
  text: string;
  recordType: "icon";
  isIcon: true;
  iconId: string;
  categories: string[];
};

export type AlgoliaDocumentRecord = {
  objectID: string;
  title: string;
  group: string;
  groupName: string;
  locale: string;
  text: string;
  recordType: "document";
  isIcon: false;
  documentId: string;
  slug: string;
  isFragment: boolean;
};

export type AlgoliaIndexRecord = AlgoliaIconRecord | AlgoliaDocumentRecord;

export type AlgoliaSourceIcon = {
  collectionId: string;
  iconId: string;
  name: string;
  component: string;
  categories: string[];
};

export type AlgoliaSourceDocument = {
  title: string;
  slug: string;
  enslug: string;
  group: string;
  locale: string;
  content: string;
  isComponent: boolean;
};

export const buildIconRecords = (
  icons: AlgoliaSourceIcon[],
  collectionNames: Record<string, string>
): AlgoliaIconRecord[] =>
  icons.map(({ collectionId, iconId, name, component, categories }) => ({
    objectID: `icon:${collectionId}:${iconId}`,
    title: name,
    group: collectionId,
    groupName: collectionNames[collectionId] ?? collectionId,
    locale: "all",
    text: component,
    recordType: "icon",
    isIcon: true,
    iconId,
    categories
  }));

export const buildDocumentRecords = (
  documents: AlgoliaSourceDocument[],
  defaultLocale: string
): AlgoliaDocumentRecord[] => {
  const titleByLocaleAndId = new Map(
    documents.map((document) => [`${document.locale}:${document.enslug}`, document.title])
  );

  return documents.map((document) => ({
    objectID: `document:${document.locale}:${document.enslug}`,
    title: document.title,
    group: document.group,
    groupName:
      titleByLocaleAndId.get(`${document.locale}:${document.group}`) ??
      titleByLocaleAndId.get(`${defaultLocale}:${document.group}`) ??
      document.group,
    locale: document.locale,
    text: document.content,
    recordType: "document",
    isIcon: false,
    documentId: document.enslug,
    slug: document.slug,
    isFragment: document.isComponent
  }));
};

export const validateAlgoliaRecords = (
  records: AlgoliaIndexRecord[],
  maxRecordBytes = ALGOLIA_MAX_RECORD_BYTES
) => {
  const seen = new Set<string>();

  for (const record of records) {
    if (seen.has(record.objectID)) {
      throw new Error(`Duplicate Algolia objectID: ${record.objectID}`);
    }
    seen.add(record.objectID);

    const size = Buffer.byteLength(JSON.stringify(record));
    if (size > maxRecordBytes) {
      throw new Error(
        `Algolia record ${record.objectID} is ${size} bytes; the safe limit is ${maxRecordBytes}`
      );
    }
  }
};
