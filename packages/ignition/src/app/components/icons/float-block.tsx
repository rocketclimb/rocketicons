import { PropsWithChildrenAndClassName } from "@/types";

const FloatBlock = ({ className, children }: PropsWithChildrenAndClassName) => (
  <div
    className={`${className} lg:backdrop-blur has-[.panel]:backdrop-blur-none border-slate-200 dark:border-slate-700 rounded-xl bg-background/85 dark:bg-background-dark/85 has-[.panel]:!bg-transparent`}
  >
    {children}
  </div>
);

export default FloatBlock;
