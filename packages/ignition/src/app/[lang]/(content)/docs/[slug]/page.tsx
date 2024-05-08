import { redirect } from "next/navigation";
import AddingIcons from "@/components/usage/adding-icons";
import Colors from "@/components/usage/colors";
import Sizing from "@/components/usage/sizing";
import DarkMode from "@/components/usage/dark-mode";
import ResponsiveDesign from "@/components/usage/responsive-design";
import StateManagement from "@/components/usage/state-management";
import Styling from "@/components/usage/styling";
import { MdxDoc } from "@/components/mdx";
import { Metadata } from "next";
import { PropsWithLangSlugParams } from "@/app/types/props-with-lang-and-slug-param";
import { withLocale } from "@/locales/with-locale";
import customMetadata from "@/components/metadata-custom";
import docs from "@/data-helpers/params/docs.json";
import { PropsWithLang } from "@/app/types";

type PageProps = {
  searchParams: Record<string, string>;
} & PropsWithLangSlugParams;

export const generateStaticParams = () => {
  return docs;
};

export const generateMetadata = ({
  params: { lang, slug },
  searchParams: { i }
}: PageProps): Metadata => {
  const { doc } = withLocale(lang);

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

  return customMetadata(lang, "doc", slug, title, description);
};

type DocFactoryProps = {
  slug: string;
  index: string;
  requestedIcon?: string;
} & PropsWithLang;

const DocFactory = ({ lang, slug, index, requestedIcon }: DocFactoryProps) => {
  switch (index) {
    case "adding-icons": {
      return <AddingIcons lang={lang} />;
    }
    case "colors": {
      return <Colors lang={lang} queryIcon={requestedIcon} />;
    }
    case "sizing-icons": {
      return <Sizing lang={lang} queryIcon={requestedIcon} />;
    }
    case "dark-mode": {
      return <DarkMode lang={lang} queryIcon={requestedIcon} />;
    }
    case "responsive-design": {
      return <ResponsiveDesign lang={lang} />;
    }
    case "state-management": {
      return <StateManagement lang={lang} queryIcon={requestedIcon} />;
    }
    case "styling": {
      return <Styling lang={lang} queryIcon={requestedIcon} />;
    }
    default:
      return <MdxDoc lang={lang} slug={slug} />;
  }
};

const Page = ({ params: { lang, slug }, searchParams: { i } }: PageProps) => {
  const { enSlug } = withLocale(lang);
  const enSlugFromIndex = enSlug(slug);

  return (
    <div className="w-full">
      <DocFactory slug={slug} index={enSlugFromIndex} lang={lang} requestedIcon={i} />
    </div>
  );
};

export default Page;
