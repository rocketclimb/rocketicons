import OpenGraph from "@/components/opengraph";
import { PropsWithLangParams } from "@/types";
import dynamic from "next/dynamic";
import { RcRocketIcon } from "rocketicons/rc";

export const runtime = "edge";
export const alt = "rocketicons - React Icons like you haver seen before!";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const loader = new Map([["fa", () => import("rocketicons/fa") as any]]);

const OgFa = async ({ params: { lang } }: PropsWithLangParams) => {
  const Icon = (await loader.get("fa")!())["FaTruck"];
  return await OpenGraph({
    lang,
    Icon,
  });
};

export default OgFa;
