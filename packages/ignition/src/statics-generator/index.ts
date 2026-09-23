import { generateDocsStaticParams } from "./docs-static-params";
import { generateCollectionsStaticParams } from "./collections-static-params";
import { generateMenuControl } from "./menu-control";
import { generateStaticCatalog } from "./collections-catalog";
import { generateOgImages } from "./og-images";
import { generateStaticSiteAssets } from "./static-site-assets";

const main = async () => {
  await Promise.all([
    generateDocsStaticParams(),
    generateCollectionsStaticParams(),
    generateMenuControl()
  ]);
  await generateStaticCatalog();
  await generateOgImages();
  await generateStaticSiteAssets();
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
