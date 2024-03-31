const Text = () => (
  <>
    <span className="font-quicksand">rocket</span>
    <span className="font-quicksand font-semibold">icons</span>
  </>
);

type RocketIconsTextProps = {
  className?: string;
};

const RocketIconsText = ({ className }: RocketIconsTextProps) => (
  <>
    {(className && (
      <div className={className}>
        <Text />
      </div>
    )) || <Text />}
  </>
);

export default RocketIconsText;
