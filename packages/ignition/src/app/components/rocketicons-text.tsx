import { PublicJSONIcon } from "@/app/components/icons/public-json-icon";
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
          <PublicJSONIcon
            collection="rc"
            name="RcRocketIcon"
            className={`-mt-1 icon-primary dark:icon-primary-dark`}
          />
        )}
        <span className={className}>
          <Text />
        </span>
      </span>
    )) || <Text />}
  </>
);

export const RocketIconsTextDefault = ({ className, showIcon }: RocketIconsTextProps) => (
  <RocketIconsText
    showIcon={showIcon ?? true}
    className={`${className || "text-primary dark:text-primary-dark"}`}
  />
);

export default RocketIconsText;
