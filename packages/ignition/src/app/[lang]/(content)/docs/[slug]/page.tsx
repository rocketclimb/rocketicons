import Colors from "@/components/usage/colors";
import Sizing from "@/components/usage/sizing";
import DarkMode from "@/components/usage/dark-mode";
import ResponsiveDesign from "@/components/usage/responsive-design";
import StateManagement from "@/components/usage/state-management";
import { MdxDoc } from "@/components/mdx";
import { Metadata } from "next";
import { PropsWithLangSlugParams } from "@/app/types/props-with-lang-and-slug-param";
import { useLocale } from "@/locales/use-locale";

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
  const DocFactory = () => {
    switch (enSlugFromIndex) {
      case "colors": {
        return <Colors lang={lang} queryIcon={i} />;
      }
      case "sizing-elements": {
        return <Sizing lang={lang} queryIcon={i} />;
      }
      case "dark-mode": {
        return <DarkMode lang={lang} queryIcon={i} />;
      }
      case "responsive-design": {
        return <ResponsiveDesign lang={lang} />;
      }
      case "state-management": {
        return <StateManagement lang={lang} queryIcon={i} />;
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
