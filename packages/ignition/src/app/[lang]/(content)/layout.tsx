import Link from "next/link";
import { IconsManifest } from "rocketicons/data";
import { PropsWithChildrenAndLangParams } from "@/types";

import RocketIconsText from "@/components/rocketicons-text";

const Layout = ({
  children,
  params: { lang },
}: PropsWithChildrenAndLangParams) => (
  <div className="xl:mx-auto pt-6 flex gap-8 w-full max-w-screen-2xl">
    <nav>
      <ul className="hidden w-48 lg:block">
        <li>
          <h5 className="mb-8 lg:mb-3 font-semibold text-slate-900 dark:text-slate-200">
            <Link href={`/${lang}/icons`}>Icons</Link>
          </h5>
          <ul className="space-y-6 lg:space-y-2 border-l border-slate-100 dark:border-slate-800">
            {IconsManifest.map(({ id, name }, i) => (
              <li key={i}>
                <Link
                  className="block border-l pl-4 -ml-px border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
                  href={`/${lang}/icons/${id}`}
                >
                  {(name === "rocketclimb" && (
                    <RocketIconsText className="text-gray-950 hover:text-sky-500 dark:text-neutral-100 dark:hover:text-sky-500" />
                  )) ||
                    name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </nav>
    <div className="grow">{children}</div>
  </div>
);

export default Layout;
