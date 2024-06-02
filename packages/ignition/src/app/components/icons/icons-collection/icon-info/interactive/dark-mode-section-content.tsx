"use client";
import { CollectionID } from "rocketicons/data";
import { CodeStyler, CodeElementBlock } from "@rocketclimb/code-block";
import { PropsWithChildrenAndLang } from "@/types";
import { withLocale } from "@/locales";

import Section from "./section";

type DarkModeSectionContentProps = {
  collectionId: CollectionID;
  compName: string;
} & PropsWithChildrenAndLang;

const DarkModeSectionContent = ({
  lang,
  children,
  collectionId,
  compName
}: DarkModeSectionContentProps) => {
  const { copy, copied } = withLocale(lang).config("code-block");
  return (
    <Section>
      {children}
      <CodeStyler variant="compact">
        <CodeElementBlock
          copy={copy}
          copied={copied}
          attrs={{
            className:
              "icon-indigo-800 icon-lg border border-slate-900 dark:icon-purple-900-7xl dark:border-none"
          }}
          component={compName}
          inline
        />
      </CodeStyler>
    </Section>
  );
};

export default DarkModeSectionContent;
