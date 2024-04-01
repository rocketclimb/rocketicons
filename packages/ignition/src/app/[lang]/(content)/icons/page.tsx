import { Metadata } from "next";
import { IconsManifest } from "rocketicons/data";
import IconsCollections from "@/components/icons/icons-collections";
import { MdxComponent } from "@/components/mdx";
import { PropsWithLangParams } from "@/types";
import { useLocale } from "@/locales";

export const generateMetadata = ({
  params: { lang },
}: PropsWithLangParams): Metadata => {
  const { title, description } = useLocale(lang, "icons").component();

  return {
    title: `${title} | rocketicons`,
    description,
  };
};

const Page = ({ params: { lang } }: PropsWithLangParams) => (
  <div>
    <MdxComponent lang={lang} slug="icons" />
    <IconsCollections manifests={IconsManifest} lang={lang} />
  </div>
);

export default Page;
