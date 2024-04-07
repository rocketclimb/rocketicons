import { RcRocketIcon } from "rocketicons/rc";

const Text = () => (
  <>
    <span className="font-quicksand">rocket</span>
    <span className="font-quicksand font-semibold">icons</span>
  </>
);

type RocketIconsTextProps = {
  showIcon?: boolean;
  className?: string;
};

const RocketIconsText = ({ showIcon, className }: RocketIconsTextProps) => (
  <>
    {(className && (
      <span className="whitespace-nowrap">
        {!!showIcon && <RcRocketIcon className={`-mt-1 `} />}
        <span className={className}>
          <Text />
        </span>
      </span>
    )) || <Text />}
  </>
);

export const RocketIconsTextDefault = ({
  showIcon,
  className,
}: RocketIconsTextProps) => (
  <RocketIconsText
    showIcon={showIcon || true}
    className={`text-slate-900 dark:text-white ${className}`}
  />
);

const selectIconClasses = (className: string | undefined) => {
  if (!className) return "";

  const classes = className
    .split(" ")
    .filter((c) => c.includes("text-"))
    .map((c) => c.split("-").slice(0, 2).join("-"));
  return classes.map((c) => c.replace("text", "icon")).join(" ");
};

export default RocketIconsText;
