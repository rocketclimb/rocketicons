import { Metadata } from "next";
import { CollectionID } from "rocketicons/data";
import IconsCollection from "@/components/icons/icons-collection";

import { PropsWithLangParams } from "@/types";

import { getIconsDataManifest } from "@/app/components/icons/get-icons-data";

export const generateMetadata = ({
  params: { lang },
}: PropsWithLangParams): Metadata => {
  // const {
  //   home: { title, description },
  // } = useLocale(lang);

  const title =
    "Icons for React and React-Native in a non official Tailwind Plugin";

  const description = `
    Discover how to easily incorporate popular icons into your React and React-Native,
    a non official Tailwind Plugin projects using RocketIcons, enabling code sharing
    between web and native applications, providing a cross-platform solution.
  `;

  return {
    title: `${title} | rocketicons`,
    description,
  };
};

type PageProps = PropsWithLangParams & {
  params: {
    collection: [CollectionID, string];
  };
};

const Page = async ({ params: { lang, collection } }: PageProps) => {
  const [id, icon] = collection;

  const info = await getIconsDataManifest(id);

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">
        {info.name}
      </h1>
      <div className="my-3">
        <p>{info.license}</p>
        <p>{info.licenseUrl}</p>
        <p>{info.projectUrl}</p>
      </div>

      <IconsCollection lang={lang} id={id} />
    </div>
  );
};

export default Page;
