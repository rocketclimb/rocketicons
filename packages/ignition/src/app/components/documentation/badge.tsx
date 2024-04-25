import { PropsWithChildrenAndClassName } from "@/app/types";

const Badge = ({ children, className }: PropsWithChildrenAndClassName) => (
  <span
    className={`ml-3 text-xs leading-5 font-medium text-sky-600 dark:text-sky-400 bg-sky-400/10 md:bg-transparent rounded-full py-1 px-3 items-center hover:bg-sky-400/20 ${
      className ?? ""
    }`}
  >
    {children}
  </span>
);

export default Badge;
