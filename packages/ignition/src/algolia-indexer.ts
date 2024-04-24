import "@/env/loader";
import algoliasearch from "algoliasearch";
import { allDocs } from "content-collections";
import { siteConfig } from "@/config/site";
import { serverEnv } from "@/env/server";
import { IconsManifest } from "rocketicons/data";
import consoleColors from "./console-colors";

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

const toKebabCase = (str: string) =>
  str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? "-" : "") + $.toLowerCase()
  );

const indexer = async () => {
  try {
    // Instantiate Algolia clients
    const algoliaClient = algoliasearch(
      serverEnv.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID,
      serverEnv.ALGOLIA_ADMIN_KEY
    );

    const availableLocales = siteConfig.locales;

    // flatten the iconmanifest.icons into a single array where the group is collection.id
    const transformedIcons: AlgoliaIndexRecord[] = IconsManifest.flatMap(
      (collection) =>
        collection.icons.map((icon) => ({
          objectID: `${collection.id}-${toKebabCase(icon.substring(2))}`,
          title: `${icon.substring(2)}`,
          group: collection.id,
          groupName: collection.name,
          locale: "", // Add the appropriate locale value here
          text: icon,
          isIcon: true,
        }))
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
          const group = articles.find((a) => a.slug === doc.group);
          return {
            objectID: doc.slug,
            title: doc.title,
            group: doc.group,
            groupName: group?.title ?? doc.group,
            locale: doc.locale,
            text: doc.content,
            isIcon: false,
            isFragment: doc.isComponent,
          };
        });

        console.log(
          `Articles sent to Algolia for locale ${locale}:`,
          consoleColors.fg.green,
          articleRecords.length,
          consoleColors.reset
        );

        // Index records to Algolia
        const articlesPromise = index
          .saveObjects(articleRecords)
          .then(({ objectIDs }) => {
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
        const iconsPromise = index
          .saveObjects(transformedIcons)
          .then(({ objectIDs }) => {
            totalCount += objectIDs.length;
            console.log(
              `Succesfully indexed ${objectIDs.length} icons for locale ${locale}`
            );
          });
        promises.push(iconsPromise);
      } catch (e) {
        console.log(consoleColors.fg.red, "ERROR!", e);
        throw e;
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
