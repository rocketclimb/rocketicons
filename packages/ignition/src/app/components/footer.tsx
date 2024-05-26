import React from "react";
import RocketClimbText from "@/app/components/rocketclimb-text";
import { FaDiscord } from "rocketicons/fa";
import Link from "next/link";
import GitHubIcon from "@/app/components/github-icon";

const Footer = () => {
  return (
    <footer className="w-full mt-8 h-16">
      <div className="px-4 pt-4 pb-5 border-t border-surface-border flex flex-row items-center text-primary-light dark:border-surface-border/5">
        <div className="grow">
          <p className="text-sm xs:text-base">
            Copyright © 2024 <RocketClimbText />
          </p>
        </div>
        <Link
          href="https://discord.gg/58NguZ5ZEX"
          target="_blank"
          className="hover:text-primary-light dark:hover:text-primary-lighter"
          title="Join our Discord server!"
        >
          <span className="text-primary-dark text-[1px] dark:text-primary">Discord</span>
          <FaDiscord className="icon-slate-500 hover:icon-slate-600 dark:hover:icon-slate-400" />
        </Link>
        <GitHubIcon className="ml-6" />
      </div>
    </footer>
  );
};

export default Footer;
