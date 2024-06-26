import { PropsWithLangParams } from "@/types";
import { withLocale } from "@/locales";
import { LuCheck } from "rocketicons/lu";
import { IoCaretUp } from "rocketicons/io5";
import { BiQuestionMark } from "rocketicons/bi";
import { customMetadata } from "@/components/metadata-custom";
import { Metadata } from "next";
import roadmapFile from "@/locales/roadmap.json";

export const generateMetadata = ({ params: { lang } }: PropsWithLangParams): Metadata => {
  const { config, component } = withLocale(lang);
  const { roadmap } = config("nav");
  const { description } = component("home");

  return customMetadata(lang, "page", "roadmap", roadmap, description);
};

const Roadmap = async ({ params: { lang } }: PropsWithLangParams) => {
  const { nav, roadmap } = withLocale(lang).config("nav", "roadmap");

  const itemList = roadmapFile?.items.map((item: any, i: number) => {
    const released = item.type === "released";
    const key = item.date.replace(/[^a-zA-Z0-9]/g, "");

    return (
      <li key={key}>
        <div className={`relative ${released ? "pt-8" : "pt-16"}`}>
          <span
            className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
            aria-hidden="true"
          ></span>
          <div className="relative flex items-start space-x-3">
            <div>
              <div className="relative px-1">
                <div
                  className={`h-8 w-8  rounded-full ring-8 ring-background dark:ring-background-dark flex items-center justify-center ${
                    released ? "bg-green-500" : "bg-sky-600"
                  }`}
                >
                  {(released && <LuCheck className="icon-white" />) || (
                    <BiQuestionMark className="icon-white" />
                  )}
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1 py-0">
              <div className="text-md text-gray-500">
                <div>
                  {item.version && <button className="font-medium mr-2">{item.version}</button>}

                  <button className="my-0.5 relative inline-flex items-center bg-background rounded-full border border-surface-border-light px-3 py-0.5 text-sm">
                    <div className="absolute flex-shrink-0 flex items-center justify-center">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          released ? "bg-green-500" : "bg-orange-300"
                        }`}
                        aria-hidden="true"
                      ></span>
                    </div>
                    <div className="ml-3.5 font-medium text-gray-900">
                      <span>{roadmap[item.type as keyof typeof roadmap]}</span>
                    </div>
                  </button>
                </div>
                {item.type === "Released" && (
                  <span className="whitespace-nowrap text-sm">
                    {new Date(item.date).toLocaleDateString(lang)}
                  </span>
                )}
              </div>
              <h2
                id={`h2-${i}`}
                className="text-lg font-semibold text-primary dark:text-primary-dark"
              >
                {item.heading[lang]}
              </h2>
              <div className="mt-2">
                <ul className="list-disc list-inside">
                  {item.features[lang].map((feature: string, i: number) => (
                    <li key={`${key}-${feature.replace(/[^a-zA-Z0-9]/g, "")}`}>
                      {feature}
                      <br />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  });

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-extrabold text-primary dark:text-primary-dark">
        {nav.roadmap}
      </h1>
      <IoCaretUp className="icon-gray-300-xl -mb-12 ml-1.5" />
      <div className="flow-root">
        <ul className="">{itemList}</ul>
      </div>
    </div>
  );
};

export default Roadmap;
