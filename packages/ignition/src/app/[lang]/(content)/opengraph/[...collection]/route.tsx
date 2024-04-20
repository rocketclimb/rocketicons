/* eslint-disable @next/next/no-img-element */

import OpenGraph from "@/components/opengraph";
import { Languages } from "@/types";
import { NextRequest } from "next/server";
import * as changeCase from "change-case";
import { IconsManifest } from "rocketicons/data";

export const GET = async (request: NextRequest) => {
  const [, lang, , collectionId, iconId] = request.nextUrl.pathname.split("/");
  const iconName = iconId ? changeCase.pascalCase(iconId) : undefined;

  const collection = IconsManifest.find(({ id }) => id === collectionId);

  return await OpenGraph({
    lang: lang as Languages,
    iconCollectionId: collectionId as any,
    iconCollectionCount: collection?.icons.length,
    iconCollectionName: collection && collection?.name,
    iconName: iconName,
  });
};

// This is a workaround for next.js bug with opengraph-image under catch-all file route. See https://github.com/vercel/next.js/issues/49630
