import IconsCollections from "@/components/icons/icons-collections";
import { IconsManifest } from "rocketicons/data";
import { MdxComponent } from "@/components/mdx";
import { Metadata } from "next";
import { PropsWithLangParams } from "@/types";
import { useLocale } from "@/locales";

export const generateMetadata = ({
  params: { lang },
}: PropsWithLangParams): Metadata => {
  const { title, description } = useLocale(
    lang,
    "icons-hero",
    true
  ).component();

  return {
    title: `${title} | rocketicons`,
    description,
  };
};

const Page = ({ params: { lang } }: PropsWithLangParams) => (
  <div className="flex flex-col">
    <MdxComponent lang={lang} slug="icons-hero" />
    <IconsCollections manifests={IconsManifest} lang={lang} />
  </div>
);

export default Page;
