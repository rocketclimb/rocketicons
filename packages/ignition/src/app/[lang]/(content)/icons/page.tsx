import IconsCollectionsTastes from "@/app/components/icons/icons-collections-tastes";
import { IconsManifest, total } from "@/data-helpers/icons/manifest";
import { MdxComponent } from "@/components/mdx";
import { Metadata } from "next";
import { PropsWithLangParams } from "@/types";

import { withLocale } from "@/locales";
import { customMetadata } from "@/components/metadata-custom";
import NumberFormatter from "@/components/number-formatter";

export const generateMetadata = ({ params: { lang } }: PropsWithLangParams): Metadata => {
  const { component, config } = withLocale(lang);
  const { icons } = config("opengraph");
  const { title, description } = component("icons-hero");

  let descriptionWithNumber = `${description} | ${total} ${icons}`;

  let titleWithNumber = `${title} | ${total} ${icons}`;

  return customMetadata(lang, "page", `icons`, titleWithNumber, descriptionWithNumber);
};

const Page = ({ params: { lang } }: PropsWithLangParams) => {
  const { config } = withLocale(lang);
  const { "total-icon-count-text": totalIconCountText } = config("brand");
  return (
    <div className="icons-hero flex flex-col">
      <MdxComponent lang={lang} slug="icons-hero" />

      <p className="italic font-light text text-[0.7rem] leading-4 xs:text-xs lg:text-sm lg:leading-5">
        {totalIconCountText}
        <span className="ml-2 font-normal not-italic">
          <NumberFormatter lang={lang} number={total} />
        </span>
      </p>
      <IconsCollectionsTastes manifests={IconsManifest} lang={lang} />
    </div>
  );
};

export default Page;
