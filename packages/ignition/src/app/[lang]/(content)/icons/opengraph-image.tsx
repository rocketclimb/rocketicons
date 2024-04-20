/* eslint-disable @next/next/no-img-element */

import OpenGraph from "@/components/opengraph";
import { PropsWithLangParams } from "@/types";

export const runtime = "edge";
export const alt = "rocketicons - React Icons like you haver seen before!";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OG({
  params: { lang, collection },
}: PropsWithLangParams & { params: { collection: any } }) {
  return await OpenGraph({ lang, subheading: "/icons" });
}

// it won't work for catch-all params. See https://github.com/vercel/next.js/issues/49630
