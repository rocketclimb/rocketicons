// const [A] = Object.values(Icon);
// console.log(A);
import Link from "next/link";
import type { Metadata } from "next";

import { useLocale } from "@/locales";

import { PropsWithLangParams } from "@/types";

import { RcRocketIcon } from "rocketicons/rc";

import Markdown from "@/components/markdown";
import SearchButton from "@/components/search-button";
import CodeBlock, { ScriptAction } from "@/app/components/code-block";

export const generateMetadata = ({
  params: { lang },
}: PropsWithLangParams): Metadata => {
  const {
    home: { title, description },
  } = useLocale(lang);
  return {
    title: `${title} | rocketicons`,
    description,
  };
};

const Home = ({ params: { lang } }: PropsWithLangParams) => {
  const { home, nav, search } = useLocale(lang);
  return (
    <div className="flex flex-col grow items-center justify-between bg-cover bg-hero-light dark:bg-hero-dark">
      <div
        className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] bg-grid dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5"
        style={{ maskImage: "linear-gradient(transparent, black)" }}
      ></div>
      <div className="relative max-w-5xl mx-auto pt-20 px-4 sm:px-6 md:px-8 sm:pt-24 lg:pt-32">
        <Markdown className="text-slate-900 font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-center dark:text-white">
          {home.hero}
        </Markdown>
        <Markdown className="mt-6 text-md px-3 md:text-lg text-slate-600 text-center max-w-3xl mx-auto dark:text-slate-400">
          {home.short}
        </Markdown>

        <div className="mt-6 sm:mt-10 flex justify-center space-x-6 text-sm">
          <Link
            className="bg-slate-900 max-w-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 px-6 rounded-lg w-full flex items-center justify-center sm:w-auto dark:bg-sky-500 dark:highlight-white/20 dark:hover:bg-sky-400"
            href="/docs/installation"
          >
            {nav["getting-started"]}
          </Link>
          <SearchButton label={search} />
        </div>
      </div>
      <div className="mb-6">
        <CodeBlock
          script={[
            {
              time: "1s",
              action: ScriptAction.UPDATE,
              elementId: "el_0.el_0",
              text: "w-32 h-32",
            },
            {
              time: "2s",
              action: ScriptAction.UPDATE_TYPING,
              elementId: "el_0.el_0",
              text: " border border-slate-200 dark:border-white",
              finalText: "w-32 h-32 border border-slate-200 dark:border-white",
              delay: 50,
            },
            {
              time: "2s",
              action: ScriptAction.UPDATE_TYPING,
              elementId: "el_0.el_0",
              text: " bg-slate-200 dark:bg-white",
              finalText: "w-32 h-32 border border-white bg-white",
              delay: 50,
            },
            {
              time: "2s",
              action: ScriptAction.REPLACE_TYPING,
              elementId: "el_0",
              text: "flex gap-3",
              delay: 60,
            },
            {
              time: "5s",
              action: ScriptAction.DELETE_TYPING,
              elementId: "el_0.el_1.el_1.el_1",
              from: "icon-red-900-md",
              to: "icon-",
              skipCommit: true,
            },
            {
              action: ScriptAction.UPDATE_TYPING,
              elementId: "el_0.el_1.el_1.el_1",
              text: "sky-500",
              finalText: "icon-sky-500",
            },
            {
              time: "5s",
              action: ScriptAction.UPDATE_TYPING,
              elementId: "el_0.el_1.el_1.el_1",
              text: "-lg",
              finalText: "icon-sky-500-lg",
            },
            {
              time: "2s",
              action: ScriptAction.UPDATE_TYPING,
              elementId: "el_0.el_1.el_1.el_1",
              text: " dark:icon-white-lg",
              finalText: "icon-sky-500-lg dark:icon-white-lg",
              delay: 30,
            },
            {
              time: "1s",
              action: ScriptAction.UPDATE_TYPING,
              elementId: "el_0.el_1.el_1.el_1",
              text: " mx-1",
              finalText: "icon-sky-500-lg mx-1",
            },
            {
              time: "30s",
              action: ScriptAction.REPLACE_TYPING,
              elementId: "el_0.el_1.el_1.el_1",
              text: "icon-slate-900-sm dark:icon-red-500-sm",
            },
            {
              action: ScriptAction.UPDATE,
              elementId: "el_0",
              text: "",
            },
            {
              action: ScriptAction.UPDATE,
              elementId: "el_0.el_0",
              text: "w-32 h-32",
            },
            {
              action: ScriptAction.RESTART,
            },
          ]}
        >
          <div>
            <RcRocketIcon className="w-32 h-32" />
            <div>
              <div className="text-slate-900 text-2xl font-light dark:text-white mt-2">
                rocket<span className="font-semibold">icons</span>
              </div>
              <div className="mr-2">
                Styling in a way
                <RcRocketIcon className="icon-slate-900-sm dark:icon-red-500-sm" />
                you've never seen before.
              </div>
              <div className="mt-0.5 text-xs leading-6">
                A funny way handling icons
              </div>
            </div>
          </div>
        </CodeBlock>
      </div>

      {/* <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-wrap">
          <div className="hidden absolute inset-0 bottom-10 bg-bottom bg-no-repeat bg-slate-50 dark:bg-hero-dark">
            <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] bg-grid dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5"></div>
          </div> */}
      {/* {Object.values(Icon).map((Icon, i) => (
          <Icon key={i} className="icon-red-lg" />
        ))} */}
      {/* </div> */}
    </div>
  );
};

export default Home;
