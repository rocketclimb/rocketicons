"use client";
import { HtmlHTMLAttributes, useState } from "react";
import { Tab, TabsProps, OnTabChange } from "./types";

type BaseTabProps = {
  asSpan?: boolean;
};

type FileTabProps = {
  filename: string;
} & BaseTabProps;

type TabSelectorProps = {
  onTabChange: OnTabChange;
  tabs: TabsProps;
  allowSelectionUntil: number;
} & BaseTabProps;

type ContainerProps = {
  asSpan?: boolean;
} & HtmlHTMLAttributes<HTMLDivElement>;

const Container = ({ asSpan, children, ...props }: ContainerProps) =>
  asSpan ? <span {...props}>{children}</span> : <div {...props}>{children}</div>;

const TabSelector = ({ asSpan, ...props }: BaseTabProps | TabSelectorProps | FileTabProps) => {
  const [selected, setSelected] = useState<number>(0);
  const filename = (props as FileTabProps).filename;
  const hasFilename = !!filename;
  const { tabs, allowSelectionUntil, onTabChange } = props as TabSelectorProps;
  return (
    <>
      {(hasFilename || tabs) && (
        <Container
          className="flex text-slate-400 text-xs leading-6 mt-2 -mr-1 overflow-y-auto thin-scroll"
          asSpan={asSpan}
        >
          {(tabs || [filename]).map((tab, i) => (
            <Container
              key={i}
              data-selected={i === selected}
              {...(!hasFilename && {
                onClick: () => {
                  console.log("here", selected);
                  i < allowSelectionUntil && setSelected(i);
                  onTabChange && onTabChange(i, tab);
                }
              })}
              asSpan={asSpan}
              className="flex-none cursor-pointer data-[selected=true]:cursor-default text-slate-500 data-[selected=true]:text-sky-300 border-t border-b border-t-transparent border-b-slate-800 data-[selected=true]:border-b-sky-300 px-3 py-1 flex items-center"
            >
              {(typeof tab === "string" && tab) || (tab as Tab).name}
            </Container>
          ))}
          <Container
            asSpan={asSpan}
            className="flex-auto flex items-center bg-slate-700/50 border border-t-0 border-r-0 border-slate-500/30 rounded-tr sm:rounded-tr-xl"
          ></Container>
        </Container>
      )}
    </>
  );
};

export default TabSelector;
