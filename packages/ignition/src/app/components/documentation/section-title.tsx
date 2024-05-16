import { PropsWithChildrenAndClassName } from "@/types";

type SectionTitleProps = {
  onClick: () => void;
  selected: boolean;
} & PropsWithChildrenAndClassName;

const SectionTitle = ({ className, onClick, selected, children }: SectionTitleProps) => (
  <button onClick={() => onClick()}>
    <h6
      data-selected={selected}
      className={`text-xs xs:text-[0.83rem] md:text-sm md:font-bold mr-2 xs:mr-3 text-nowrap text-slate-400 md:text-slate-900 data-[selected=false]:italic data-[selected=false]:md:not-italic data-[selected=false]:text-normal data-[selected=false]:dark:text-slate-600 data-[selected=false]:md:dark:text-slate-200 cursor-default border-b border-transparent pb-1.5 md:pb-2.5 data-[selected=false]:cursor-pointer data-[selected=true]:font-bold data-[selected=true]:text-sky-500 data-[selected=true]:border-sky-500 data-[selected=false]:hover:border-slate-300 data-[selected=false]:hover:dark:border-slate-700 ${className}`}
    >
      {children}
    </h6>
  </button>
);

export default SectionTitle;
