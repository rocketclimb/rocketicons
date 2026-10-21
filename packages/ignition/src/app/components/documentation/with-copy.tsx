"use client";
import useClipboard from "@/hooks/use-clipboard";
import { withLocale } from "@/locales";
import { Languages, PropsWithChildrenAndClassName } from "@/types";

type WithCopyProps = {
  lang?: Languages;
  clipboardText: string;
} & PropsWithChildrenAndClassName;

const WithCopy = ({ lang, clipboardText, className, children }: WithCopyProps) => {
  const { copy, copied } = withLocale(lang || "en").config("code-block");
  const { write, isCurrent } = useClipboard(clipboardText);

  return (
    <button
      data-copied={isCurrent()}
      data-txt-copy={copy}
      data-txt-copied={`${copied} ✓`}
      onClick={() => write()}
      onKeyDown={({ key }) => key === "c" && write()}
      className={`relative after:text-xs after:hidden after:absolute after:w-30 after:border-slate-700 after:rounded after:py-0.5 after:px-1 hover:after:block hover:after:bg-slate-900 hover:after:border hover:after:content-[attr(data-txt-copy)] data-[copied=true]:after:content-[attr(data-txt-copied)] ${
        className ?? ""
      }`}
    >
      {children}
    </button>
  );
};

export default WithCopy;
