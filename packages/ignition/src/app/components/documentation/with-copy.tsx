"use client";
import useClipboard from "@/hooks/use-clipboard";
import { useLocale } from "@/locales";
import { PropsWithChildrenAndLang } from "@/types";

type WithCopyProps = {
  className?: string;
  clipboardText: string;
} & PropsWithChildrenAndLang;

const WithCopy = ({
  lang,
  clipboardText,
  className,
  children,
}: WithCopyProps) => {
  const { copy, copied } = useLocale(lang).config("code-block");
  const { write, isCurrent } = useClipboard(clipboardText);

  return (
    <button
      data-copied={isCurrent()}
      data-txt-copy={copy}
      data-txt-copied={`${copied} ✓`}
      onClick={() => write()}
      onKeyDown={({ key }) => key === "c" && write()}
      className={`relative after:hidden after:absolute after:w-30 after:border-slate-700 after:rounded after:py-0.5 after:px-1 hover:after:block hover:after:bg-slate-900 hover:after:border hover:after:content-[attr(data-txt-copy)] data-[copied=true]:after:content-[attr(data-txt-copied)] ${
        className ?? ""
      }`}
    >
      {children}
    </button>
  );
};

export default WithCopy;
