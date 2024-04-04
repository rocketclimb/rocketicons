import { Metadata } from "next";
import { CollectionID } from "rocketicons/data";
import IconsCollection from "@/components/icons/icons-collection";

import { PropsWithLangParams } from "@/types";

import { Title } from "@/components/documentation";
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
  ).component();
  return {
    title: `${title} | ${info.name} | rocketicons`,
    description,
  };
};

const Page = async ({ params: { lang, collection } }: PageProps) => {
  const [id, icon] = collection;

  const info = await getIconsDataManifest(id);

  return (
    <div className="collection-page flex flex-col">
      <div className="backdrop-blur-xl z-10 pt-5 bg-white dark:bg-slate-900/90">
        <Title>{info.name}</Title>
        <div className="my-3">
          <p>{info.license}</p>
          <p>{info.licenseUrl}</p>
          <p>{info.projectUrl}</p>
        </div>
      </div>
      <IconsCollection lang={lang} id={id} icon={icon} />
    </div>
  );
};

export default Page;
