"use client";
import { useState } from "react";
import { IconType } from "rocketicons/core";
import { BsMoonStars, BsSun } from "rocketicons/bs";
import { MdOutlineMonitor, MdKeyboardArrowDown } from "rocketicons/md";

import { ThemeOptions } from "@/hooks";
import { useLocale } from "@/locales";

import { PropsWithLang } from "@/types";

import { useThemeContext } from "./theme-context";

import Button from "../button";

type Selector = {
  theme: ThemeOptions;
  label: string;
  Icon: IconType;
};

const ThemeSelector = ({ lang }: PropsWithLang) => {
  const { themes } = useLocale(lang).config();
  const [current, setTheme] = useThemeContext();
  const [showing, setShowing] = useState<boolean>(false);

  const selectors: Selector[] = [
    { theme: "dark", label: themes.dark, Icon: BsMoonStars },
    { theme: "light", label: themes.light, Icon: BsSun },
    { theme: "system", label: themes.system, Icon: MdOutlineMonitor },
  ];

  const updateTheme = (theme: ThemeOptions) => {
    setTheme(theme);
    setShowing(false);
  };

  const SelectedTheme = () => {
    const { Icon, label } =
      selectors.find(({ theme }) => theme === current) || {};
    return (
      <>
        {Icon && (
          <>
            <Icon className="icon-slate-700 dark:icon-slate-400 md:icon-sky-500 md:dark:icon-sky-500" />{" "}
            <span className="md:hidden ml-2 font-medium">{label}</span>
          </>
        )}
      </>
    );
  };

  type SelectorMenuProps = {
    className?: string;
  };
  const SelectorMenu = ({ className }: SelectorMenuProps) => (
    <ul
      className={`${className} absolute w-36 pb-2 bg-white rounded-lg mt-8 shadow-lg text-sm text-slate-700 font-semibold dark:bg-slate-800 dark:highlight-white/5 dark:text-slate-300 ${
        (showing && "opacity-100 z-50") || "opacity-0 -z-50"
      }`}
    >
      {selectors.map(({ theme, label, Icon }, i) => (
        <li
          key={i}
          className={`first-of-type:mt-3 py-1 px-3 flexitems-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600/30 ${
            theme === current && "text-sky-500"
          }`}
        >
          <Button
            className="w-full text-left"
            onClick={() => updateTheme(theme)}
          >
            <Icon
              className={`${
                (theme === current && "icon-sky-500") || "icon-slate-500"
              }`}
            />{" "}
            {label}
          </Button>
        </li>
      ))}
    </ul>
  );

  const ThemeSelectorAsIcon = () => (
    <div className="relative hidden md:block">
      <Button
        className="flex"
        onClick={() => setShowing((showing) => !showing)}
      >
        <SelectedTheme />
      </Button>
      <SelectorMenu className="right-0" />
    </div>
  );

  const ThemeSelectorAsMenu = () => (
    <div className="flex md:hidden items-center mt-6 w-full h-20 font-normal border-t border-slate-900/10 dark:border-slate-50/[0.06]">
      <div className="grow">{themes.switchTheme} </div>
      <Button
        className="flex items-center py-2 px-3 border border-slate-200 rounded-lg dark:highlight-white/5 dark:bg-slate-600 dark:border-slate-600 dark:text-slate-200"
        onClick={() => setShowing((showing) => !showing)}
      >
        <SelectedTheme />
        <MdKeyboardArrowDown className="ml-2 icon-slate-400" />
      </Button>
      <SelectorMenu className="right-5" />
    </div>
  );

  return (
    <>
      <ThemeSelectorAsIcon />
      <ThemeSelectorAsMenu />
    </>
  );
};

export default ThemeSelector;
