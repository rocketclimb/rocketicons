import { PropsWithChildren } from "react";

const Title = ({ children }: PropsWithChildren) => (
  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">
    {children}
  </h1>
);

export default Title;
