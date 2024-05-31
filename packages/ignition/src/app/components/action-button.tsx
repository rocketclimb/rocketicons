"use client";
import { ButtonHTMLAttributes, useRef, useState } from "react";
import useClipboard from "@/hooks/use-clipboard";
import Button from "./button";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

type Download = { data: string; fileName: string };

type DownloadActionButtonProps = {
  download: Download;
} & ActionButtonProps;

type CopyActionButtonProps = {
  clipboardText: string;
  copiedLabel: string;
} & ActionButtonProps;

function ActionButton(props: ActionButtonProps): JSX.Element;
function ActionButton(props: DownloadActionButtonProps): JSX.Element;
function ActionButton(props: CopyActionButtonProps): JSX.Element;
function ActionButton({
  children,
  className,
  ...props
}: ActionButtonProps | CopyActionButtonProps | DownloadActionButtonProps): JSX.Element {
  const { download, clipboardText, copiedLabel, ...rest } = props as DownloadActionButtonProps &
    CopyActionButtonProps;
  const ref = useRef<HTMLAnchorElement>(null);
  const [showCopiedLabel, setShowCopiedLabel] = useState<boolean>(false);
  const { write } = useClipboard(clipboardText ?? "");

  const downloadContent = (() => {
    return ({ data, fileName }: Download) => {
      const a = ref!.current!;
      const blob = new Blob([data], { type: "octet/stream" }),
        url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    };
  })();

  const copy = () => {
    if (!write) {
      return;
    }
    write();
    setShowCopiedLabel(true);
    setTimeout(() => setShowCopiedLabel(false), 2000);
  };

  return (
    <>
      <Button
        onClick={() => {
          download && downloadContent(download);
          clipboardText && copy();
        }}
        data-copy={!!clipboardText}
        className={`bg-secondary text-on-secondary hover:bg-secondary-lighter py-1 px-2 text-xs font-semibold rounded-lg data-[copy=true]:active:animate-flash-it ${className ?? ""}`}
        {...rest}
      >
        {showCopiedLabel ? <span className="capitalize">{copiedLabel}!</span> : children}
      </Button>
      {download && <a className="hidden" ref={ref} />}
    </>
  );
}

export default ActionButton;
