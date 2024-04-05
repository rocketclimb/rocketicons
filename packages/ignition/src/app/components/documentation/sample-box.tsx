import { IconType } from "@rocketicons/core";
import SamplePreviewer from "./sample-previewer";
import SampleCode from "./sample-code";

type SampleBoxProps = {
  Icon: IconType;
  icon: string;
  options: string[];
  className?: string;
};

const SampleBox = ({ Icon, icon, options, className }: SampleBoxProps) => (
  <>
    <SamplePreviewer Icon={Icon} options={options} />

    <SampleCode
      className={className || "block"}
      icon={icon}
      options={options}
    />
  </>
);

export default SampleBox;
