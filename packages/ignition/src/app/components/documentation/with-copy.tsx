"use client";
import useClipboard from "@/hooks/use-clipboard";
import { withLocale } from "@/locales";
import { Languages } from "@/types";
import { PropsWithChildren } from "react";

type WithCopyProps = {
  className?: string;
  lang?: Languages;
  clipboardText: string;
} & PropsWithChildren;

const WithCopy = ({ lang, clipboardText, className, children }: WithCopyProps) => {
  const useIcons = !lang;
  const { copy, copied } = withLocale(lang || "en").config("code-block");
  const { write, isCurrent } = useClipboard(clipboardText);

  const copyIcon = `\ue14f`;
  const copiedIcon = `\ue179`;

  return (
    <button
      data-icons={useIcons}
      data-copied={isCurrent()}
      data-txt-copy={useIcons ? copyIcon : copy}
      data-txt-copied={useIcons ? copiedIcon : `${copied} ✓`}
      onClick={() => write()}
      onKeyDown={({ key }) => key === "c" && write()}
      className={`relative after:hidden after:absolute after:w-30 after:border-slate-700 after:rounded after:py-0.5 after:px-1 data-[icons=true]:after:text-2xl data-[icons=true]:after:mr-2 data-[icons=true]:after:font-icons hover:after:block hover:after:bg-slate-900 hover:after:border hover:after:content-[attr(data-txt-copy)] data-[copied=true]:after:content-[attr(data-txt-copied)] ${
        className ?? ""
      }`}
    >
      {children}
    </button>
  );
};

export default WithCopy;
