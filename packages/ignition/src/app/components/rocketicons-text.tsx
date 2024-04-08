import { PropsWithClassName } from "@/types";

const Text = () => (
  <>
    <span className="font-quicksand">rocket</span>
    <span className="font-quicksand font-semibold">icons</span>
  </>
);

const RocketIconsText = ({ className }: PropsWithClassName) => (
  <>
    {(className && (
      <span className={className}>
        <Text />
      </span>
    )) || <Text />}
  </>
);

export default RocketIconsText;
