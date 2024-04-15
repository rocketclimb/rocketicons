// ./app/api/algolia/route.js

import algoliasearch from "algoliasearch";
import { allDocs } from "content-collections";
import { siteConfig } from "@/config/site";
import { serverEnv } from "@/env/server";
import { useLocale } from "@/locales/use-locale";

export async function POST(request) {
  // Check if Algolia credentials exist, return error if not
  if (
    !serverEnv.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID ||
    !serverEnv.ALGOLIA_ADMIN_KEY
  ) {
    return new Response("Algolia credentials are not set", {
      status: 500,
    });
  }

  try {
    // Instantiate Algolia clients
    const algoliaClient = algoliasearch(
      serverEnv.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID,
      serverEnv.ALGOLIA_ADMIN_KEY
    );

    const availableLocales = siteConfig.locales;

    let totalCount = 0;

    await availableLocales.forEach(async (locale) => {
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
        isFragment:
          doc.isComponent &&
          siteConfig.menuConfig.componentGroups.includes(doc.group),
      }));

      // Index records to Algolia
      await index.saveObjects(articleRecords);

      totalCount += articleRecords.length;
    });

    console.log(`Succesfully indexed ${totalCount.length} records`);

    // Return success response if the process completes without any issue
    return new Response(
      "Content successfully synchronized with Algolia search",
      {
        status: 200,
      }
    );
  } catch (error) {
    // Log the error and return error response if any error occurs
    console.error(error);
    return new Response("An error occurred while synchronizing content", {
      status: 500,
    });
  }
}
