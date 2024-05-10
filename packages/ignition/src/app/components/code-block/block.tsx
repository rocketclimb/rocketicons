import { PropsWithChildrenAndClassName } from "@/types";

const Code = ({ className, children, xs }: PropsWithChildrenAndClassName & { xs?: boolean }) => (
  <code
    data-xs={xs}
    className={`font-monospace text-xs sm:text-sm leading-6 text-slate-700 font-[550] dark:text-slate-200 data-[xs=true]:text-xs prose:text-xs ${className ?? ""}`}
  >
    {children}
    <span className="count"></span>
  </code>
);

export default Code;
