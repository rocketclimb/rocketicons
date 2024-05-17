import { siteConfig } from "@/config";
import Link from "next/link";
import { MdCode } from "rocketicons/md";

const { playgroundUrl } = siteConfig;

const Playground = () =>
  (playgroundUrl && (
    <div className="pt-8 pl-2">
      <Link
        className="group/highligh-link flex items-center lg:text-sm lg:leading-6 mb-4 font-medium text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
        href={playgroundUrl}
        target="_blank"
      >
        <div className="mr-4 size-6 text-center leading-[22px] rounded-md ring-1 ring-slate-900/5 shadow-sm group-hover/highligh-link:shadow group-hover/highligh-link:ring-slate-900/10 dark:ring-0 dark:shadow-none dark:group-hover/highligh-link:shadow-none dark:group-hover/highligh-link:highlight-white/10 group-hover/highligh-link:shadow-blue-200 dark:group-hover/highligh-link:bg-blue-500 dark:bg-slate-700 lg:dark:bg-slate-800 dark:highlight-white/5">
          <MdCode className="icon-sky-500-sm opacity-75 group-hover/highligh-link:opacity-100 group-hover/highligh-link:dark:icon-slate-300-sm" />
        </div>
        Playground
      </Link>
    </div>
  )) || <></>;

export default Playground;
