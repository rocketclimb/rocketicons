"use client";
import { PropsWithLang } from "@/types";
import { CodeImportBlock, CodeStyler } from "@/components/code-block";

const Importer = ({ lang }: PropsWithLang) => (
  <CodeStyler variant="compact">
    <CodeImportBlock
      locale={lang}
      className="text-xs flex"
      component="RcRocketIcon"
      module="rocketicons/rc"
    />
  </CodeStyler>
);

export default Importer;
