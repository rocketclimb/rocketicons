import OpenGraph from "@/components/opengraph";
import { OGProps } from "./types/props-og";

export const runtime = "edge";
export const alt = "rocketicons - React Icons like you haver seen before!";
export const contentType = "image/png";

const OG = async ({ params: { lang, slug }, collection }: OGProps) => {
  console.log("og:collection", collection);

  return await OpenGraph({
    lang,
    path: "/icons",
    iconCollectionId: collection as any,
    // iconName: "FaTruck",
  });
};

export default OG;
