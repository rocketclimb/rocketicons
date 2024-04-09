"use client";
import React, { useState } from "react";
import { Tab, TabsProps, OnTabChange, CodeStylerVariations } from "./types";
import { PropsWithChildrenAndClassName } from "@/types";

type CodeStylerProps = {
  variant?: CodeStylerVariations;
  tabs?: TabsProps;
  allowSelectionUntil?: number;
  onTabChange?: OnTabChange;
  animatedPreviewer?: boolean;
} & PropsWithChildrenAndClassName;

const wrapperFullClassName =
  "group-data-[variant=full]/styler:h-[31.625rem] group-data-[variant=full]/styler:lg:h-[34.6875rem] group-data-[variant=full]/styler:xl:h-[31.625rem]";
const codeMinimalistClassName = "group-data-[variant=minimalist]/styler:p-5";
const codeCompactClassName = "group-data-[variant=compact]/styler:p-2.5";

const barMinimalistClassName = "group-data-[variant=minimalist]/styler:hidden";
const barCompactClassName = "group-data-[variant=compact]/styler:hidden";

type TabSelectorProps = {
  onTabChange?: OnTabChange;
  tabs: TabsProps;
  allowSelectionUntil: number;
};

const TabSelector = ({
  tabs,
  allowSelectionUntil,
  onTabChange,
}: TabSelectorProps) => {
  const [selected, setSelected] = useState<number>(0);
  return (
    <div className="flex text-slate-400 text-xs leading-6 mt-2 overflow-y-auto thin-scroll">
      {tabs.map((tab, i) => (
        <div
          key={i}
          data-selected={i === selected}
          onClick={() => {
            i < allowSelectionUntil && setSelected(i);
            onTabChange && onTabChange(i, tab);
          }}
          className="flex-none cursor-pointer data-[selected=true]:cursor-default text-slate-500 data-[selected=true]:text-sky-300 border-t border-b border-t-transparent border-b-slate-800 data-[selected=true]:border-b-sky-300 px-3 py-1 flex items-center"
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
  allowSelectionUntil,
  onTabChange,
  children,
  animatedPreviewer,
}: CodeStylerProps) => (
  <div
    data-variant={variant || "full"}
    data-animated={animatedPreviewer}
    className={`group/styler relative grow data-[animated=true]:row-start-1 data-[animated=true]:col-start-6 data-[animated=true]:xl:col-start-7 data-[animated=true]:col-span-7 data-[animated=true]:xl:col-span-6 ${className}`}
  >
    <div
      className={`relative overflow-hidden shadow-xl flex bg-slate-800 rounded max-h-[60vh] sm:max-h-[none] sm:rounded-xl dark:bg-slate-900/70 dark:backdrop-blur dark:ring-1 dark:ring-inset dark:ring-white/10 ${wrapperFullClassName}`}
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
        {tabs && allowSelectionUntil && (
          <TabSelector
            tabs={tabs}
            allowSelectionUntil={allowSelectionUntil}
            onTabChange={onTabChange}
          />
        )}
        <div
          className={`relative min-h-0 flex-auto flex flex-col dark ${codeMinimalistClassName} ${codeCompactClassName}`}
        >
          <div className="w-80 lg:w-full flex-auto flex min-h-0 overflow-auto thin-scroll">
            <div className="w-full relative flex-auto cursor-default">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CodeStyler;
