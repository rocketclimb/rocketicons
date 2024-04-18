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
    <button
      data-copied={isCurrent()}
      data-txt-copy={copy}
      data-txt-copied={`${copied} ✓`}
      onClick={() => write()}
      onKeyDown={({ key }) => key === "c" && write()}
      role="button"
      className="group/code-block text-left inline-block w-full min-w-32 after:hidden after:text-xs after:right-5 after:top-0 after:absolute after:w-30 text-slate-50 dark:text-slate-400 after:border-slate-700 after:rounded after:py-0.5 after:px-1 hover:after:block hover:after:bg-slate-900 hover:after:border hover:after:content-[attr(data-txt-copy)] data-[copied=true]:after:content-[attr(data-txt-copied)]"
    >
      <span className="group-hover/code-block:opacity-60 w-full inline-block">
        {children}
      </span>
    </button>
  );
};

export default WithCopy;
