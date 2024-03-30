import { IconsManifest } from "rocketicons/core/icons-manifest";
import Link from "next/link";
import { allDocs } from "content-collections";

export const SidebarLeft = ({ lang }: { lang: string }) => {
  const DocList = () =>
    allDocs.map((model, i) => {
      console.log(lang);

      return (
        model.locale === lang && (
          <li key={i}>
            <Link
              className="block border-l pl-4 -ml-px border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
              href={`/${lang}/docs/${model.slug}`}
            >
              <span>{model.title}</span>
            </Link>
          </li>
        )
      );
    });

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
          <h5 className="mb-8 lg:mb-3 font-semibold text-slate-900 dark:text-slate-200">
            Documents
          </h5>
          <ul className="space-y-6 lg:space-y-2 border-l border-slate-100 dark:border-slate-800">
            <DocList />
          </ul>
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
