import { PropsWithChildrenAndClassName } from "@/types";

type SectionTitleProps = {
  onClick: () => void;
  selected: boolean;
} & PropsWithChildrenAndClassName;

const SectionTitle = ({ className, onClick, selected, children }: SectionTitleProps) => (
  <button onClick={() => onClick()}>
    <h6
      data-selected={selected}
      className={`text-xs xs:text-[0.83rem] md:text-sm md:font-bold mr-2 xs:mr-3 text-nowrap text-primary-lighter md:text-primary data-[selected=false]:italic data-[selected=false]:md:not-italic data-[selected=false]:text-normal data-[selected=false]:dark:text-primary-medium data-[selected=false]:md:dark:text-primary-dark cursor-default border-b border-transparent pb-1.5 md:pb-2.5 data-[selected=false]:cursor-pointer data-[selected=true]:font-bold data-[selected=true]:text-secondary data-[selected=true]:border-secondary data-[selected=false]:hover:border-surface-border-lighter data-[selected=false]:hover:dark:border-surface-medium ${className}`}
    >
      {children}
    </h6>
  </button>
);

export default SectionTitle;
