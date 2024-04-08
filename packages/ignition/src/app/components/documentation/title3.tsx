import { PropsWithChildrenAndClassName } from "@/app/types";

const Title3 = ({ className, children }: PropsWithChildrenAndClassName) => (
  <h3
    className={`flex mb-4 whitespace-pre-wrap font-semibold text-slate-900 dark:text-slate-200 text-lg lg:-ml-2 lg:pl-2 ${className}`}
  >
    {children}
  </h3>
);

export default Title3;
