import { PropsWithChildren } from "react";
import FloatBlock from "@/components/icons/float-block";

type IconInfoPanelProps = {
  selected: boolean;
} & PropsWithChildren;

const IconInfoPanel = ({ selected, children }: IconInfoPanelProps) => (
  <div
    data-open={selected}
    className="group/info icon-info-area transition-all duration-200 fixed top-2 md:top-28 pr-2 sm:pr-16 lg:pr-0 lg:sticky -z-20 lg:top-36 w-0 pb-3 lg:pb-0 data-[open=true]:w-full data-[open=true]:md:min-w-[550px] data-[open=true]:md:w-4/5 data-[open=true]:lg:max-w-[550px] data-[open=true]:md:h-[65dvh] data-[open=true]:lg:h-[655px] data-[open=true]:z-40"
  >
    <FloatBlock className="group-data-[open=false]/info:animate-delayed-hidden relative flex flex-col group-data-[open=true]/info:border group-data-[open=true]/info:dark:border-2 px-3 py-2 h-full lg:h-[655px]">
      {children}
    </FloatBlock>
  </div>
);

export default IconInfoPanel;
