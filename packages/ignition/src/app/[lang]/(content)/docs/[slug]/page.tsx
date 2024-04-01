import { MdxDoc } from "@/components/mdx";
import { Metadata } from "next";
import { PropsWithLangSlugParams } from "@/app/types/props-with-lang-and-slug-param";
import { useLocale } from "@/app/locales";

export const generateMetadata = ({
  params: { lang, slug },
}: PropsWithLangSlugParams): Metadata => {
  const { title, description } = useLocale(lang, slug).component() as {
    title: string;
    description: string;
  };
  return {
    title: `${title} | rocketicons`,
    description,
  };
};

const Page = ({ params: { lang, slug } }: PropsWithLangSlugParams) => {
  return (
    <div>
      <MdxDoc lang={lang} slug={slug} />
    </div>
  );
};

export default Page;
