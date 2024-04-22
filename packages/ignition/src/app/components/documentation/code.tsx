import { PropsWithChildren } from "react";

const Code = ({ children, xs }: PropsWithChildren & { xs?: boolean }) => (
  <code
    data-xs={xs}
    className="font-monospace text-xs sm:text-sm text-slate-700 font-[550] dark:text-slate-200 data-[xs=true]:text-xs prose:text-xs"
  >
    {children}
  </code>
);

export default Code;
