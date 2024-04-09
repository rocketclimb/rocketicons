"use client";
import useClipboard from "@/hooks/use-clipboard";
import { useLocale } from "@/locales";
import { PropsWithChildrenAndLang } from "@/types";

type WithCopyProps = {
  clipboardText: string;
} & PropsWithChildrenAndLang;

const WithCopy = ({ lang, clipboardText, children }: WithCopyProps) => {
  const { copy, copied } = useLocale(lang).config("code-block");

  const { write, isCurrent } = useClipboard(clipboardText);
  return (
    <a
      data-copied={isCurrent()}
      data-txt-copy={copy}
      data-txt-copied={`${copied} ✓`}
      onClick={() => write()}
      className="group/code-block inline-block min-w-32 after:hidden after:text-xs after:right-5 after:top-0 after:absolute after:w-30 after:border-slate-700 after:rounded after:py-0.5 after:px-1 hover:after:block hover:after:bg-slate-900 hover:after:border hover:after:content-[attr(data-txt-copy)] data-[copied=true]:after:content-[attr(data-txt-copied)]"
    >
      <span className="group-hover/code-block:opacity-60 inline-block">
        {children}
      </span>
    </a>
  );
};

export default WithCopy;
