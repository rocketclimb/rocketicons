import { PropsWithChildrenAndClassName } from "@/types";

const FloatBlock = ({ className, children }: PropsWithChildrenAndClassName) => (
  <div
    className={`${className} lg:backdrop-blur border-slate-200 dark:border-slate-700 rounded-xl bg-white/85 dark:bg-slate-900/85 has-[.panel]:bg-white has-[.panel]:lg:bg-white/85  has-[.panel]:dark:bg-slate-900 has-[.panel]:dark:lg:bg-slate-900/85`}
  >
    {children}
  </div>
);

export default FloatBlock;
