import { Metadata } from "next";
import { collectionsAsJson, totalIcons } from "@/utils/svg-as-json";

import { MdxComponent } from "@/components/mdx";

import IconsCollectionsTastes from "@/components/icons/icons-collections-tastes";
import { customMetadata } from "@/components/metadata-custom";
import NumberFormatter from "@/components/number-formatter";

import { withLocale } from "@/locales";
import { PropsWithLangParams } from "@/types";

export const generateMetadata = async ({
  params: { lang }
}: PropsWithLangParams): Promise<Metadata> => {
  const { component, config } = withLocale(lang);
  const { icons } = config("opengraph");
  const { title, description } = component("icons-hero");

  const total = await totalIcons();

  const descriptionWithNumber = `${description} | ${total} ${icons}`;

  const titleWithNumber = `${title} | ${total} ${icons}`;

  return customMetadata(lang, "page", `icons`, titleWithNumber, descriptionWithNumber);
};

const Page = async ({ params: { lang } }: PropsWithLangParams) => {
  const { config } = withLocale(lang);
  const { "total-icon-count-text": totalIconCountText } = config("brand");

  const collections = await collectionsAsJson();
  const total = collections.reduce((acc, { totalIcons }) => acc + totalIcons, 0);

  return (
    <div className="icons-hero flex flex-col">
      <MdxComponent lang={lang} slug="icons-hero" />

      <p className="italic font-light text text-[0.7rem] leading-4 xs:text-xs lg:text-sm lg:leading-5">
        {totalIconCountText}
        <span className="ml-2 font-normal not-italic">
          <NumberFormatter lang={lang} number={total} />
        </span>
      </p>
      <IconsCollectionsTastes manifests={collections} lang={lang} />
    </div>
  );
};

export default Page;
