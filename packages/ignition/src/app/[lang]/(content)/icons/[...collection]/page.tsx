import { Metadata } from "next";
import { CollectionID } from "rocketicons/data";
import IconsCollection from "@/app/components/icons/icons-collection";
import { IconsManifest } from "@/data-helpers/icons/manifest";

import { PropsWithLangParams } from "@/types";
import { withLocale } from "@/locales";

import Title from "@/components/documentation/title";
import DocLink from "@/components/documentation/doc-link";
import License from "@/components/documentation/license";

import FloatBlock from "@/components/icons/float-block";
import { serverEnv } from "@/env/server";
import { siteConfig } from "@/config/site";

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
  const { name } = siteConfig;

  const { component } = withLocale(lang);
  const { title, description } = component("icons-collection");

  const pageTitle = `${title} | ${info?.name} ${icon || ""} | rocketicons`;

  const openGraphImageUrl =
    `${serverEnv.NEXT_PUBLIC_APP_URL}/${lang}/opengraph/${id}` +
    (icon ? `/${icon}` : "");

  const ogImagesArray = [
    {
      url: openGraphImageUrl,
      type: "image/png",
      width: 1200,
      height: 630,
      alt: pageTitle,
    },
  ];

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      url: `${serverEnv.NEXT_PUBLIC_APP_URL}`,
      siteName: name,
      images: ogImagesArray,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      site: name,
      description,
      creator: "@rocketclimb",
      images: ogImagesArray,
    },
  };
};

const Page = async ({ params: { lang, collection } }: PageProps) => {
  const [id, icon] = collection;

  const info = IconsManifest.find(({ id: search }) => search === id)!;

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
