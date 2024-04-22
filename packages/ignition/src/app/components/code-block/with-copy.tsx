"use client";
import BaseWithCopy from "@/components/documentation/with-copy";
import { PropsWithChildrenAndLang } from "@/types";

type WithCopyProps = {
  clipboardText: string;
} & PropsWithChildrenAndLang;

const WithCopy = ({ lang, clipboardText, children }: WithCopyProps) => (
  <BaseWithCopy
    lang={lang}
    clipboardText={clipboardText}
    className="group/code-block text-left inline-block w-full min-w-32 text-slate-50 dark:text-slate-400 after:text-xs after:-right-2 after:-top-1.5"
  >
    <span className="group-hover/code-block:opacity-60 w-full inline-block">
      {children}
    </span>
  </BaseWithCopy>
);

export default WithCopy;
