import { PropsWithChildren } from "react";

const Highlight = ({ children }: PropsWithChildren) => (
  <p className="my-5 tracking-tight text-lg text-slate-700 dark:text-slate-400 min-[714px]:mb-12 md:tracking-normal md:mb-10 min-[1218px]:mb-16">
    {children}
  </p>
);

export default Highlight;
