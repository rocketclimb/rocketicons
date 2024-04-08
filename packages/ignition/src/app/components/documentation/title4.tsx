import { PropsWithChildrenAndClassName } from "@/app/types";

const Title4 = ({ className, children }: PropsWithChildrenAndClassName) => (
  <h3
    className={`text-base mb-4 whitespace-pre-wrap font-semibold text-slate-900 dark:text-slate-200 lg:-ml-2 lg:pl-2 ${className}`}
  >
    {children}
  </h3>
);

export default Title4;
