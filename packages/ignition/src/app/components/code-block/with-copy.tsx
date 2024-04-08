"use client";
import useClipboard from "@/hooks/use-clipboard";
import { PropsWithChildren } from "react";

type WithCopyProps = {
  clipboardText: string;
} & PropsWithChildren;

const WithCopy = ({ clipboardText, children }: WithCopyProps) => {
  const { write, isCurrent } = useClipboard(clipboardText);
  return (
    <a
      data-copied={isCurrent()}
      onClick={() => write()}
      className="group/code-block inline-block relative min-w-32 after:hidden after:text-xs after:right-5 after:-top-1 after:absolute after:w-30 after:border-slate-700 after:rounded after:py-0.5 after:px-1 hover:after:block hover:after:bg-slate-900 hover:after:border hover:after:content-['click_to_copy'] data-[copied=true]:after:content-['copied_\2713']"
    >
      <span className="group-hover/code-block:opacity-30">{children}</span>
    </a>
  );
};

export default WithCopy;
