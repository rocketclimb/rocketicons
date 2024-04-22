/* eslint-disable @next/next/no-img-element */

import OpenGraph from "@/components/opengraph";
import { Languages } from "@/types";
import { NextRequest } from "next/server";
import * as changeCase from "change-case";
import { IconsManifest } from "rocketicons/data";
import opengraphIconLoader from "@/data-helpers/icons/opengraph-icons-loader";

export const GET = async (request: NextRequest) => {
  const [, lang, , collectionId, iconId] = request.nextUrl.pathname.split("/");
  const collection = IconsManifest.find(({ id }) => id === collectionId);

  if (!collectionId ?? !collection) {
    return await OpenGraph({
      lang: lang as Languages,
    });
  }

  const iconName = iconId && changeCase.pascalCase(iconId);

  let Icon = (await opengraphIconLoader.get(collectionId)!())[
    iconName ?? collection.icons[0]
  ];

  if (!Icon) {
    Icon = (await opengraphIconLoader.get(collectionId)!())[
      collection.icons[0]
    ];
  }

  return await OpenGraph({
    lang: lang as Languages,
    iconCollectionId: collectionId as any,
    iconCollectionCount: collection.icons.length,
    iconCollectionName: collection.name,
    iconName: iconName,
    Icon: collection && collectionId && Icon,
  });
};

// This is a workaround for next.js bug with opengraph-image under catch-all file route. See https://github.com/vercel/next.js/issues/49630
