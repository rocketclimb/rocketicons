import OpenGraph from "@/components/opengraph";
import { PropsWithLangParams } from "@/types";

export const runtime = "edge";
export const alt = "rocketicons - React Icons like you haver seen before!";
export const contentType = "image/png";

const OG = async ({ params: { lang } }: PropsWithLangParams) => {
  return await OpenGraph({
    lang,
    path: "/icons",
    iconCollectionId: "fa",
    iconName: "FaTruck",
  });
};

export default OG;
