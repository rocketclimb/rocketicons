import { Metadata } from "next";
import { CollectionID, IconsManifest } from "rocketicons/data";
import IconsCollection from "@/app/components/icons/icons-collection";

import { PropsWithLangParams } from "@/types";
import { useLocale } from "@/locales";

import Title from "@/components/documentation/title";
import DocLink from "@/components/documentation/doc-link";
import License from "@/components/documentation/license";

import FloatBlock from "@/components/icons/float-block";

type PageProps = PropsWithLangParams & {
  params: {
    collection: [CollectionID, string];
  };
};

export const generateMetadata = async ({
  params: { lang, collection },
}: PageProps): Promise<Metadata> => {
  const [id, icon] = collection;
  const info = IconsManifest.find(({ id: search }) => search === id)!;

  const { component } = useLocale(lang);
  const { title, description } = component("icons-collection");

  return {
    title: `${title} | ${info.name} ${icon || ""} | rocketicons`,
    description,
  };
};

const Page = async ({ params: { lang, collection } }: PageProps) => {
  const [id, icon] = collection;

  const info = IconsManifest.find(({ id: search }) => search === id)!; //await getIconsDataManifest(id);

  return (
    <div className="collection-page">
      <FloatBlock className="transition-all duration-200 px-3 pt-2 mt-2 h-12 flex lg:block lg:sticky lg:top-2 lg:h-32 lg:w-[550px] lg:z-10 lg:border">
        <DocLink
          href={info.projectUrl}
          className="border-b border-sky-500 pb-0.5 hover:border-b-2 lg:pb-0 lg:border-none lg:cursor-default"
        >
          <Title>{info.name}</Title>
        </DocLink>
        <div className="lg:my-3">
          <p className="hidden lg:block">
            <DocLink href={info.projectUrl} />
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
