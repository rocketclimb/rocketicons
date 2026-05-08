import Link from "next/link";
import { MdxComponent } from "@/components/mdx";
import { Metadata } from "next";
import { PropsWithLangParams } from "@/types";
import SearchButton from "@/app/components/search/search";
import { withLocale } from "@/locales/with-locale";
import Footer from "@/components/footer";
import { customMetadata } from "@/components/metadata-custom";
import { withStructuredData } from "@/config";
import HomeCodePreview from "@/components/animated-code-block-client";

export const generateMetadata = async (props: PropsWithLangParams): Promise<Metadata> => {
  const { lang } = (await props.params) as { lang: import("@/types").Languages };
  const { component } = withLocale(lang);
  const { title, description } = component("home");

  return customMetadata(lang, "page", "", title, description);
};

const Home = async (props: PropsWithLangParams) => {
  const { lang } = (await props.params) as { lang: import("@/types").Languages };

  const { config } = withLocale(lang);
  const { "getting-started-slug": gettingStartedSlug, "getting-started": gettingStarted } =
    config("nav");

  const { organization, software } = withStructuredData(lang);

  return (
    <div className="flex flex-col grow overflow-y-auto items-center justify-between bg-cover bg-hero-light dark:bg-hero-dark">
      <main className="relative w-full inset-0 before:absolute before:top-0 before:right-0 before:left-0 before:bottom-16 before:light-mask-image before:dark:dark-mask-image before:bg-grid before:bg-bottom before:bg-background-dark/[0.04] dark:before:bg-on-surface-dark/[0.05] dark:before:border-b before:border-surface-border-light dark:before:border-surface-border-light/10">
        <div className="hero relative max-w-5xl mx-auto pt-20 px-2 sm:px-6 md:px-8 sm:pt-24 lg:pt-32">
          <MdxComponent lang={lang} slug="home" />
          <div className="mt-4 xs:mt-6 lg:mt-10 flex justify-center space-x-6 text-sm">
            <Link
              className="h-10 xs:h-12 px-6 text-on-primary bg-primary max-w-lg hover:bg-primary/85 focus:outline-none focus:ring-2 focus:ring-on-surface-dark focus:ring-offset-2 focus:ring-offset-surface-border/85 font-semibold rounded-lg w-full flex items-center justify-center sm:w-auto dark:bg-secondary dark:highlight-surface/20 dark:hover:bg-secondary/95"
              href={`/${lang}/docs/${gettingStartedSlug}`}
            >
              {gettingStarted}
            </Link>
            <SearchButton lang={lang} />
          </div>
        </div>
        <div className="mb-6 px-4 w-full z-10">
          <HomeCodePreview />
        </div>
      </main>
      <Footer className="mt-5 md:mt-0 w-full max-w-7xl" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
    </div>
  );
};

export default Home;
