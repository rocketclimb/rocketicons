import IconsCollectionsTastes from "@/app/components/icons/icons-collections-tastes";
import { IconsManifest } from "rocketicons/data";
import { MdxComponent } from "@/components/mdx";
import { Metadata } from "next";
import { PropsWithLangParams } from "@/types";
import { useLocale } from "@/locales";

export const generateMetadata = ({
  params: { lang },
}: PropsWithLangParams): Metadata => {
  const { component } = useLocale(lang);
  const { title, description } = component("icons-hero");

  return {
    title: `${title} | rocketicons`,
    description,
  };
};

const Page = ({ params: { lang } }: PropsWithLangParams) => (
  <div className="flex flex-col">
    <MdxComponent lang={lang} slug="icons-hero" />
    <IconsCollectionsTastes manifests={IconsManifest} lang={lang} />
  </div>
);

export default Page;
