import { AnimatedCodeBlock, ScriptAction } from "@rocketclimb/code-block";
import Link from "next/link";
import { MdxComponent } from "@/components/mdx";
import { Metadata } from "next";
import { PropsWithLangParams } from "@/types";
import { RcRocketIcon } from "rocketicons/rc";
import RocketIconsText from "@/components/rocketicons-text";
import SearchButton from "@/app/components/search/search";
import { withLocale } from "@/locales/with-locale";
import Footer from "@/components/footer";
import { customMetadata } from "@/components/metadata-custom";
import { withStructuredData } from "@/config";

export const generateMetadata = ({ params: { lang } }: PropsWithLangParams): Metadata => {
  const { component } = withLocale(lang);
  const { title, description } = component("home");

  return customMetadata(lang, "page", "", title, description);
};

const Home = ({ params: { lang } }: PropsWithLangParams) => {
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
          <AnimatedCodeBlock
            className="deep-[4]"
            script={[
              {
                time: "4s",
                action: ScriptAction.UPDATE,
                elementId: "el_0",
                text: "h-32"
              },
              {
                action: ScriptAction.UPDATE,
                elementId: "el_0.el_0",
                text: "size-10"
              },
              {
                action: ScriptAction.UPDATE_TYPING,
                elementId: "el_0.el_0",
                text: " border border-slate-200 dark:border-white",
                delay: 50
              },
              {
                time: "2s",
                action: ScriptAction.UPDATE_TYPING,
                elementId: "el_0",
                text: " flex gap-3",
                delay: 60
              },
              {
                time: "2s",
                action: ScriptAction.UPDATE_TYPING,
                elementId: "el_0.el_0",
                text: " size-32 bg-slate-200 dark:bg-white",
                delay: 50
              },
              {
                time: "5s",
                action: ScriptAction.DELETE_TYPING,
                elementId: "el_0.el_1.el_1.el_1",
                from: "icon-red-900-md",
                to: "icon-",
                skipCommit: true
              },
              {
                action: ScriptAction.UPDATE_TYPING,
                elementId: "el_0.el_1.el_1.el_1",
                text: "sky-500"
              },
              {
                time: "5s",
                action: ScriptAction.UPDATE_TYPING,
                elementId: "el_0.el_1.el_1.el_1",
                text: "-lg"
              },
              {
                time: "2s",
                action: ScriptAction.UPDATE_TYPING,
                elementId: "el_0.el_1.el_1.el_1",
                text: " dark:icon-white-lg",
                delay: 30
              },
              {
                time: "1s",
                action: ScriptAction.UPDATE_TYPING,
                elementId: "el_0.el_1.el_1.el_1",
                text: " mx-1"
              },
              {
                time: "30s",
                action: ScriptAction.REPLACE_TYPING,
                elementId: "el_0.el_1.el_1.el_1",
                text: "icon-slate-900-base dark:icon-red-500-base"
              },
              {
                action: ScriptAction.UPDATE,
                elementId: "el_0",
                text: "h-32"
              },
              {
                action: ScriptAction.UPDATE,
                elementId: "el_0.el_0",
                text: "size-10"
              },
              {
                action: ScriptAction.RESTART
              }
            ]}
          >
            <div className="h-32">
              <RcRocketIcon data-cb-tag="RcRocketIcon" className="size-10" />
              <div>
                <div className="text-primary text-xl xs:text-2xl font-light dark:text-primary-dark mt-1 xs:mt-2">
                  <RocketIconsText data-cb-tag="RocketIconsText" />
                </div>
                <div className="mr-2 text-sm xs:text-base">
                  Styling in a way
                  <RcRocketIcon
                    data-cb-tag="RcRocketIcon"
                    className="icon-slate-900-base dark:icon-red-500-base"
                  />
                  you&apos;ve never seen before.
                </div>
                <div className="mt-0.5 text-xs leading-4 xs:leading-6">
                  A funny way handling icons
                </div>
              </div>
            </div>
          </AnimatedCodeBlock>
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
