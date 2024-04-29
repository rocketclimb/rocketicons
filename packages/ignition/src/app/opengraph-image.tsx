import OpenGraph from "@/components/opengraph";
import { PropsWithLangParams } from "./types";

export const runtime = "edge";
export const alt = "rocketicons - React Icons like you haver seen before!";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

const OpengraphImage = async ({ params: { lang } }: PropsWithLangParams) => {
  return await OpenGraph({
    lang
  });
};

export default OpengraphImage;
