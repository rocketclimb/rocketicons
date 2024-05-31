"use client";
import { useRouter } from "next/navigation";
import { CollectionID } from "rocketicons/data";
import { CodeStyler, CodeElementBlock } from "@rocketclimb/code-block";
import { PropsWithChildrenAndLang } from "@/types";
import { withLocale } from "@/locales";

import Section from "./section";

type StateSectionContentProps = {
  collectionId: CollectionID;
  compName: string;
} & PropsWithChildrenAndLang;

const StateSectionContent = ({
  lang,
  children,
  collectionId,
  compName
}: StateSectionContentProps) => {
  const { copy, copied } = withLocale(lang).config("code-block");
  return (
    <Section>
      {children}
      <CodeStyler variant="compact">
        <CodeElementBlock
          copy={copy}
          copied={copied}
          className="text-xs flex no-wrap"
          attrs={{
            className: "icon-indigo-800 icon-5xl hover:icon-purple-900-7xl"
          }}
          component={compName}
        />
      </CodeStyler>
    </Section>
  );
};

export default StateSectionContent;
