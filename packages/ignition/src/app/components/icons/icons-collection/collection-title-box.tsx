import { IconsManifestType } from "rocketicons";
import { CollectionID, License } from "rocketicons/data";

import { withLocale } from "@/locales";
import { Languages, PropsWithLang } from "@/types";

import NumberFormatter from "@/components/number-formatter";
import Badge from "@/components/documentation/badge";

import FloatBlock from "@/components/icons/float-block";
import Title from "@/components/documentation/title";
import DocLink from "@/components/documentation/doc-link";
import LicenseBox from "@/components/documentation/license";
import { siteConfig } from "@/config/site";

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
  <FloatBlock className="icon-title-box transition-all duration-200 px-3 pt-2 mt-2 h-12 flex flex-col lg:block lg:sticky lg:top-2 lg:h-32 lg:w-[550px] lg:z-10 lg:border">
    <DocLink
      href={getProjectUrl(lang, info)}
      className="border-b border-secondary mb-1 hover:border-b-2 hover:mb-[3px] lg:pb-0 lg:border-none lg:cursor-default"
    >
      <Title className="grow truncate capitalize md:max-w-none">{info.name}</Title>
    </DocLink>
    <div className="lg:my-3 flex lg:block">
      <p className="hidden lg:block">
        <DocLink href={getProjectUrl(lang, info)} />
      </p>
      <p>
        <LicenseBox url={info.licenseUrl} license={info.license} />
      </p>
      <div className="ml-3 md:ml-0 lg:my-3">
        <IconCountBadge lang={lang} count={info.icons.length} />
      </div>
    </div>
  </FloatBlock>
);

export default CollectionTitleBox;

function getProjectUrl(lang: Languages, info: IconsManifestType<CollectionID, License>): string {
  if (info.projectUrl.indexOf(siteConfig.url) === 0) {
    const newUrl = new URL(lang, info.projectUrl);
    return newUrl.toString();
  }

  return info.projectUrl;
}
