import { AnimatedCodeBlock, ScriptAction } from "@/components/code-block";
import Link from "next/link";
import { MdxComponent } from "@/components/mdx";
import { Metadata } from "next";
import { PropsWithLangParams } from "@/types";
import { RcRocketIcon } from "rocketicons/rc";
import RocketIconsText from "@/components/rocketicons-text";
import SearchButton from "@/app/components/search/search";
import { withLocale } from "@/locales/with-locale";
import Footer from "@/components/footer";
import customMetadata from "@/components/metadata-custom";
import { getConfig } from "@/config";

export const generateMetadata = ({ params: { lang } }: PropsWithLangParams): Metadata => {
  const { component } = withLocale(lang);
  const { title, description } = component("home");

  return customMetadata(lang, "page", "", title, description);
};

const Home = async ({ params: { lang } }: PropsWithLangParams) => {
  const playgroundUrl = await getConfig("playgroundUrl");
  const nav = withLocale(lang).config("nav");

  return (
    <div className="flex flex-col grow overflow-y-auto items-center justify-between bg-cover bg-hero-light dark:bg-hero-dark">
      <div
        className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] bg-grid dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-0 dark:border-slate-100/5"
        style={{ maskImage: "linear-gradient(transparent, black)" }}
      ></div>
      <div className="relative max-w-5xl mx-auto pt-20 px-4 sm:px-6 md:px-8 sm:pt-24 lg:pt-32">
        <MdxComponent lang={lang} slug="home" />
        <div className="mt-6 sm:mt-10 flex justify-center space-x-6 text-sm">
          {playgroundUrl && (
            <Link
              className="bg-slate-900 max-w-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 px-6 rounded-lg w-full flex items-center text-center justify-center sm:w-auto dark:bg-lime-500 dark:highlight-white/20 dark:hover:bg-lime-400"
              href={playgroundUrl.toString()}
              target="_blank"
            >
              {nav["try-it"]}
            </Link>
          )}
          <Link
            className="bg-slate-900 max-w-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 px-6 rounded-lg w-full flex items-center text-center justify-center sm:w-auto dark:bg-sky-500 dark:highlight-white/20 dark:hover:bg-sky-400"
            href={`${lang}/docs/${nav["getting-started-slug"]}`}
          >
            {nav["getting-started"]}
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
              text: "icon-slate-900-sm dark:icon-red-500-sm"
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
              <div className="text-slate-900 text-2xl font-light dark:text-white mt-2">
                <RocketIconsText data-cb-tag="RocketIconsText" />
              </div>
              <div className="mr-2">
                Styling in a way
                <RcRocketIcon
                  data-cb-tag="RcRocketIcon"
                  className="icon-slate-900-sm dark:icon-red-500-sm"
                />
                you&apos;ve never seen before.
              </div>
              <div className="mt-0.5 text-xs leading-6">A funny way handling icons</div>
            </div>
          </div>
        </AnimatedCodeBlock>
      </div>

      <div className="mt-5 md:mt-0 w-full max-w-7xl">
        <Footer />
      </div>
    </div>
  );
};

export default Home;
