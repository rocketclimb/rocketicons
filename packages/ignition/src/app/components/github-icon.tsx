import Link from "next/link";
import { IoLogoGithub } from "rocketicons/io";

const GitHubIcon = ({ className }: { className?: string }) => (
  <Link
    href="https://github.com/rocketclimb/rocketicons"
    target="_blank"
    className={`hover:text-slate-500 dark:hover:text-slate-400 mb-0.5 ${className}`}
    title="rockeicons @github.com/rocketclimb"
  >
    <span className="text-white text-[1px] dark:text-slate-900">GitHub</span>
    <IoLogoGithub className="icon-slate-500 hover:icon-slate-600 dark:hover:icon-slate-400" />
  </Link>
);

export default GitHubIcon;
