import { PropsWithLangParams } from "@/types";
import { RcRocketIcon } from "rocketicons/rc";
import RocketIconsText, {
  RocketIconsTextDefault,
} from "@/components/rocketicons-text";
import { useLocale } from "@/locales";
import { LuPlus } from "rocketicons/lu";

const Roadmap = ({ params: { lang } }: PropsWithLangParams) => {
  const { nav, roadmap } = useLocale(lang).config("nav", "roadmap");

  const circleClassName =
    "h-8 w-8 bg-blue-500 rounded-full ring-8 ring-white dark:ring-slate-900 flex items-center justify-center";

  const items = [
    {
      version: "v0.1.0",
      date: "2024-04-10 00:00:00-03:00",
      features: {
        en: [
          <>
            Initial release of <RocketIconsTextDefault />
          </>,
        ],
        "pt-br": [
          <>
            Lançamento inicial do <RocketIconsTextDefault />
          </>,
        ],
      },
      type: "released",
    },
    {
      version: "v1.0.0",
      date: "2024-04-10 00:00:00-03:00",
      features: {
        en: ["Icon Search"],
        "pt-br": ["Busca de Ícones"],
      },
      type: "planned",
    },
  ];

  const itemList =
    items &&
    items.map((item) => (
      <li>
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
              <div className="mt-2">
                <ul className="list-disc list-inside">
                  {item.features[lang].map((feature) => (
                    <li>
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
        <RocketIconsText showIcon={true} /> <span>{nav.roadmap}</span>
      </h1>
      <div className="flow-root">
        <ul className="-mb-8">{itemList}</ul>
      </div>
    </div>
  );
};

export default Roadmap;
