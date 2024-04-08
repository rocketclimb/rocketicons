import { PropsWithChildrenAndlassName } from "@/types";

const Paragraph = ({ className, children }: PropsWithChildrenAndlassName) => (
  <p
    className={`text-slate-700 dark:text-slate-400 font-normal text-base ${className}`}
  >
    {children}
  </p>
);

export default Paragraph;
