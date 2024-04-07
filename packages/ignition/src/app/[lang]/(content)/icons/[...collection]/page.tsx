import { Metadata } from "next";
import { CollectionID } from "rocketicons/data";
import IconsCollection from "@/components/icons/icons-collection";

import { PropsWithLangParams } from "@/types";

import { Title, ExternalLink, License } from "@/components/documentation";
import { getIconsDataManifest } from "@/components/icons/get-icons-data";
import { useLocale } from "@/locales";

type PageProps = PropsWithLangParams & {
  params: {
    collection: [CollectionID, string];
  };
};

export const generateMetadata = async ({
  params: { lang, collection },
}: PageProps): Promise<Metadata> => {
  const [id] = collection;
  const info = await getIconsDataManifest(id);
  const { title, description } = useLocale(
    lang,
    "icons-collection"
  ).pageComponentFromIndex();
  return {
    title: `${title} | ${info.name} | rocketicons`,
    description,
  };
};

const Page = async ({ params: { lang, collection } }: PageProps) => {
  const [id, icon] = collection;

  const info = await getIconsDataManifest(id);

  return (
    <div className="collection-page">
      <div className="px-3 pt-2 mt-2 flex lg:block lg:absolute lg:h-32 lg:w-[550px] backdrop-blur lg:z-10 lg:border border-slate-200 dark:border-slate-700 rounded-xl bg-white/85 dark:bg-transparent">
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
      </div>
      <IconsCollection lang={lang} id={id} icon={icon} />
    </div>
  );
};

export default Page;
