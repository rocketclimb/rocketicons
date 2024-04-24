"use client";
import { TabsProps, Tab, OnTabChange, CodeElementTabs } from "./types";
import CodeStyler from "./code-styler";
import CodeElementBlock from "./code-element-block";
import { useState } from "react";
import { Languages, PropsWithClassName } from "@/types";
import { withLocale } from "@/app/locales";

type CodeElementOptionsProps = {
  locale: Languages;
  onTabChange?: OnTabChange;
  options: TabsProps;
  component: string;
  showMore?: boolean;
} & PropsWithClassName;

const CodeElementOptionsStyler = ({
  locale,
  onTabChange,
  options,
  component,
  className,
  showMore,
}: CodeElementOptionsProps) => {
  const { config } = withLocale(locale);
  const tabs = [CodeElementTabs.DEFAULT, ...options];
  const allowSelectionUntil = tabs.length;
  showMore &&
    tabs.push({
      id: CodeElementTabs.MORE,
      name: `... ${config("code-block").more}`,
    });
  const [selected, setSelected] = useState<number>(0);

  const getSelectedTabName = (): string => {
    const tab = tabs[selected];
    return typeof tab === "string" ? tab : (tab as Tab).name;
  };

  return (
    <CodeStyler
      variant="compact"
      tabs={tabs}
      allowSelectionUntil={allowSelectionUntil}
      onTabChange={(i, tab) => {
        i < allowSelectionUntil && setSelected(i);
        onTabChange && onTabChange(i, tab);
      }}
    >
      <CodeElementBlock
        locale={locale}
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
