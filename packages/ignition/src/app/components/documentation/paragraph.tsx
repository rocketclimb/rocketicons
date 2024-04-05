import { PropsWithChildren } from "react";

const Paragraph = ({ children }: PropsWithChildren) => (
  <p className="text-slate-700 dark:text-slate-400 font-normal text-base">
    {children}
  </p>
);

export default Paragraph;
