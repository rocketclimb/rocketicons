import { PropsWithChildrenAndlassName } from "@/types";

const FloatBlock = ({ className, children }: PropsWithChildrenAndlassName) => (
  <div
    className={`${className} backdrop-blur border-slate-200 dark:border-slate-700 rounded-xl bg-white/85 dark:bg-transparent has-[.panel]:dark:dark:bg-slate-900/85`}
  >
    {children}
  </div>
);

export default FloatBlock;
