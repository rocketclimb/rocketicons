"use client";
import { PropsWithLang } from "@/types";
import { CodeElementBlock, CodeStyler } from "@/components/code-block";

const ElementBlock = ({ lang }: PropsWithLang) => (
  <CodeStyler variant="compact">
    <CodeElementBlock locale={lang} component="RcRocketIcon" />
  </CodeStyler>
);

export default ElementBlock;
