import { siteConfig } from "@/config";
import Link from "next/link";
import { MdCode } from "rocketicons/md";

const { playgroundUrl } = siteConfig;

const Playground = () =>
  (playgroundUrl && (
    <div className="pt-8 pl-2">
      <Link
        className="group/highligh-link flex items-center lg:text-sm lg:leading-6 mb-4 font-medium text-primary/80 hover:text-primary dark:text-primary-lighter dark:hover:text-primary-bright"
        href={playgroundUrl}
        target="_blank"
      >
        <div className="mr-4 size-6 text-center leading-[22px] rounded-md ring-1 ring-primary/5 shadow-sm group-hover/highligh-link:shadow group-hover/highligh-link:ring-primary/10 dark:ring-0 dark:shadow-none dark:group-hover/highligh-link:shadow-none dark:group-hover/highligh-link:highlight-background/10 group-hover/highligh-link:shadow-blue-200 dark:group-hover/highligh-link:bg-blue-500 dark:bg-surface-medium lg:dark:bg-surface-dark dark:highlight-background/5">
          <MdCode className="icon-secondary-sm opacity-75 group-hover/highligh-link:opacity-100 group-hover/highligh-link:dark:icon-primary-bright-sm" />
        </div>
        Playground
      </Link>
    </div>
  )) || <></>;

export default Playground;
