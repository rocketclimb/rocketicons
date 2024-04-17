import { RcRocketIcon } from "rocketicons/rc";
import { PropsWithChildrenAndClassName } from "@/types";

const Text = () => (
  <>
    <span className="font-quicksand">rocket</span>
    <span className="font-quicksand font-semibold">icons</span>
  </>
);

type RocketIconsTextProps = {
  showIcon?: boolean;
} & PropsWithChildrenAndClassName;

const RocketIconsText = ({ showIcon, className }: RocketIconsTextProps) => (
  <>
    {(className && (
      <span className="whitespace-nowrap">
        {!!showIcon && (
          <RcRocketIcon className={`-mt-1 icon-slate-900 dark:icon-white`} />
        )}
        <span className={className}>
          <Text />
        </span>
      </span>
    )) || <Text />}
  </>
);

export const RocketIconsTextDefault = ({
  className,
  showIcon,
}: RocketIconsTextProps) => (
  <RocketIconsText
    showIcon={showIcon ?? true}
    className={`text-slate-900 dark:text-white ${className}`}
  />
);

export default RocketIconsText;
