import Link from "next/link";

type LearnMoreProps = {
  label: string;
  href: string;
};

const LearnMore = ({ label, href }: LearnMoreProps) => (
  <Link
    className="absolute -top-1 right-0 border-b border-secondary default-text-color hover:border-b-2 text-[0.7rem]/tight italic"
    href={href}
  >
    {label}...
  </Link>
);

export default LearnMore;
