const Text = () => (
  <>
    <span className="font-quicksand">rocket</span>
    <span className="font-quicksand font-semibold">climb</span>
  </>
);

type RocketClimbTextProps = {
  className?: string;
};

const RocketClimbText = ({ className }: RocketClimbTextProps) => (
  <>
    {(className && (
      <span className={className}>
        <Text />
      </span>
    )) || <Text />}
  </>
);

export default RocketClimbText;
