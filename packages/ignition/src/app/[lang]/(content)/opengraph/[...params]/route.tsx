/* eslint-disable @next/next/no-img-element */

import * as changeCase from "change-case";
import { withLocale } from "@/app/locales";
import OpenGraph from "@/components/opengraph";
import { Languages, AvailableLanguages } from "@/types";
import { NextRequest } from "next/server";
import { IconsManifest } from "@/data-helpers/icons/manifest-from-public";
import { CollectionID } from "@/app/components/icons/types";

import { svgAsJson } from "@/utils/svg-as-json";

// Local types to avoid bundling rocketicons
type Variants = "filled" | "outlined" | "full";
interface IconTree {
  tag: string;
  attr: Record<string, any>;
  child: IconTree[];
}

export const generateStaticParams = () => {
  // OPTIMIZATION: Only generate essential OpenGraph images statically
  // Individual icon OpenGraph images will be generated dynamically
  const params = [];

  // Generate params for each language - only essential pages
  for (const lang of AvailableLanguages) {
    // Basic page params (SEO critical)
    params.push({ lang, params: ["page"] });
    params.push({ lang, params: ["doc"] });

    // Collection params only (not individual icons)
    for (const collection of IconsManifest) {
      params.push({ lang, params: ["collection", collection.id] });
    }
  }

  console.log(
    `📦 OpenGraph static generation: ${params.length} essential pages (dynamic icon images for better performance)`
  );
  return params;
};

export const GET = async (request: NextRequest) => {
  const [, lang, , type, param1, param2] = request.nextUrl.pathname.split("/");
  const language = lang as Languages;
  const locale = withLocale(language);

  try {
    if (type === "icon" || type === "collection") {
      const collection = IconsManifest.find(({ id }: { id: string }) => id === param1)!;

      const { iconName, iconJson } = await selectIcon(param1, param2, language);

      return await OpenGraph({
        lang: lang as Languages,
        iconCollectionId: param1 as CollectionID,
        iconCollectionCount: Object.keys(collection.iconsManifest).length,
        iconCollectionName: collection.name,
        iconName,
        iconJson
      });
    } else {
      let subheading: string | undefined;
      const slug = request.nextUrl.searchParams.get("slug");

      if (type === "doc") {
        const { doc } = locale;
        const selectedDoc = doc(slug!);

        subheading = selectedDoc.title;
      } else if (type === "page") {
        // if it is a page, it should come from the nav locale
        const nav = locale.config("nav") as Record<string, string>;

        if (slug) {
          subheading = nav[slug];
        }
      }

      const { iconName, iconJson } = await selectIcon(param1, param2, language, subheading);

      return await OpenGraph({
        lang: lang as Languages,
        iconName,
        iconJson,
        subheading: subheading ?? undefined
      });
    }
  } catch (error) {
    const { iconName, iconJson } = await selectIcon(param1, param2, language, "Error");

    return await OpenGraph({
      iconName,
      iconJson,
      lang: lang as Languages
    });
  }
};

// This is a workaround for next.js bug with opengraph-image under catch-all file route. See https://github.com/vercel/next.js/issues/49630

const selectRandomIcon = (): [CollectionID, string] => {
  const iconsArray: [CollectionID, string][] = [
    ["lu", "lu-smile"],
    ["lu", "lu-bird"],
    ["fa", "fa-fly"],
    ["pi", "pi-flying-saucer"],
    ["pi", "pi-alien"]
  ];
  const randomIndex = Math.floor(Math.random() * iconsArray.length);

  return iconsArray[randomIndex];
};

const chooseIconByType = (lang: Languages, subheading?: string): [CollectionID, string] => {
  const { config } = withLocale(lang);
  const { icons } = config("opengraph");
  const { roadmap } = config("nav");

  if (subheading) {
    if (subheading.startsWith("/docs")) {
      return ["sl", "sl-docs"];
    } else if (subheading.startsWith(icons)) {
      return ["fa", "fa-icons"];
    } else if (subheading.startsWith(roadmap)) {
      return ["fa", "fa-road"];
    } else {
      return selectRandomIcon();
    }
  } else {
    return ["rc", "rc-rocket-icon"];
  }
};

const selectIcon = async (
  iconCollectionId: string | undefined,
  iconId: string | undefined,
  lang: Languages,
  subheading?: string | undefined
): Promise<{ iconName: string; iconJson: { variant: Variants; iconTree: IconTree } }> => {
  const hasCollection = !!iconCollectionId;
  const hasIcon = hasCollection && !!iconId;
  let iconName: string | undefined;
  let selectedIconCollectionId: CollectionID | undefined;
  let iconFilename: string | undefined;

  if (hasCollection) {
    const collection = IconsManifest.find(({ id }: { id: string }) => id === iconCollectionId);

    selectedIconCollectionId = iconCollectionId as CollectionID;
    if (collection) {
      if (hasIcon) {
        iconName = iconId && changeCase.pascalCase(iconId);
        iconFilename = iconId;
      } else {
        // Get the first icon from iconsManifest
        const firstIconData = Object.values(collection?.iconsManifest ?? {})[0];
        iconFilename = firstIconData?.id;
      }
    }
  } else {
    [selectedIconCollectionId, iconFilename] = chooseIconByType(lang, subheading);
  }

  const loadedIcon = await svgAsJson(selectedIconCollectionId, iconFilename!);

  return { iconName: iconName!, iconJson: loadedIcon && loadedIcon };
};
