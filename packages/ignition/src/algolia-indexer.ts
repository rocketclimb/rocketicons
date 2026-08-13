import "@/env/loader";
import algoliasearch from "algoliasearch";
import { allDocs } from "content-collections";
import { siteConfig } from "@/config/site";
import { serverEnv } from "@/env/server";
import { getCollectionIcons, getCollections } from "@/catalog/server";
import consoleColors from "./console-colors.json";

type AlgoliaIndexRecord = {
  objectID: string;
  title: string;
  group: string;
  groupName: string;
  locale: string;
  text: string;
  isIcon: boolean;
  isFragment?: boolean;
};

// const toKebabCase = (str: string) =>
//   str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());

async function compressStringWithGzip(inputString: string) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(inputString);
  const stream = new Blob([encodedData]).stream();
  const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));
  const compressedData = await new Response(compressedStream).arrayBuffer();
  return Buffer.from(compressedData).toString("hex");
}

const indexer = async () => {
  try {
    // Instantiate Algolia clients
    const algoliaClient = algoliasearch(
      serverEnv.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID,
      serverEnv.ALGOLIA_ADMIN_KEY
    );
    const availableLocales = siteConfig.locales;
    const catalogCollections = await getCollections();
    const collections: Record<string, string> = catalogCollections.reduce(
      (reduced, { id, name }) => ({ ...reduced, [id]: name }),
      {}
    );
    // flatten the iconmanifest.icons into a single array where the group is collection.id
    const allIcons = (
      await Promise.all(
        catalogCollections.map(async ({ id: collectionId }) =>
          (await getCollectionIcons(collectionId)).map((icon) => ({
            collectionId,
            iconId: icon.id,
            name: icon.name,
            compName: icon.component,
            categories: [icon.variant]
          }))
        )
      )
    ).flat();

    const transformedIcons: AlgoliaIndexRecord[] = await Promise.all(
      allIcons.map(
        async ({
          collectionId: group,
          iconId: objectID,
          name: title,
          compName: text,
          categories
        }) => ({
          objectID,
          title,
          group,
          groupName: collections[group],
          locale: "", // Add the appropriate locale value here
          text,
          isIcon: true,
          categories
        })
      )
    );

    let totalCount = 0;
    console.log(`Succesfully transformed ${transformedIcons.length} icons`);
    // Iterate over available locales
    console.log("There are", availableLocales.length, "locales to index");
    const promises: Promise<any>[] = [];
    availableLocales.forEach((locale) => {
      try {
        // Initialize an Algolia index
        const index = algoliaClient.initIndex(`${siteConfig.name}-${locale}`);
        promises.push(
          index.setSettings({
            searchableAttributes: ["title", "group", "groupName", "text", "categories"]
          })
        );

        // Filter articles by locale
        const articles = allDocs.filter((doc) => doc.locale === locale);
        console.log(
          `Indexing articles for locale ${locale}:`,
          consoleColors.fg.yellow,
          articles.length,
          consoleColors.reset
        );
        // Map articles to Algolia records
        const articleRecords: AlgoliaIndexRecord[] = articles.map((doc) => {
          const groupEn = articles.find((a) => a.enslug === doc.group);
          const groupLocale = articles.find((a) => a.enslug === doc.group);
          return {
            objectID: doc.slug,
            title: doc.title,
            group: doc.group,
            groupName: groupEn?.title ?? groupLocale?.title ?? doc.group,
            locale: doc.locale,
            text: doc.content,
            isIcon: false,
            isFragment: doc.isComponent
          };
        });
        console.log(
          `Articles sent to Algolia for locale ${locale}:`,
          consoleColors.fg.green,
          articleRecords.length,
          consoleColors.reset
        );
        // Index records to Algolia
        const articlesPromise = index.saveObjects(articleRecords).then(({ objectIDs }) => {
          totalCount += objectIDs.length;
          console.log(
            `Succesfully indexed records for locale ${locale}: `,
            consoleColors.fg.blue,
            objectIDs.length,
            consoleColors.reset
          );
        });
        promises.push(articlesPromise);
        // Index icons to Algolia
        const iconsPromise = index.saveObjects(transformedIcons).then(({ objectIDs }) => {
          totalCount += objectIDs.length;
          console.log(`Succesfully indexed ${objectIDs.length} icons for locale ${locale}`);
        });
        promises.push(iconsPromise);
      } catch (e) {
        console.log(consoleColors.fg.red, "ERROR!", e);
        // throw e;
      }
    });
    await Promise.all(promises);
    console.info(`Succesfully indexed a total of ${totalCount} records`);
  } catch (error) {
    // Log the error and return error response if any error occurs
    console.error("An error occurred while synchronizing content", error);
  }
};

indexer().then(
  () => {
    process.exit(0);
  },
  () => {
    process.exit(1);
  }
);
