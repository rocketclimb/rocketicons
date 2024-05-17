/* eslint-disable @next/next/no-img-element */

import * as changeCase from "change-case";
import { withLocale } from "@/app/locales";
import OpenGraph from "@/components/opengraph";
import { Languages } from "@/types";
import { NextRequest } from "next/server";
import { readFileSync } from "node:fs";
import { Variants, IconTree } from "rocketicons";
import { IconsManifest } from "@/data-helpers/icons/manifest";
import { CollectionID } from "rocketicons/data";
import { resolve } from "node:path";

export const GET = async (request: NextRequest) => {
  const [, lang, , type, param1, param2] = request.nextUrl.pathname.split("/");
  const language = lang as Languages;
  const locale = withLocale(language);

  try {
    if (type === "icon" || type === "collection") {
      const collection = IconsManifest.find(({ id }: { id: string }) => id === param1)!;

      const { iconName, iconJson } = selectIcon(param1, param2, language);

      return await OpenGraph({
        lang: lang as Languages,
        iconCollectionId: param1 as CollectionID,
        iconCollectionCount: collection.icons.length,
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

      const { iconName, iconJson } = selectIcon(param1, param2, language, subheading);

      return await OpenGraph({
        lang: lang as Languages,
        iconName,
        iconJson,
        subheading: subheading ?? undefined
      });
    }
  } catch (error) {
    const { iconName, iconJson } = selectIcon(param1, param2, language, "Error");

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

const selectIcon = (
  iconCollectionId: string | undefined,
  iconId: string | undefined,
  lang: Languages,
  subheading?: string | undefined
): { iconName: string; iconJson: { variant: Variants; iconTree: IconTree } } => {
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
        const [icon] = collection?.icons ?? [];
        iconFilename = changeCase.kebabCase(icon);
      }
    }
  } else {
    [selectedIconCollectionId, iconFilename] = chooseIconByType(lang, subheading);
  }

  const iconUrl = resolve(
    "./src/app/data-helpers/svgs",
    `${selectedIconCollectionId}/${iconFilename}.json`
  );

  const loadedIcon = readFileSync(iconUrl, {
    encoding: "utf-8"
  });

  return { iconName: iconName!, iconJson: loadedIcon && JSON.parse(loadedIcon) };
};
