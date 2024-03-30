import "@/utils";

import { IconsManifest } from "rocketicons/core/icons-manifest";
import Link from "next/link";
import { PropsWithLangParams } from "@/app/types";
import { allDocs } from "content-collections";
import { useLocale } from "@/app/locales";
import { usePathname } from "next/navigation";

export const SidebarLeft = ({ params: { lang } }: PropsWithLangParams) => {
  const { nav } = useLocale(lang);
  const pathName = usePathname();

  const DocList = () => {
    console.log("rendering the docs list");

    // Grouping documents by their group property
    const grouped = allDocs
      .filter((model) => model.locale === lang && !model.hide && !!model.group)
      .groupBy((doc) => doc.group);

    const renderDocList = () => {
      return (
        <div>
          {Array.from(grouped).map(
            ([group, docs]) =>
              group && (
                <div key={group}>
                  <h5 className="mb-8 lg:mb-3 font-semibold text-slate-900 dark:text-slate-200">
                    {nav[group]}
                  </h5>
                  <ul className="space-y-6 lg:space-y-2 border-l border-slate-100 dark:border-slate-800">
                    {docs
                      .sort((a, b) => a.order - b.order)
                      .map((model, i) => (
                        <li key={i}>
                          <Link
                            className={`block border-l pl-4 -ml-px border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300 ${
                              pathName.indexOf(model.slug) > -1 &&
                              "border-sky-500 dark:border-sky-500"
                            }`}
                            href={`/${lang}/docs/${model.slug}`}
                          >
                            <span
                              className={`${
                                pathName.indexOf(model.slug) > -1 &&
                                "text-sky-500 dark:text-sky-500"
                              }`}
                            >
                              {model.title}
                            </span>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              )
          )}
        </div>
      );
    };

    return renderDocList();
  };

  const IconList = () =>
    IconsManifest.map(({ id, name }, i) => (
      <li key={i}>
        <Link
          className="block border-l pl-4 -ml-px border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
          href={`/${lang}/icons/${id}`}
        >
          {(name === "rocketclimb" && (
            <>
              <span className="font-light">rocket</span>
              <span className="font-semibold">icons</span>
            </>
          )) ||
            name}
        </Link>
      </li>
    ));

  return (
    <div>
      <ul>
        <li>
          {/* <h5 className="mb-8 lg:mb-3 font-semibold text-slate-900 dark:text-slate-200">
            {nav["getting-started"]}
          </h5>
          <ul className="space-y-6 lg:space-y-2 border-l border-slate-100 dark:border-slate-800">
            <DocList />
          </ul> */}
          <DocList />
        </li>
      </ul>
      <ul>
        <li>
          <h5 className="mb-8 lg:mb-3 font-semibold text-slate-900 dark:text-slate-200">
            Icons
          </h5>
          <ul className="space-y-6 lg:space-y-2 border-l border-slate-100 dark:border-slate-800">
            <IconList />
          </ul>
        </li>
      </ul>
    </div>
  );
};
