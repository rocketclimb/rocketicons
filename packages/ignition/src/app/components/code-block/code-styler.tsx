"use client";
import React from "react";
import { PropsWithChildrenAndClassName } from "@/types";
import { TabsProps, OnTabChange, CodeStylerVariations } from "./types";
import TabSelector from "./tab-selector";
import { getLanguageClass, Lang } from "./utils";

type BaseCodeStylerProps = {
  variant?: CodeStylerVariations;
  animatedPreviewer?: boolean;
  lang?: Lang;
} & PropsWithChildrenAndClassName;

type CodeStylerPropsWithFileName = {
  filename: string;
} & BaseCodeStylerProps;

type CodeStylerPropsWithTabs = {
  tabs: TabsProps;
  allowSelectionUntil: number;
  onTabChange: OnTabChange;
} & BaseCodeStylerProps;

type CodeStylerProps =
  | BaseCodeStylerProps
  | CodeStylerPropsWithTabs
  | CodeStylerPropsWithFileName;

const codeMinimalistClassName =
  "group-data-[variant=minimalist]/styler:px-2 group-data-[variant=minimalist]/styler:py-3";
const codeCompactClassName = "group-data-[variant=compact]/styler:p-2.5";

const barMinimalistClassName = "group-data-[variant=minimalist]/styler:hidden";
const barCompactClassName = "group-data-[variant=compact]/styler:hidden";

const CodeStyler = ({
  variant,
  className,
  children,
  animatedPreviewer,
  lang,
  ...props
}: CodeStylerProps) => (
  <div
    data-variant={variant || "full"}
    data-animated={animatedPreviewer}
    className={`group/styler code-styler no-backtick relative ${className}`}
  >
    <div
      className={`pl-2 pr-1 pb-1 mx-auto shadow-xl bg-slate-800 rounded sm:max-h-[none] sm:rounded-xl dark:bg-slate-900/70 dark:backdrop-blur dark:ring-1 dark:ring-inset dark:ring-white/10`}
    >
      <div>
        <div
          className={`flex-none -ml-2 -mr-1 border-b border-slate-500/30 ${barMinimalistClassName} ${barCompactClassName}`}
        >
          <div className="flex items-center h-8 space-x-1.5 px-3">
            <div className="w-2.5 h-2.5 bg-slate-600 rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-slate-600 rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-slate-600 rounded-full"></div>
          </div>
        </div>
        <TabSelector {...props} />
        <div
          className={`min-h-0 max-h-[60vh] group-data-[variant=full]/styler:lg:min-h-[510px] dark overflow-auto thin-scroll pr-1 ${codeMinimalistClassName} ${codeCompactClassName} ${getLanguageClass(lang || "html")}`}
        >
          <div className="min-h-0">
            <div className="cursor-default">{children}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CodeStyler;
