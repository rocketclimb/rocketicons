import { IconsManifestType } from "rocketicons";
import { CollectionID, License } from "rocketicons/data";

import { withLocale } from "@/locales";
import { PropsWithLang } from "@/types";

import NumberFormatter from "@/components/number-formatter";
import Badge from "@/components/documentation/badge";

import FloatBlock from "@/components/icons/float-block";
import Title from "@/components/documentation/title";
import DocLink from "@/components/documentation/doc-link";
import LicenseBox from "@/components/documentation/license";

const IconCountBadge = ({ lang, count }: PropsWithLang & { count: number }) => {
  const { config } = withLocale(lang);
  const { icons } = config("opengraph");

  return (
    <Badge className="lg:absolute right-1.5 top-1.5 text-nowrap">
      <NumberFormatter lang={lang} number={count} />
      <span className="cursor-default lowercase"> {icons}</span>
    </Badge>
  );
};

type TitleBoxProps = {
  info: IconsManifestType<CollectionID, License>;
} & PropsWithLang;

const CollectionTitleBox = ({ lang, info }: TitleBoxProps) => (
  <FloatBlock className="transition-all duration-200 px-3 pt-2 mt-2 h-12 flex lg:block lg:sticky lg:top-2 lg:h-32 lg:w-[550px] lg:z-10 lg:border">
    <DocLink
      href={info.projectUrl}
      className="border-b border-sky-500 pb-0.5 hover:border-b-2 lg:pb-0 lg:border-none lg:cursor-default"
    >
      <Title className="grow truncate max-w-52 sm:max-w-64 md:max-w-none">{info.name}</Title>
    </DocLink>
    <div className="lg:my-3 order-last">
      <IconCountBadge lang={lang} count={info.icons.length} />
    </div>
    <div className="lg:my-3">
      <p className="hidden lg:block">
        <DocLink href={info.projectUrl} />
      </p>
      <p>
        <LicenseBox url={info.licenseUrl} license={info.license} />
      </p>
    </div>
  </FloatBlock>
);

export default CollectionTitleBox;
