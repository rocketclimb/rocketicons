"use client";
import { withLocale } from "@/locales";
import { PropsWithLang } from "@/types";
import { CodeImportBlock } from "@rocketclimb/code-block";

const Importer = ({ lang }: PropsWithLang) => {
  const { copy, copied } = withLocale(lang).config("code-block");
  return (
    <CodeImportBlock
      lang="js"
      copy={copy}
      copied={copied}
      className="flex"
      component="RcRocketIcon"
      module="rocketicons/rc"
    />
  );
};

export default Importer;
