import Link from "next/link";
import { IoLogoGithub } from "rocketicons/io";

const GitHubIcon = ({ className }: { className?: string }) => (
  <Link
    href="https://github.com/rocketclimb/rocketicons"
    target="_blank"
    className={`hover:primary-light dark:hover:text-primary-lighter mb-0.5 ${className}`}
    title="rockeicons @github.com/rocketclimb"
  >
    <span className="text-primary-dark text-[1px] dark:text-primary">GitHub</span>
    <IoLogoGithub className="icon-primary-light hover:icon-primary-medium dark:hover:icon-primary-lighter" />
  </Link>
);

export default GitHubIcon;
