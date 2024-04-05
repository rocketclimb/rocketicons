import { PropsWithChildren } from "react";

const Title3 = ({ children }: PropsWithChildren) => (
  <h3 className="flex mb-4 whitespace-pre-wrap font-semibold text-slate-900 dark:text-slate-200 text-lg lg:-ml-2 lg:pl-2">
    {children}
  </h3>
);

export default Title3;
