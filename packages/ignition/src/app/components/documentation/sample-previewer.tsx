import { IconType } from "rocketicons";

type SamplePreviewerProps = {
  Icon: IconType;
  options: string[];
};

const SamplePreviewer = ({ options, Icon }: SamplePreviewerProps) => (
  <div className="mt-4 mb-8 bg-slate-50 rounded-xl overflow-hidden dark:bg-slate-800/25">
    <div className="bg-grid">
      <div className="mx-auto rounded-xl max-w-[380px] md:max-w-xl lg:max-w-2xl xl:max-w-max overflow-hidden p-8">
        <div className="flex w-full justify-center items-end space-x-4 font-mono font-bold text-xs text-center text-white">
          {options.map((option, i) => (
            <div key={i}>
              <Icon className={option} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default SamplePreviewer;
