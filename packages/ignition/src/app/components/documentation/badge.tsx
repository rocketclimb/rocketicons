import { PropsWithChildrenAndClassName } from "@/app/types";

const Badge = ({ children, className }: PropsWithChildrenAndClassName) => (
  <span
    className={`icon-title-box:text-[0.7rem] icon-title-box:leading-5 icon-title-box:md:text-xs text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-400/10 md:bg-transparent rounded-full py-1 px-3 items-center hover:bg-sky-400/20 ${
      className ?? ""
    }`}
  >
    {children}
  </span>
);

export default Badge;
