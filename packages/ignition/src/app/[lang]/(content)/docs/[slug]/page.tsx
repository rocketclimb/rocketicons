import { redirect } from "next/navigation";
import Adding from "@/components/usage/adding";
import Colors from "@/components/usage/colors";
import Sizing from "@/components/usage/sizing";
import DarkMode from "@/components/usage/dark-mode";
import ResponsiveDesign from "@/components/usage/responsive-design";
import StateManagement from "@/components/usage/state-management";
import Styling from "@/components/usage/styling";
import { MdxDoc } from "@/components/mdx";
import { Metadata } from "next";
import { PropsWithLangSlugParams } from "@/app/types/props-with-lang-and-slug-param";
import { useLocale } from "@/locales/use-locale";
import CustomMetadata from "@/components/metadata-custom";

type PageProps = {
  searchParams: Record<string, string>;
} & PropsWithLangSlugParams;

export const generateMetadata = ({
  params: { lang, slug },
  searchParams: { i },
}: PageProps): Metadata => {
  const { doc } = useLocale(lang);

  const selectedDoc = doc(slug);
  if (slug != selectedDoc.slug) {
    redirect(`/${lang}/docs/${selectedDoc.slug}${(i && "?i=" + i) || ""}`);
  }

  // Redirect to the component section if the doc is a component
  if (selectedDoc?.isComponent) {
    redirect(`/${lang}/docs/${selectedDoc.group}#${slug}`);
  }

  const { title, description } = doc(slug) as {
    title: string;
    description: string;
  };

  return CustomMetadata(lang, title, description);
};

const Page = ({ params: { lang, slug }, searchParams: { i } }: PageProps) => {
  const { enSlug } = useLocale(lang);
  const enSlugFromIndex = enSlug(slug);
  const DocFactory = () => {
    switch (enSlugFromIndex) {
      case "adding": {
        return <Adding lang={lang} />;
      }
      case "colors": {
        return <Colors lang={lang} queryIcon={i} />;
      }
      case "sizing-icons": {
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
      case "styling": {
        return <Styling lang={lang} queryIcon={i} />;
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
