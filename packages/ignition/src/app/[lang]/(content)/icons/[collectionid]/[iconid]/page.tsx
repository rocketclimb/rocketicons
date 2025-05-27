import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionID } from "@/app/components/icons/types";

import { IconsManifest } from "@/data-helpers/icons/manifest-from-public";

import IconInfoPanel from "@/components/icons/icons-collection/icon-info/panel";
import IconInfoLoader from "@/components/icons/icons-collection/icon-info/loader";

import { withLocale } from "@/locales";
import { PropsWithLangParams } from "@/types";
import { asCompName } from "@/components/icons/get-icons-data";
import { customMetadata } from "@/app/components/metadata-custom";
import { AvailableLanguages } from "@/types";
import * as changeCase from "change-case";

type PageProps = PropsWithLangParams & {
  params: {
    collectionid: CollectionID;
    iconid: string;
  };
};

export const generateStaticParams = () => {
  // OPTIMIZATION: Only generate collection index pages statically
  // Individual icon pages will be rendered dynamically to reduce bundle size

  const languages = AvailableLanguages;
  const staticParams = [];

  // Only generate collection index pages for SEO
  for (const lang of languages) {
    for (const collection of IconsManifest) {
      if (collection && collection.id && collection.name && typeof collection.id === "string") {
        staticParams.push({
          lang,
          collectionid: collection.id,
          iconid: "collection-index.ri"
        });
      }
    }
  }

  console.log(
    `📦 Static generation: ${staticParams.length} collection pages (dynamic icon pages for better performance)`
  );
  return staticParams;
};

const getIconFromParam = (iconParam: string): string | false =>
  iconParam !== "collection-index.ri" && iconParam;

// Convert URL parameter (like 'md-home') to component name (like 'MdHome')
const urlParamToComponentName = (urlParam: string, collectionId: string): string => {
  // If it already looks like a component name (starts with uppercase), return as-is
  if (/^[A-Z]/.test(urlParam)) {
    return urlParam;
  }

  // Handle kebab-case URLs like 'md-home' -> 'MdHome'
  if (urlParam.includes("-")) {
    // Split by dashes and convert to PascalCase
    const parts = urlParam.split("-");
    return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  }

  // Handle lowercase URLs like 'mdhome' -> 'MdHome'
  const collectionPrefix = collectionId.charAt(0).toUpperCase() + collectionId.slice(1);

  // Remove collection prefix if it exists in lowercase
  let iconPart = urlParam;
  if (urlParam.toLowerCase().startsWith(collectionId.toLowerCase())) {
    iconPart = urlParam.slice(collectionId.length);
  }

  // Convert to PascalCase
  const iconName = iconPart.charAt(0).toUpperCase() + iconPart.slice(1);

  return collectionPrefix + iconName;
};

export const generateMetadata = async ({
  params: { lang, collectionid: id, iconid }
}: PageProps): Promise<Metadata> => {
  const info = IconsManifest.find(({ id: search }) => search === id);

  // If collection not found or invalid, return basic metadata
  if (!info || !info.name || typeof info.name !== "string") {
    const { component } = withLocale(lang);
    const { title, description } = component("icons-collection");
    return customMetadata(lang, "page", `icons`, title, description);
  }

  const icon = getIconFromParam(iconid);
  const { component } = withLocale(lang);
  const { title, description } = component("icons-collection");

  const pageTitle = `${title} | ${info.name} ${icon || ""}`;
  const openGrapgImageType = icon ? "icon" : "collection";

  return customMetadata(
    lang,
    openGrapgImageType,
    `icons`,
    pageTitle,
    description,
    id,
    icon || undefined
  );
};

const Page = ({ params: { lang, collectionid, iconid } }: PageProps) => {
  const info = IconsManifest.find(({ id: search }) => search === collectionid);

  // Handle the case where the collection doesn't exist or is invalid
  if (!info || !info.id || !info.name || typeof info.id !== "string") {
    return notFound();
  }

  const iconId = getIconFromParam(iconid);
  if (iconId) {
    // Convert URL parameter to component name for validation
    const componentName = urlParamToComponentName(iconId, collectionid);

    // For dynamic pages, we'll validate the icon exists at runtime
    // This is more efficient than pre-generating all possible combinations
    if (!info.iconsManifest || Object.keys(info.iconsManifest).length === 0) {
      // If no iconsManifest in manifest, allow the page to render and let PublicJSONIcon handle validation
      console.warn(`No iconsManifest found in manifest for collection ${collectionid}`);
    } else if (!info.iconsManifest[iconId]) {
      return notFound();
    }
  }

  return (
    <IconInfoPanel selected={!!iconId}>
      {iconId && <IconInfoLoader lang={lang} collectionId={collectionid} iconId={iconId} />}
    </IconInfoPanel>
  );
};

export default Page;
