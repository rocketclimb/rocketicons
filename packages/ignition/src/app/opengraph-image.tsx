/* eslint-disable @next/next/no-img-element */

import OpenGraph from "@/components/opengraph";
import { PropsWithLangParams } from "@/types";

export const runtime = "edge";
export const alt = "rocketicons - React Icons like you haver seen before!";
export const contentType = "image/png";

export default async function OG({ params: { lang } }: PropsWithLangParams) {
  return await OpenGraph({ lang, text: "Root" });
}
