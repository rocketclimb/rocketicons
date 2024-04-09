import { Metadata } from "next";
import { CollectionID } from "rocketicons/data";
import IconsCollection from "@/components/icons/icons-collection";

import { PropsWithLangParams } from "@/types";

import { Title, ExternalLink, License } from "@/components/documentation";
import { getIconsDataManifest } from "@/components/icons/get-icons-data";
import FloatBlock from "@/components/icons/float-block";
import { useLocale } from "@/locales";

type PageProps = PropsWithLangParams & {
  params: {
    collection: [CollectionID, string];
  };
};

export const generateMetadata = async ({
  params: { lang, collection },
}: PageProps): Promise<Metadata> => {
  const [id, icon] = collection;
  const info = await getIconsDataManifest(id);
  const { title, description } = useLocale(
    lang,
    "icons-collection"
  ).pageComponentFromIndex();
  return {
    title: `${title} | ${info.name} ${icon || ""} | rocketicons`,
    description,
  };
};

const Page = async ({ params: { lang, collection } }: PageProps) => {
  const [id, icon] = collection;

  const info = await getIconsDataManifest(id);

  return (
    <div className="collection-page">
      <FloatBlock className="transition-all duration-200 px-3 pt-2 mt-2 h-12 flex lg:block lg:sticky lg:top-2 lg:h-32 lg:w-[550px] lg:z-10 lg:border">
        <ExternalLink
          href={info.projectUrl}
          className="border-b border-sky-500 pb-0.5 hover:border-b-2 lg:pb-0 lg:border-none lg:cursor-default"
        >
          <Title>{info.name}</Title>
        </ExternalLink>
        <div className="lg:my-3">
          <p className="hidden lg:block">
            <ExternalLink href={info.projectUrl} />
          </p>
          <p>
            <License url={info.licenseUrl} license={info.license} />
          </p>
        </div>
      </FloatBlock>
      <IconsCollection lang={lang} id={id} icon={icon} />
    </div>
  );
};

export default Page;
