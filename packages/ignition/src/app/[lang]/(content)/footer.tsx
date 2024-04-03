import { IoLogoGithub } from "rocketicons/io";
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="relative mx-auto w-full max-w-screen-xl px-4 py-10 md:py-10 text-sm leading-6 mt-16">
      <div className="pt-10 pb-28 border-t border-slate-200 sm:flex justify-between text-slate-500 dark:border-slate-200/5">
        <div>
          <p>Copyright © 2024 RocketClimb.</p>
        </div>
        <div className="flex space-x-10 text-slate-400 dark:text-slate-500">
          <a
            href="https://github.com/rocketclimb/rocketicons"
            className="hover:text-slate-500 dark:hover:text-slate-400"
          >
            <span className="sr-only">GitHub</span>
            <IoLogoGithub className="ml-6 icon-slate-500 hover:icon-slate-600 dark:hover:icon-slate-400" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
