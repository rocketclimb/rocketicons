/* eslint-disable @next/next/no-img-element */

import OpenGraph from "@/components/opengraph";
import { Languages } from "@/types";
import { NextRequest } from "next/server";
import * as changeCase from "change-case";
import { IconsManifest } from "rocketicons/data";
import opengraphIconLoader from "@/data-helpers/icons/opengraph-icons-loader";

export const GET = async (request: NextRequest) => {
  const [, lang, , type, param1, param2] = request.nextUrl.pathname.split("/");
  try {
    if (type === "icon" || type === "collection") {
      const collection = IconsManifest.find(({ id }) => id === param1)!;

      const iconName = param2 && changeCase.pascalCase(param2);

      let Icon = (await opengraphIconLoader.get(param1)!())[iconName ?? collection.icons[0]];

      if (!Icon) {
        Icon = (await opengraphIconLoader.get(param1)!())[collection.icons[0]];
      }

      return await OpenGraph({
        lang: lang as Languages,
        iconCollectionId: param1 as any,
        iconCollectionCount: collection.icons.length,
        iconCollectionName: collection.name,
        iconName: iconName,
        Icon: collection && param1 && Icon
      });
    } else {
      let subheading;
      subheading = request.nextUrl.searchParams.get("subheading");

      if (type === "doc") {
        subheading = request.nextUrl.searchParams.get("title");
      }

      return await OpenGraph({
        lang: lang as Languages,
        subheading: subheading ?? undefined
      });
    }
  } catch (error) {
    return await OpenGraph({
      lang: lang as Languages
    });
  }
};

// This is a workaround for next.js bug with opengraph-image under catch-all file route. See https://github.com/vercel/next.js/issues/49630
