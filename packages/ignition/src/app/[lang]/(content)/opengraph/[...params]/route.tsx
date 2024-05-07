/* eslint-disable @next/next/no-img-element */

import OpenGraph from "@/components/opengraph";
import { Languages } from "@/types";
import { NextRequest } from "next/server";
import { IconsManifest } from "rocketicons/data";

export const GET = async (request: NextRequest) => {
  const [, lang, , type, param1, param2] = request.nextUrl.pathname.split("/");
  try {
    if (type === "icon" || type === "collection") {
      const collection = IconsManifest.find(({ id }) => id === param1)!;

      return await OpenGraph({
        lang: lang as Languages,
        iconCollectionId: param1 as any,
        iconCollectionCount: collection.icons.length,
        iconCollectionName: collection.name,
        iconId: param2
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
    console.log("Error", error);

    return await OpenGraph({
      lang: lang as Languages
    });
  }
};

// This is a workaround for next.js bug with opengraph-image under catch-all file route. See https://github.com/vercel/next.js/issues/49630
