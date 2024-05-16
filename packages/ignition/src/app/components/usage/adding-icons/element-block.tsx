"use client";
import { withLocale } from "@/locales";
import { PropsWithLang } from "@/types";
import { CodeElementBlock, CodeStyler } from "@rocketclimb/code-block";

const ElementBlock = ({ lang }: PropsWithLang) => {
  const { copy, copied } = withLocale(lang).config("code-block");
  return (
    <CodeStyler variant="compact">
      <CodeElementBlock copy={copy} copied={copied} component="RcRocketIcon" />
    </CodeStyler>
  );
};

export default ElementBlock;
