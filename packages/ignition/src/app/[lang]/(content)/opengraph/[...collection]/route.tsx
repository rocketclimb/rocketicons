/* eslint-disable @next/next/no-img-element */

import OpenGraph from "@/components/opengraph";
import { Languages, PropsWithLangParams } from "@/types";
import { NextRequest } from "next/server";
import * as changeCase from "change-case";
import { IconsManifest } from "rocketicons/data";

const loader = new Map([
  ["rc", () => import("rocketicons/rc") as any],
  ["ai", () => import("rocketicons/ai") as any],
  ["bi", () => import("rocketicons/bi") as any],
  ["bs", () => import("rocketicons/bs") as any],
  ["cg", () => import("rocketicons/cg") as any],
  ["ci", () => import("rocketicons/ci") as any],
  ["di", () => import("rocketicons/di") as any],
  ["fa", () => import("rocketicons/fa") as any],
  ["fa6", () => import("rocketicons/fa6") as any],
  ["fc", () => import("rocketicons/fc") as any],
  ["fi", () => import("rocketicons/fi") as any],
  ["gi", () => import("rocketicons/gi") as any],
  ["go", () => import("rocketicons/go") as any],
  ["gr", () => import("rocketicons/gr") as any],
  ["hi", () => import("rocketicons/hi") as any],
  ["hi2", () => import("rocketicons/hi2") as any],
  ["im", () => import("rocketicons/im") as any],
  ["io", () => import("rocketicons/io") as any],
  ["io5", () => import("rocketicons/io5") as any],
  ["lia", () => import("rocketicons/lia") as any],
  ["lu", () => import("rocketicons/lu") as any],
  ["md", () => import("rocketicons/md") as any],
  ["pi", () => import("rocketicons/pi") as any],
  ["ri", () => import("rocketicons/ri") as any],
  ["rx", () => import("rocketicons/rx") as any],
  ["si", () => import("rocketicons/si") as any],
  ["sl", () => import("rocketicons/sl") as any],
  ["tb", () => import("rocketicons/tb") as any],
  ["tfi", () => import("rocketicons/tfi") as any],
  ["ti", () => import("rocketicons/ti") as any],
  ["vsc", () => import("rocketicons/vsc") as any],
  ["wi", () => import("rocketicons/wi") as any],
]);

export const GET = async (request: NextRequest) => {
  const [, lang, , collectionId, iconId] = request.nextUrl.pathname.split("/");
  const iconName = iconId ? changeCase.pascalCase(iconId) : undefined;

  const collection = IconsManifest.find(({ id }) => id === collectionId);

  const collectionLoader = await loader.get(collectionId)!();

  return await OpenGraph({
    lang: lang as Languages,
    iconCollectionId: collectionId as any,
    iconCollectionCount: collection?.icons.length,
    iconCollectionName: collection && collection?.name,
    iconName: iconName,
    Icon:
      collection &&
      collectionId &&
      (await collectionLoader[iconName ? iconName : collection.icons[0]]),
  });
};

// This is a workaround for next.js bug with opengraph-image under catch-all file route. See https://github.com/vercel/next.js/issues/49630
