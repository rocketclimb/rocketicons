import { Colors } from "@/components/usage";
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
  const DocFactory = () => {
    switch (slug) {
      case "colors":
      case "cores": {
        return <Colors lang={lang} />;
      }
      default:
        return <MdxDoc lang={lang} slug={slug} />;
    }
  };

  return (
    <div className="w-full">
      <DocFactory />
    </div>
  );
};

export default Page;
