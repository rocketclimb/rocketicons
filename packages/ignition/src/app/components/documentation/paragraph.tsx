import { PropsWithChildrenAndClassName } from "@/types";

const Paragraph = ({ className, children }: PropsWithChildrenAndClassName) => (
  <p
    className={`group/p paragraph text-slate-700 dark:text-slate-400 font-normal text-sm lg:text-base ${className}`}
  >
    {children}
  </p>
);

export default Paragraph;
