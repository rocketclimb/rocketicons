import "@/env/loader";
import algoliasearch from "algoliasearch";
import { allDocs } from "content-collections";
import { siteConfig } from "@/config/site";
import { serverEnv } from "@/env/server";
import { IconsManifest } from "rocketicons/data";

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
    const transformedIcons: {
      objectID: string;
      name: string;
      title: string;
      text: string;
      group: string;
      isIcon: boolean;
    }[] = IconsManifest.flatMap((collection) =>
      collection.icons.map((icon) => ({
        objectID: `${collection.id}-${toKebabCase(icon.substring(2))}`,
        name: icon.substring(2),
        title: `${collection.name} - ${icon.substring(2)}`,
        text: icon,
        group: collection.id,
        groupName: collection.name,
        isIcon: true,
      }))
    );

    let totalCount = 0;

    availableLocales.forEach(async (locale) => {
      try {
        // Initialize an Algolia index
        const index = algoliaClient.initIndex(`${siteConfig.name}-${locale}`);

        const articles = allDocs.filter((doc) => doc.locale === locale);

        // Map articles to Algolia records
        const articleRecords = articles.map((doc) => ({
          objectID: doc.slug,
          title: doc.title,
          group: doc.group,
          locale: doc.locale,
          text: doc.content,
          isIcon: false,
          isFragment:
            doc.isComponent &&
            siteConfig.menuConfig.componentGroups.includes(doc.group),
        }));

        // Index records to Algolia
        await index.saveObjects(articleRecords);

        // Index icons to Algolia
        await index.saveObjects(transformedIcons);

        totalCount += articleRecords.length + transformedIcons.length;
      } catch (e) {
        console.log(e);
        throw e;
      }
    });

    console.info(`Succesfully indexed ${totalCount} records`);
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
