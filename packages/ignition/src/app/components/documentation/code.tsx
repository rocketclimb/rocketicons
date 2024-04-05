import { PropsWithChildren } from "react";

const Code = ({ children }: PropsWithChildren) => (
  <code className="font-monospace text-sm text-slate-700 font-[550] dark:text-slate-200 before:content-['`'] after:content-['`']">
    {children}
  </code>
);

export default Code;
