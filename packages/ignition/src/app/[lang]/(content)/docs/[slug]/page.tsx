import { Colors, Sizing } from "@/components/usage";
import { MdxDoc } from "@/components/mdx";
import { Metadata } from "next";
import { PropsWithLangSlugParams } from "@/app/types/props-with-lang-and-slug-param";
import { useLocale } from "@/app/locales";

export const generateMetadata = ({
  params: { lang, slug },
}: PropsWithLangSlugParams): Metadata => {
  const { title, description } = useLocale(lang, slug).docFromIndex() as {
    title: string;
    description: string;
  };
  return {
    title: `${title} | rocketicons`,
    description,
  };
};

const Page = ({
  params: { lang, slug },
  searchParams: { i },
}: PropsWithLangSlugParams & { searchParams: Record<string, string> }) => {
  const enSlugFromIndex = useLocale(lang, slug).enSlugFromIndex();
  console.log(lang, slug, enSlugFromIndex);
  const DocFactory = () => {
    switch (enSlugFromIndex) {
      case "colors": {
        return <Colors lang={lang} queryIcon={i} />;
      }
      case "sizing": {
        return <Sizing lang={lang} />;
      }
      default:
        return <MdxDoc lang={lang} slug={slug} icon={i} />;
    }
  };

  return (
    <div className="w-full">
      <DocFactory />
    </div>
  );
};

export default Page;
