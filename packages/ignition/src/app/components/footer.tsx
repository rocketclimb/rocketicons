import React from "react";
import RocketClimbText from "@/app/components/rocketclimb-text";
import { FaDiscord } from "rocketicons/fa";
import Link from "next/link";
import GitHubIcon from "@/app/components/github-icon";

const Footer = () => {
  return (
    <footer className="w-full mt-8 h-16">
      <div className="px-4 pt-4 pb-5 border-t border-slate-200 flex flex-row text-slate-500 dark:border-slate-200/5">
        <div className="grow">
          <p>
            Copyright © 2024 <RocketClimbText />
          </p>
        </div>
        <Link
          href="https://discord.gg/58NguZ5ZEX"
          target="_blank"
          className="hover:text-slate-500 dark:hover:text-slate-400"
          title="Join our Discord server!"
        >
          <span className="text-white text-[1px] dark:text-slate-900">Discord</span>
          <FaDiscord className="icon-slate-500 hover:icon-slate-600 dark:hover:icon-slate-400" />
        </Link>
        <GitHubIcon className="ml-6" />
      </div>
    </footer>
  );
};

export default Footer;
