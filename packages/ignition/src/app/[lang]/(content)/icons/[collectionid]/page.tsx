import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionID } from "@/app/components/icons/types";
import { AvailableLanguages, Languages, PropsWithLangParams } from "@/types";
import { IconsManifest } from "@/data-helpers/icons/manifest-from-public";
import { withLocale } from "@/locales";
import { customMetadata } from "@/app/components/metadata-custom";

import IconsCollection from "@/components/icons/icons-collection";
import CollectionTitleBox from "@/components/icons/icons-collection/collection-title-box";
import IconInfoPanel from "@/components/icons/icons-collection/icon-info/panel";

type PageProps = PropsWithLangParams & {
  params: {
    collectionid: CollectionID;
  };
};

// Generate static parameters for all collections and languages
export function generateStaticParams() {
  // Get all collections
  const collections = IconsManifest.map((collection) => collection.id);
  // For each supported language
  const languages = AvailableLanguages;

  // Generate all combinations
  return languages.flatMap((lang) =>
    collections.map((collectionid) => ({
      lang,
      collectionid
    }))
  );
}

export const generateMetadata = async ({
  params: { lang, collectionid }
}: PageProps): Promise<Metadata> => {
  const info = IconsManifest.find(({ id }) => id === collectionid);

  if (!info || !info.name || typeof info.name !== "string") {
    const { component } = withLocale(lang);
    const { title, description } = component("icons-collection");
    return customMetadata(lang, "page", `icons`, title, description);
  }

  const { component } = withLocale(lang);
  const { title, description } = component("icons-collection");
  const pageTitle = `${title} | ${info.name}`;

  return customMetadata(lang, "collection", `icons`, pageTitle, description, collectionid);
};

export default function Page({ params: { lang, collectionid } }: PageProps) {
  const info = IconsManifest.find(({ id }) => id === collectionid);

  // Handle the case where the collection doesn't exist
  if (!info || !info.id || !info.name || typeof info.id !== "string") {
    return notFound();
  }

  return (
    <IconInfoPanel selected={false}>
      <CollectionTitleBox lang={lang} info={info} />
      <IconsCollection id={collectionid} lang={lang} />
    </IconInfoPanel>
  );
}
