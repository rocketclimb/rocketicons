"use client";
import { withLocale } from "@/locales";
import { PropsWithLang } from "@/types";
import { CodeImportBlock, CodeStyler } from "@rocketclimb/code-block";

const Importer = ({ lang }: PropsWithLang) => {
  const { copy, copied } = withLocale(lang).config("code-block");
  return (
    <CodeStyler variant="compact" lang="js">
      <CodeImportBlock
        copy={copy}
        copied={copied}
        className="flex"
        component="RcRocketIcon"
        module="rocketicons/rc"
      />
    </CodeStyler>
  );
};

export default Importer;
