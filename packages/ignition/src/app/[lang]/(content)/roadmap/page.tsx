import { promises as fs } from "fs";
import { PropsWithLangParams } from "@/types";
import { useLocale } from "@/locales";
import { LuPlus } from "rocketicons/lu";
import { IoCaretDown } from "rocketicons/io5";
import { RoadmapFile } from "../../../types/roadmap";

const Roadmap = async ({ params: { lang } }: PropsWithLangParams) => {
  const { nav, roadmap } = useLocale(lang).config("nav", "roadmap");

  const circleClassName =
    "h-8 w-8 bg-sky-600 rounded-full ring-8 ring-white dark:ring-slate-900 flex items-center justify-center";

  const roadmapFile = JSON.parse(
    await fs.readFile(process.cwd() + `/src/app/locales/roadmap.json`, "utf-8")
  ) as RoadmapFile;

  const itemList =
    roadmapFile.items &&
    roadmapFile.items.map((item: any, i: number) => (
      <li key={`roadmap-item-${i}`}>
        <div className="relative pb-8">
          <span
            className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
            aria-hidden="true"
          ></span>
          <div className="relative flex items-start space-x-3">
            <div>
              <div className="relative px-1">
                <div className={circleClassName}>
                  <LuPlus className="icon-white" />
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1 py-0">
              <div className="text-md text-gray-500">
                <div>
                  <a href="#" className="font-medium mr-2">
                    {item.version}
                  </a>

                  <a
                    href="#"
                    className="my-0.5 relative inline-flex items-center bg-white rounded-full border border-gray-300 px-3 py-0.5 text-sm"
                  >
                    <div className="absolute flex-shrink-0 flex items-center justify-center">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.type === "released"
                            ? "bg-green-500"
                            : "bg-orange-300"
                        }`}
                        aria-hidden="true"
                      ></span>
                    </div>
                    <div className="ml-3.5 font-medium text-gray-900">
                      <span>{roadmap[item.type as keyof typeof roadmap]}</span>
                    </div>
                  </a>
                </div>
                <>
                  {(item.type === "Released" && (
                    <span className="whitespace-nowrap text-sm">
                      {new Date(item.date).toLocaleDateString(lang)}
                    </span>
                  )) || <></>}
                </>
              </div>
              <h2
                id={`h2-${i}`}
                className="text-lg font-semibold text-gray-900 dark:text-gray-100"
              >
                {item.heading[lang]}
              </h2>
              <div className="mt-2">
                <ul className="list-disc list-inside">
                  {item.features[lang].map((feature: string, i: number) => (
                    <li key={`listitem-${i}`}>
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
    ));

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-5">
        {nav.roadmap}
      </h1>
      <div className="flow-root">
        <ul className="-mb-8">{itemList}</ul>
      </div>
      <IoCaretDown className="icon-gray-300-xl mt-11 ml-1.5" />
    </div>
  );
};

export default Roadmap;
