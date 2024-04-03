"use client";
import React, { PropsWithChildren, useState } from "react";
import { Tab, TabsProps, OnTabChange } from "./types";

type CodeStylerProps = {
  variant?: "full" | "minimalist" | "compact";
  className?: string;
  tabs?: TabsProps;
  onTabChange?: OnTabChange;
} & PropsWithChildren;

const wrapperFullClassName =
  "group-data-[variant=full]/styler:h-[31.625rem] group-data-[variant=full]/styler:lg:h-[34.6875rem] group-data-[variant=full]/styler:xl:h-[31.625rem]";
const codeMinimalistClassName = "group-data-[variant=minimalist]/styler:p-5";
const codeCompactClassName = "group-data-[variant=compact]/styler:p-2.5";

const barMinimalistClassName = "group-data-[variant=minimalist]/styler:hidden";
const barCompactClassName = "group-data-[variant=compact]/styler:hidden";

type TabSelectorProps = {
  onTabChange?: OnTabChange;
  tabs: TabsProps;
};

const TabSelector = ({ tabs, onTabChange }: TabSelectorProps) => {
  const [selected, setSelected] = useState<number>(0);
  return (
    <div className="flex text-slate-400 text-xs leading-6 mt-2 overflow-y-auto thin-scroll">
      {tabs.map((tab, i) => (
        <div
          key={i}
          data-selected={i === selected}
          onClick={() => {
            setSelected(i);
            onTabChange && onTabChange(i, tab);
          }}
          className="flex-none cursor-pointer data-[selected=true]:cursor-default text-slate-500 data-[selected=true]:text-sky-300 border-t border-b border-t-transparent border-b-slate-800 data-[selected=true]:border-b-sky-300 px-4 py-1 flex items-center"
        >
          {(typeof tab === "string" && tab) || (tab as Tab).name}
        </div>
      ))}
      <div className="flex-auto flex items-center bg-slate-700/50 border border-slate-500/30 rounded-tl"></div>
    </div>
  );
};

const CodeStyler = ({
  variant,
  className,
  tabs,
  onTabChange,
  children,
}: CodeStylerProps) => (
  <div
    data-variant={variant || "full"}
    className={`group/styler relative row-start-1 col-start-6 xl:col-start-7 col-span-7 xl:col-span-6 ${className}`}
  >
    <div className="-mx-4 sm:mx-0">
      <div
        className={`relative overflow-hidden shadow-xl flex bg-slate-800  max-h-[60vh] sm:max-h-[none] sm:rounded-xl dark:bg-slate-900/70 dark:backdrop-blur dark:ring-1 dark:ring-inset dark:ring-white/10 ${wrapperFullClassName}`}
      >
        <div className="relative w-full flex flex-col">
          <div
            className={`flex-none border-b border-slate-500/30 ${barMinimalistClassName} ${barCompactClassName}`}
          >
            <div className="flex items-center h-8 space-x-1.5 px-3">
              <div className="w-2.5 h-2.5 bg-slate-600 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-slate-600 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-slate-600 rounded-full"></div>
            </div>
          </div>
          {tabs && <TabSelector tabs={tabs} onTabChange={onTabChange} />}
          <div
            className={`relative min-h-0 flex-auto flex flex-col dark ${codeMinimalistClassName} ${codeCompactClassName}`}
          >
            <div className="w-full flex-auto flex min-h-0 overflow-auto">
              <div className="w-full relative flex-auto cursor-default">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CodeStyler;
