import { IoLogoGithub } from "rocketicons/io";
import React from "react";
import RocketClimbText from "@/app/components/rocketclimb-text";

const Footer = () => {
  return (
    <footer className="w-full mt-8 h-16">
      <div className="px-4 pt-4 pb-5 border-t border-slate-200 flex justify-between text-slate-500 dark:border-slate-200/5">
        <div>
          <p>
            Copyright © 2024 <RocketClimbText />
          </p>
        </div>
        <div className="leading-5 text-slate-400 dark:text-slate-500">
          <a
            href="https://github.com/rocketclimb/rocketicons"
            className="hover:text-slate-500 dark:hover:text-slate-400"
          >
            <span className="text-white text-[1px] dark:text-slate-900">
              GitHub
            </span>
            <IoLogoGithub className="icon-slate-500 hover:icon-slate-600 dark:hover:icon-slate-400" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
