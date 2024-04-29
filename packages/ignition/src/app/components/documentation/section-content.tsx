import { PropsWithChildrenAndClassName } from "@/types";

const SectionContent = ({ className, children }: PropsWithChildrenAndClassName) => (
  <div className={`w-full px-0.5 shrink-0 ${className}`}>{children}</div>
);

export default SectionContent;
