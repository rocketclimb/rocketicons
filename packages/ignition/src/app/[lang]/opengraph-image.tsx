import OpenGraph from "@/components/opengraph";
import { PropsWithLangParams } from "@/types";
import dynamic from "next/dynamic";
import { RcRocketIcon } from "rocketicons/rc";
import OgRc from "./opengraph-image-rc";
import OgFa from "./opengraph-image-fa";

export const runtime = "edge";
export const alt = "rocketicons - React Icons like you haver seen before!";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const OG = async ({ params: { lang } }: PropsWithLangParams) => {
  return await OpenGraph({
    lang,
  });
};

export default OG;
