import { Metadata } from "next";
import { IconsManifest } from "rocketicons/data";
import IconsCollections from "@/components/icons/icons-collections";
import { PropsWithLangParams } from "@/types";
import { useLocale } from "@/locales";

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

const Page = ({ params: { lang } }: PropsWithLangParams) => (
  <div>
    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">
      Icons on React or React-Native, easily in a cross-platform solution
    </h1>
    <p className="my-5 tracking-tight text-lg text-slate-700 dark:text-slate-400 min-[714px]:mb-12 md:tracking-normal md:mb-10 min-[1218px]:mb-16">
      Discover how to easily incorporate popular icons into your React and
      React-Native, a non official Tailwind Plugin projects using RocketIcons,
      enabling code sharing between web and native applications, providing a
      cross-platform solution.
    </p>
    <IconsCollections manifests={IconsManifest} lang={lang} />
  </div>
);

export default Page;
