import { PropsWithChildren } from "react";
import FloatBlock from "@/components/icons/float-block";

type PanelProps = {
  selected: boolean;
} & PropsWithChildren;

const Panel = ({ selected, children }: PanelProps) => (
  <div
    data-open={selected}
    className="group/info peer/info icon-info-area transition-all duration-200 fixed top-0 data-[open=true]:md:top-auto left-0 -z-20 w-0 data-[open=true]:w-full data-[open=true]:md:h-72 data-[open=true]:md:bottom-0 data-[open=true]:z-40 data-[open=true]:md:z-20"
  >
    <FloatBlock className="group-data-[open=false]/info:animate-delayed-hidden flex flex-col h-full max-w-screen-2xl mx-auto group-data-[open=true]/info:lg:pl-72 group-data-[open=true]/info:lg:pr-4">
      {children}
    </FloatBlock>
  </div>
);

export default Panel;
