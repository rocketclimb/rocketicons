import { PropsWithClassName } from "@/types";

const Text = () => (
  <>
    <span className="font-quicksand">rocket</span>
    <span className="font-quicksand font-semibold">climb</span>
  </>
);

const RocketClimbText = ({ className }: PropsWithClassName) => (
  <>
    {(className && (
      <span className={className}>
        <Text />
      </span>
    )) || <Text />}
  </>
);

export default RocketClimbText;
