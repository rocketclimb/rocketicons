import { PropsWithChildrenAndClassName } from "@/types";

const FloatBlock = ({ className, children }: PropsWithChildrenAndClassName) => (
  <div
    className={`${className} lg:backdrop-blur border-slate-200 dark:border-slate-700 rounded-xl bg-background/85 dark:bg-background-dark/85 has-[.panel]:bg-background has-[.panel]:lg:bg-background/85  has-[.panel]:dark:bg-background-dark has-[.panel]:dark:lg:bg-background-dark/85`}
  >
    {children}
  </div>
);

export default FloatBlock;
