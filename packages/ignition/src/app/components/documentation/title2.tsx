import { PropsWithChildren } from "react";

const Title2 = ({ children }: PropsWithChildren) => (
  <h2 className="flex whitespace-pre-wrap mb-2 text-sm leading-6 text-sky-500 font-semibold tracking-normal dark:text-sky-400">
    {children}
  </h2>
);

export default Title2;
