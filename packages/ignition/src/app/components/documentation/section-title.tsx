import { PropsWithChildrenAndClassName } from "@/types";

type SectionTitleProps = {
  onClick: () => void;
  selected: boolean;
} & PropsWithChildrenAndClassName;

const SectionTitle = ({
  className,
  onClick,
  selected,
  children,
}: SectionTitleProps) => (
  <button onClick={() => onClick()}>
    <h6
      data-selected={selected}
      className={`text-sm font-bold mr-6 text-nowrap text-slate-900 cursor-default border-b-2 border-transparent pb-2.5 data-[selected=false]:cursor-pointer data-[selected=true]:text-sky-500 data-[selected=true]:border-sky-500 dark:text-slate-200 data-[selected=false]:hover:border-slate-300 data-[selected=false]:hover:dark:border-slate-700 ${className}`}
    >
      {children}
    </h6>
  </button>
);

export default SectionTitle;
