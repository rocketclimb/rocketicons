"use client";
import { TabsProps, Tab, OnTabChange } from "./types";
import CodeStyler from "./code-styler";
import CodeElementBlock from "./code-element-block";
import { useState } from "react";

type CodeElementOptionsProps = {
  onTabChange?: OnTabChange;
  options: TabsProps;
  component: string;
  className?: string;
};

const CodeElementOptionsStyler = ({
  onTabChange,
  options,
  component,
  className,
}: CodeElementOptionsProps) => {
  const tabs = ["default", ...options];
  const [selected, setSelected] = useState<number>(0);

  const getSelectedTabName = (): string => {
    const tab = tabs[selected];
    return typeof tab === "string" ? tab : (tab as Tab).name;
  };

  return (
    <CodeStyler
      variant="compact"
      tabs={tabs}
      onTabChange={(i, tab) => {
        setSelected(i);
        onTabChange && onTabChange(i, tab);
      }}
    >
      <CodeElementBlock
        className={className}
        component={component}
        attrs={{
          className: tabs[selected] !== "default" ? getSelectedTabName() : "",
        }}
      />
    </CodeStyler>
  );
};

export default CodeElementOptionsStyler;
