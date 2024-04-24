import IconsCollectionsTastes from "@/app/components/icons/icons-collections-tastes";
import { IconsManifest, total } from "@/data-helpers/icons/manifest";
import { MdxComponent } from "@/components/mdx";
import { Metadata } from "next";
import { PropsWithLangParams } from "@/types";
import { useLocale } from "@/locales";
import CustomMetadata from "@/components/metadata-custom";
import NumberFormatter from "@/components/number-formatter";

export const generateMetadata = ({
  params: { lang },
}: PropsWithLangParams): Metadata => {
  const { component, config } = useLocale(lang);
  const { icons } = config("opengraph");
  const { title, description } = component("icons-hero");

  let descriptionWithNumber = `${description} | ${total} ${icons}`;

  let titleWithNumber = `${title} | ${total} ${icons}`;

  return CustomMetadata(lang, titleWithNumber, descriptionWithNumber);
};

const Page = ({ params: { lang } }: PropsWithLangParams) => {
  const { config } = useLocale(lang);
  const { "total-icon-count-text": totalIconCountText } = config("brand");
  return (
    <div className="flex flex-col">
      <MdxComponent lang={lang} slug="icons-hero" />

      <p className="italic font-light">
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
