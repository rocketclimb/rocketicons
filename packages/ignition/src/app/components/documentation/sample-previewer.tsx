import { IconType } from "rocketicons";
import GridContainer from "./grid-container";

type SamplePreviewerProps = {
  Icon: IconType;
  options: string[];
};

const SamplePreviewer = ({ options, Icon }: SamplePreviewerProps) => (
  <GridContainer>
    <div className="mx-auto rounded-xl max-w-[380px] md:max-w-xl lg:max-w-2xl xl:max-w-max overflow-hidden p-8">
      <div className="flex w-full justify-center items-end space-x-4 font-mono font-bold text-xs text-center text-white">
        {options.map((option, i) => (
          <div key={i}>
            <Icon className={option} />
          </div>
        ))}
      </div>
    </div>
  </GridContainer>
);

export default SamplePreviewer;
