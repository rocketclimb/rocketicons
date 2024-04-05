import { IconType } from "@rocketicons/core";

type SamplePreviewerProps = {
  Icon: IconType;
  options: string[];
};

const SamplePreviewer = ({ options, Icon }: SamplePreviewerProps) => (
  <div className="mt-4 mb-8 bg-slate-50 rounded-xl overflow-hidden dark:bg-slate-800/25">
    <div className="bg-grid">
      <div className="rounded-xl overflow-auto p-8">
        <div className="flex justify-center items-end space-x-4 font-mono font-bold text-xs text-center text-white">
          {options.map((option, i) => (
            <Icon key={i} className={option} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default SamplePreviewer;