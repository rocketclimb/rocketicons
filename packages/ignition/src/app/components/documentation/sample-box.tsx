import { IconType } from "rocketicons";
import SamplePreviewer from "./sample-previewer";
import SampleCode from "./sample-code";
import { Languages, PropsWithClassName } from "@/types";

type SampleBoxProps = {
  Icon: IconType;
  icon: string;
  locale: Languages;
  options: string[];
} & PropsWithClassName;

const SampleBox = ({ Icon, icon, locale, options, className }: SampleBoxProps) => (
  <>
    <SamplePreviewer Icon={Icon} options={options} />

    <SampleCode className={className ?? "block"} locale={locale} icon={icon} options={options} />
  </>
);

export default SampleBox;
