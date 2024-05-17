import { PropsWithChildrenAndClassName } from "@/types";

const SectionContent = ({ className, children }: PropsWithChildrenAndClassName) => (
  <section className={`w-full px-0.5 grow shrink-0 ${className ?? ""}`}>{children}</section>
);

export default SectionContent;
