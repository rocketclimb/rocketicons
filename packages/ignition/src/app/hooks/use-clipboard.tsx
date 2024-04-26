"use client";
import { useState, useEffect } from "react";

class ClipboardHandler extends EventTarget {
  private currentValue: string = "";

  private emitChangedEvent() {
    this.dispatchEvent(
      new CustomEvent<string>("changed", {
        detail: this.currentValue
      })
    );
  }

  write(text: string) {
    navigator.clipboard.writeText(text);
    this.emitChangedEvent();
  }
}

const clipboard = new ClipboardHandler();

type Clipboard = {
  write: () => void;
  isCurrent: () => boolean;
};

const useClipboard = (text: string): Clipboard => {
  const [current, setCurrent] = useState<string>("");

  useEffect(() => {
    const listener = (e: any) => setCurrent(e.detail);
    clipboard.addEventListener("changed", listener);
    return () => clipboard.removeEventListener("changed", listener);
  }, []);

  return {
    write: () => {
      clipboard.write(text);
      setCurrent(text);
    },
    isCurrent: () => text === current
  };
};

export default useClipboard;
