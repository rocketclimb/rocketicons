import OpenGraph from "@/components/opengraph";
import { PropsWithLangParams } from "@/types";
import { OGProps } from "../types/props-og";

export const runtime = "edge";
export const alt = "rocketicons - React Icons like you haver seen before!";
export const contentType = "image/png";

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

const OG = async ({ params: { lang, slug }, collection }: OGProps) => {
  const Icon = (await loader.get("lu")!())["LuCarrot"];
  return await OpenGraph({
    lang,
    path: "/icons",
    Icon,
    iconCollectionId: collection as any,
  });
};

// const OG = async ({ params: { lang, slug }, collection }: OGProps) => {
//   console.log("og:collection", collection);

//   return await OpenGraph({
//     lang,
//     path: "/icons",
//     iconCollectionId: collection as any,
//     // iconName: "FaTruck",
//   });
// };

export default OG;
